class SpringEmbedder {

    constructor(graph, drawingArea) {
        this._graph = graph;
        this._drawingArea = drawingArea;

        this._elasticConstant = 0.15;
        this._interClusterSpringLength = 80.0;
        this._baseSpringLength = 60.0;
        
        this._electrostaticConstant = 400;
        
        this._attractionClusterStrength = 7.0;
        this._clusterBoundaryRadius = 120.0;
        
        this._maxIterations = 2000;
    }

    _drawGraph() {
        this._drawingArea.selectAll("*").remove();
        
        this._graph._initializeGraph();
        this._drawNodesAndLinks();
        
        this._timerStartMilliseconds = performance.now();
        this._computeAndDrawGraph();
    }

    _computeAndDrawGraph() {
        if (this._iteration === undefined)
            this._iteration = 0;
        
        const totalForce = this._updateNodes();
        if (isNaN(totalForce)) {
            console.error("Invalid totalForce value:", totalForce);
        }
       
        this._iteration += 1;
        if (this._iteration === this._maxIterations || totalForce < 0.5) {
            setTimeout(this._updateNodesAndLinks.bind(this), 500);
            return;
        }
        
        const timerNowMilliseconds = performance.now();
        if (timerNowMilliseconds - this._timerStartMilliseconds > 350) {
            this._animationDuration = 2 * (timerNowMilliseconds - this._timerStartMilliseconds);
            setTimeout(this._updateNodesAndLinks.bind(this), this._animationDuration);
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
            .transition().duration(2500)
            .attr("d", (link) => {
                const sourceNode = this._graph._getNodeById(link.source);
                const targetNode = this._graph._getNodeById(link.target);
                return `M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`;
            });

        this._drawingArea.selectAll("circle")
            .data(this._graph._getNodes())
            .transition().duration(2500)
            .attr("cx", node => node.x)
            .attr("cy", node => node.y);
    }

    // Function to compute the spring force on a single node due to its neighbors
    _computeSpringForce(node) {
        let spring_force_x = 0.0;
        let spring_force_y = 0.0;
        const epsilon = 0.0001;
        
        const neighbors = this._graph._getNeighborsById(node.id);
        neighbors.forEach( neighbor => {
            const isInterCluster = node.cluster !== neighbor.cluster;
            const springLength = isInterCluster ? this._interClusterSpringLength : this._baseSpringLength;

            const d = Math.max(distance(node, neighbor), epsilon);
            const elasticConstant = isInterCluster ? this._elasticConstant : this._elasticConstant * 0.50;  // Riduci la forza per nodi nello stesso cluster
            const force_magnitude = elasticConstant * (springLength - d);
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
        const epsilon = 0.0001;
        
        nodes.forEach((otherNode) => {
            if (otherNode.id === node.id) 
                return; 
            
            const d = Math.max(distance(node, otherNode), epsilon);
            const force_magnitude = this._electrostaticConstant / (d * d);
            const delta_x = node.x - otherNode.x;
            const delta_y = node.y - otherNode.y;
            electro_force_x += force_magnitude * (delta_x / d);
            electro_force_y += force_magnitude * (delta_y / d);
        });
        
        return { x: electro_force_x, y: electro_force_y };
    }

    /* _computeContainmentForce(node) {
        const clusterFakeNodes = this._graph._getFakeNodesOfCluster(node.cluster);
        let containmentForceX = 0.0;
        let containmentForceY = 0.0;

        const centerX = clusterFakeNodes.reduce((sum, fn) => sum + fn.x, 0) / clusterFakeNodes.length;
        const centerY = clusterFakeNodes.reduce((sum, fn) => sum + fn.y, 0) / clusterFakeNodes.length;

        const distToCenter = distance(node, { x: centerX, y: centerY });
        const containmentStrength = this._attractionClusterStrength * 0.01 * (this._clusterBoundaryRadius - distToCenter);

        if (distToCenter >= this._clusterBoundaryRadius) {
            containmentForceX += (centerX - node.x) * containmentStrength * 2.0 / distToCenter;
            containmentForceY += (centerY - node.y) * containmentStrength * 2.0 / distToCenter;
        } else {
            containmentForceX += (centerX - node.x) * containmentStrength / distToCenter;
            containmentForceY += (centerY - node.y) * containmentStrength / distToCenter;
        }

        return { x: containmentForceX, y: containmentForceY };
    } */ 

    _computeContainmentForce(node, clusterCenter) {
        const clusterFakeNodes = this._graph._getFakeNodesOfCluster(node.cluster);
        const centerX = clusterFakeNodes.reduce((sum, fn) => sum + fn.x, 0) / clusterFakeNodes.length;
        const centerY = clusterFakeNodes.reduce((sum, fn) => sum + fn.y, 0) / clusterFakeNodes.length;
        const deltaX = centerX - node.x;
        const deltaY = centerY - node.y;
        const distToCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Se il nodo è fuori dal raggio limite, applichiamo una forza crescente per riportarlo all'interno
        const containmentStrength = this._attractionClusterStrength * Math.pow((distToCenter / this._clusterBoundaryRadius), 2);

        return {
            x: containmentStrength * deltaX / distToCenter,
            y: containmentStrength * deltaY / distToCenter
        };
    }

    _computeCenteringForce(node) {
        let centering_force_x = 0.0;
        let centering_force_y = 0.0;
        const epsilon = 0.0001;

        // Calcola la differenza tra la posizione del nodo e il centro
        const delta_x = (boardWidth / 2) - node.x;
        const delta_y = (boardHeight / 2) - node.y;

        // Calcola la distanza del nodo dal centro
        const dist = Math.max(Math.sqrt(delta_x * delta_x + delta_y * delta_y), epsilon);

        // Definisci una costante per la forza di centratura
        //const centeringStrength = 0.45; // Modifica questo valore per regolare la forza
        const centeringStrength = 0.75; // Modifica questo valore per regolare la forza

        // La forza di centratura è proporzionale alla distanza
        centering_force_x = centeringStrength * delta_x / dist;
        centering_force_y = centeringStrength * delta_y / dist;

        return { x: centering_force_x, y: centering_force_y };
    }

    _computeClusterCenteringForce(node, clusterCenter) {
        const epsilon = 0.0001;
        const deltaX = clusterCenter.x - node.x;
        const deltaY = clusterCenter.y - node.y;
        const dist = Math.max(distance(clusterCenter, node), epsilon);

        const centeringStrength = 0.50;  // Costante di forza di centratura

        return {
            x: centeringStrength * deltaX / dist,
            y: centeringStrength * deltaY / dist
        };
    }


    // Function to update every node (true and fake) position
    /* _updateNodes() {
        let nodes = this._graph._getNodes();
        let total_force = 0.0;
        
        nodes.forEach(node => {
            const spring_force = this._computeSpringForce(node);
            const electro_force = this._computeElectrostaticForce(node);
            const containment_force = this._computeContainmentForce(node);
            const centering_force = this._computeCenteringForce(node);

            let total_force_x = spring_force.x + electro_force.x + containment_force.x + centering_force.x;
            let total_force_y = spring_force.y + electro_force.y + containment_force.y + centering_force.y;

            node.x += total_force_x;
            node.y += total_force_y;
            total_force += (Math.abs(total_force_x) + Math.abs(total_force_y));
        });

        this._graph._getClusters().forEach( cluster => {
            const realClusterNodes = this._graph._getNodesOfCluster(cluster.id);
            const centerX = realClusterNodes.reduce((sum, n) => sum + n.x, 0) / realClusterNodes.length;
            const centerY = realClusterNodes.reduce((sum, n) => sum + n.y, 0) / realClusterNodes.length;

            const fakeNodes = this._graph._getFakeNodesOfCluster(cluster.id);
            maintainCircularChain(fakeNodes, centerX, centerY, this._clusterBoundaryRadius);
        });

        return total_force;
    } */

    _updateNodes() {
        let clusters = this._graph._getClusters();
        let total_force = 0.0;

        clusters.forEach(cluster => {
            const nodesInCluster = this._graph._getNodesOfCluster(cluster.id);
            const fakeNodesInCluster = this._graph._getFakeNodesOfCluster(cluster.id); // Suppongo che tu abbia questa funzione
            const clusterCenter = computeClusterCenter(nodesInCluster);

            nodesInCluster.forEach( node => {
                const spring_force = this._computeSpringForce(node);
                const electro_force = this._computeElectrostaticForce(node);
                const containment_force = this._computeContainmentForce(node);
                const centering_force = this._computeCenteringForce(node);
                //const cluster_centering_force = this._computeClusterCenteringForce(node, clusterCenter);

                // Somma di tutte le forze
                let total_force_x = spring_force.x + electro_force.x + centering_force.x + containment_force.x;
                let total_force_y = spring_force.y + electro_force.y + centering_force.y + containment_force.y;

                // Applica le forze ai nodi
                node.x += total_force_x;
                node.y += total_force_y;
                total_force += (Math.abs(total_force_x) + Math.abs(total_force_y));
            });

            // Applica le forze anche ai nodi fittizi
            fakeNodesInCluster.forEach( fakeNode => {
                const spring_force = this._computeSpringForce(fakeNode);  // Calcola la forza elastica tra nodi fittizi e reali
                const electro_force = this._computeElectrostaticForce(fakeNode);  // Calcola la forza elettrostatica tra nodi fittizi e reali
                const centering_force = this._computeCenteringForce(fakeNode);  // Forza di centratura verso il centro del disegno

                // Somma di tutte le forze per i nodi fittizi
                let total_force_x = spring_force.x + electro_force.x + centering_force.x;
                let total_force_y = spring_force.y + electro_force.y + centering_force.y;

                // Applica le forze ai nodi fittizi
                fakeNode.x += total_force_x;
                fakeNode.y += total_force_y;
                total_force += (Math.abs(total_force_x) + Math.abs(total_force_y));
            });
        });

        console.log(total_force);
        return total_force;
    }
}