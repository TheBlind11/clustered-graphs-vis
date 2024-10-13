class SpringEmbedder {

    constructor(graph, drawingArea) {
        this._graph = graph; // contains the graph ([nodes])
        this._drawingArea = drawingArea; // svg

        this._elasticConstant = 0.50;
        this._baseSpringLength = 100.0;
        this._interClusterSpringLength = 50.0; // Lunghezza degli archi inter-cluster più corta
        this._electrostaticConstant = 2000;
        this._maxIterations = 2000;
        this._iteration = 0;
        this._attractionClusterStrength = 5000.0;
        this._clusterBoundaryRadius = 150.0; // Raggio limite per i cluster
    }

    _drawGraph() {
        this._drawingArea.selectAll("*").remove();
        assignRandomInitialPositions(this._graph._getNodes());
        //assignRandomInitialPositions2(this._graph._getNodes(), this._graph._getClusters());
        //addFakeNodesAndLinks(this._graph);
        this._drawNodesAndLinks();
        this._timerStartMilliseconds = performance.now();
        this._computeAndDrawGraph();
    }

    _computeAndDrawGraph() {
        if (this._iterationsNewNodes === undefined)
            this._iterationsNewNodes = 0;
        
        const totalForceNewNodes = this._updateNodes();
        if (isNaN(totalForceNewNodes)) {
            console.error("Invalid totalForceNewNodes value:", totalForceNewNodes);
        }
       
        this._iterationsNewNodes += 1;
        if (this._iterationsNewNodes === this._maxIterations || totalForceNewNodes < 0.5) {
            setTimeout(this._updateNodesAndLinks.bind(this), 500);
            return;
        }
        
        const timerNowMilliseconds = performance.now();
        if (timerNowMilliseconds - this._timerStartMilliseconds > 350) {
            this._animationDuration = 2 * (timerNowMilliseconds - this._timerStartMilliseconds);
            setTimeout(this._updateNodesAndLinks.bind(this), 0);
            this._timerStartMilliseconds = timerNowMilliseconds;
        }
        
        setTimeout(this._computeAndDrawGraph.bind(this), 0);
    }

    _drawNodesAndLinks() {
        this._drawingArea.selectAll("path")
            .data(this._graph._getLinks())
            .enter()
            .append("path")
            .attr("stroke-width", 1)
            .attr("stroke", "#999")
            .attr("fill", "transparent")
            .attr("class", "links")
            .attr("d", (link) => {
                const sourceNode = this._graph._getNodeById(link.source);
                const targetNode = this._graph._getNodeById(link.target);
                return `M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`;
            });

        var color = d3.scaleOrdinal(d3.schemeCategory10);

        this._drawingArea.selectAll("circle")
            .data(this._graph._getNodes())
            .enter()
            .append("circle")
            .attr("fill", "#E00000")
            .attr("fill-opacity", false)
            .attr("fill", node => {
                return color(node.cluster);
            })
            .attr("r", 5)
            .attr("cx", node => node.x)
            .attr("cy", node => node.y);
    }

    _updateNodesAndLinks() {
        this._drawingArea.selectAll("path")
            .data(this._graph._getLinks())
            .attr("class", "links")
            .transition().duration(250)
            .attr("d", (link) => {
                const sourceNode = this._graph._getNodeById(link.source);
                const targetNode = this._graph._getNodeById(link.target);
                return `M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`;
            });

        this._drawingArea.selectAll("circle")
            .data(this._graph._getNodes())
            .transition().duration(250)
            .attr("cx", node => node.x)
            .attr("cy", node => node.y);
    }

    // Function to compute the spring force on a single node due to its neighbors
    _computeSpringForce(node) {
        let spring_force_x = 0.0;
        let spring_force_y = 0.0;
        
        const neighbors = this._graph._getNeighborsById(node.id);
        neighbors.forEach( neighbor => {
            // Impostiamo una lunghezza diversa se l'arco è inter-cluster
            const isInterCluster = node.cluster !== neighbor.cluster;
            const springLength = isInterCluster ? this._interClusterSpringLength : this._baseSpringLength;

            const d = distance(node, neighbor);
            const force_magnitude = this._elasticConstant * (springLength - d);
            const delta_x = node.x - neighbor.x;
            const delta_y = node.y - neighbor.y;
            spring_force_x += force_magnitude * (delta_x / d);
            spring_force_y += force_magnitude * (delta_y / d);
        });

        return { x: spring_force_x, y: spring_force_y };
    }

    // Function to compute the electrostatic force on a single node due to all the other nodes (true and fake)
    _computeElectrostaticForce(node) {
        let nodes = this._graph._getNodes();
        let electro_force_x = 0.0;
        let electro_force_y = 0.0;
        
        nodes.forEach((otherNode) => {
            if (otherNode.id === node.id) 
                return; 
            
            const d = distance(node, otherNode);
            const force_magnitude = this._electrostaticConstant / (d * d);
            const delta_x = node.x - otherNode.x;
            const delta_y = node.y - otherNode.y;
            electro_force_x += force_magnitude * (delta_x / d);
            electro_force_y += force_magnitude * (delta_y / d);
        });
        
        return { x: electro_force_x, y: electro_force_y };
    }

    /* _computeContainmentForce(node) {
        let containmentForceX = 0.0;
        let containmentForceY = 0.0;

        // Se il nodo è fittizio, non applichiamo la forza di contenimento
        if (node.fake) {
            return { x: 0.0, y: 0.0 };
        }

        // Trova i nodi fittizi del cluster a cui appartiene il nodo reale
        const fakeNodes = this._graph._getNodes().filter(otherNode => otherNode.fake && otherNode.cluster === node.cluster);

        // Calcola la distanza minima tra il nodo reale e i nodi fittizi del suo cluster
        fakeNodes.forEach(fakeNode => {
            const d = distance(node, fakeNode);
            const boundaryDistance = this._baseSpringLength * 1.5; // Definisce il raggio del "recinto" fittizio

            if (d > boundaryDistance) {
                // Se il nodo è oltre il perimetro del cluster, applichiamo una forza di contenimento
                let forceMagnitude = this._attractionClusterStrength / (d * d);

                // Limitiamo la forza di contenimento per evitare instabilità
                const maxContainmentForce = 10;  // Valore da regolare in base alle esigenze
                if (forceMagnitude > maxContainmentForce) {
                    forceMagnitude = maxContainmentForce;
                }

                const deltaX = fakeNode.x - node.x;
                const deltaY = fakeNode.y - node.y;
                containmentForceX += forceMagnitude * deltaX;
                containmentForceY += forceMagnitude * deltaY;
            }
        });

        return { x: containmentForceX, y: containmentForceY };
    } */

    /* _computeFakeNodeRingForce(node) {
        let ringForceX = 0.0;
        let ringForceY = 0.0;

        // Solo i nodi fittizi devono essere influenzati da questa forza
        if (!node.fake) {
            return { x: 0.0, y: 0.0 };
        }

        // Trova i vicini fittizi di questo nodo
        const neighbors = this._graph._getNeighborsById(node.id);
        neighbors.forEach(id => {
            const neighbor = this._graph._getNodeById(id);
            if (neighbor.fake) {
                const d = distance(node, neighbor);
                const targetDistance = this._baseSpringLength; // Distanza desiderata tra i nodi fittizi
                const forceMagnitude = this._elasticConstant * (d - targetDistance);
                const deltaX = neighbor.x - node.x;
                const deltaY = neighbor.y - node.y;
                ringForceX += forceMagnitude * (deltaX / d);
                ringForceY += forceMagnitude * (deltaY / d);
            }
        });

        return { x: ringForceX, y: ringForceY };
    } */

    /* _computeClusterForce(node) {
        const cluster = this._graph._getClusterById(node.cluster);
        const clusterCenter = calculateClusterCenter(cluster);
        let attraction_x = 0.0;
        let attraction_y = 0.0;
        
        cluster.nodes.forEach((otherNode) => {
            if (otherNode.fake === true && node.fake === false) {
                const d = distance(node, otherNode);
                const force_magnitude = this._attractionClusterStrength / (d * d);
                const dx = clusterCenter.x - node.x;
                const dy = clusterCenter.y - node.y;
                attraction_x += force_magnitude * (dx / d);
                attraction_y += force_magnitude * (dy / d);
            }
        });

        if (!node.fake) {
            // Nodi veri: forza attrattiva verso il centro del cluster
            const dx = clusterCenter.x - node.x;
            const dy = clusterCenter.y - node.y;
            const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
            const boundaryRadius = this._baseSpringLength * 1.5;

            if (distanceToCenter > boundaryRadius) {
                const force_magnitude = this._attractionClusterStrength / (distanceToCenter * distanceToCenter);
                attraction_x = force_magnitude * dx;
                attraction_y = force_magnitude * dy;
            } else {
                const repelForce = this._elasticConstant * (boundaryRadius - distanceToCenter);
                attraction_x = repelForce * (dx / distanceToCenter);
                attraction_y = repelForce * (dy / distanceToCenter);
            }
        } else {
            // Nodi fittizi: forza attrattiva centripeta verso il centro del cluster
            const center_dx = clusterCenter.x - node.x;
            const center_dy = clusterCenter.y - node.y;
            const centerDistance = Math.sqrt(center_dx * center_dx + center_dy * center_dy);

            const centerForceMagnitude = this._attractionClusterStrength / (centerDistance * centerDistance);
            attraction_x += centerForceMagnitude * center_dx;
            attraction_y += centerForceMagnitude * center_dy;

            // Anello: forza tra i nodi fittizi
            const neighbors = this._graph._getNeighborsById(node.id);
            neighbors.forEach(id => {
                const neighbor = this._graph._getNodeById(id);
                if (neighbor.fake) {
                    const d = distance(node, neighbor);
                    const targetDistance = this._baseSpringLength;
                    const force_magnitude = this._elasticConstant * (d - targetDistance);
                    const delta_x = neighbor.x - node.x;
                    const delta_y = neighbor.y - node.y;
                    attraction_x += force_magnitude * (delta_x / d);
                    attraction_y += force_magnitude * (delta_y / d);
                }
            });
        }
        
        return { x: attraction_x, y: attraction_y };
    } */

    // Calcolo della forza attrattiva che mantiene i nodi vicini al centro del cluster
/*     _computeClusterForce(node) {
        const cluster = this._graph._getClusterById(node.cluster);
        const clusterCenter = calculateClusterCenter(cluster);
        let attraction_x = 0.0;
        let attraction_y = 0.0;

        const dx = clusterCenter.x - node.x;
        const dy = clusterCenter.y - node.y;
        const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
        const boundaryRadius = this._baseSpringLength * 1.5;

        if (distanceToCenter > boundaryRadius) {
            const force_magnitude = this._attractionClusterStrength / (distanceToCenter * distanceToCenter);
            attraction_x = force_magnitude * dx;
            attraction_y = force_magnitude * dy;
        } else {
            const repelForce = this._elasticConstant * (boundaryRadius - distanceToCenter);
            attraction_x = repelForce * (dx / distanceToCenter);
            attraction_y = repelForce * (dy / distanceToCenter);
        }

        return { x: attraction_x, y: attraction_y };
    } */

    // Calcolo della forza di contenimento del cluster
    _computeClusterBoundaryForce(node) {
        const cluster = this._graph._getClusterById(node.cluster);
        const clusterCenter = calculateClusterCenter(cluster);

        const distanceToCenter = distance(node, clusterCenter);

        // Se il nodo è fuori dal raggio del cluster, applichiamo una forza di contenimento
        if (distanceToCenter > this._clusterBoundaryRadius) {
            const forceMagnitude = this._attractionClusterStrength / (distanceToCenter * distanceToCenter);
            const containmentForceX = forceMagnitude * (clusterCenter.x - node.x);
            const containmentForceY = forceMagnitude * (clusterCenter.y - node.y);
            return { x: containmentForceX, y: containmentForceY };
        }

        return { x: 0, y: 0 };
    }


    // Function to update every node (true and fake) position
    _updateNodes() {
        let nodes = this._graph._getNodes();
        let total_force = 0.0;
        
        nodes.forEach(node => {
            const spring_force = this._computeSpringForce(node);
            const electro_force = this._computeElectrostaticForce(node);
            //const center_force = this._computeClusterForce(node);
            //const containmentForce = this._computeContainmentForce(node);
            //const ringForce = node.fake ? this._computeFakeNodeRingForce(node) : { x: 0.0, y: 0.0 };
            //const cluster_boundary_force = this._computeClusterBoundaryForce(node); // nuova forza di contenimento

            let total_force_x = spring_force.x + electro_force.x;
            let total_force_y = spring_force.y + electro_force.y;

            //let total_force_x = spring_force.x + electro_force.x + cluster_boundary_force.x;
            //let total_force_y = spring_force.y + electro_force.y + cluster_boundary_force.y;

            node.x += total_force_x;
            node.y += total_force_y;
            total_force += (Math.abs(total_force_x) + Math.abs(total_force_y));
        });

        return total_force;
    }

    _computeNodesPositions() {
        let iterationsNewNodes = 0;
        while (true) {
            const totalForceNewNodes = this._updateNodes();
            iterationsNewNodes += 1;
            if (iterationsNewNodes === this._maxIterations || totalForceNewNodes < 0.5)
                break;
        }
    }

}