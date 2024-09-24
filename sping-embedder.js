class SpringEmbedder {

    constructor(graph, drawingArea) {
        this._graph = graph; // contains the graph ([nodes])
        this._drawingArea = drawingArea; // svg

        this._springLength = 10; 
        this._springStiffness = 0.8;
        this._chargeIntensity = 6000;
    }

    // Function to get all the fake nodes
    _getFakeNodes() {
        return this._graph._getNodes().filter((node) => node.fake);
    }

    // Function to add a fake node
    _addFakeNode(x, y, clusterId) {
        let nodes = this._graph._getNodes();
        const id = nodes.length++;
        
        nodes.push({ id: id, 
                     x: x, 
                     y: y, 
                     fake: true, 
                     cluster: clusterId, 
                     neighbors: [] });
        
        return id;
    }

    // Function to add a fake link between two fake nodes
    _addFakeLink(sourceNodeId, targetNodeId) {
        let nodes = this._graph._getNodes();

        nodes
            .find((node) => node.id === sourceNodeId)
            .neighbors.push(targetNodeId);
        nodes
            .find((node) => node.id === targetNodeId)
            .neighbors.push(sourceNodeId);
    }

    // Function to compute the spring force on a single node due to its neighbors
    _computeSpringForce(node) {
        let spring_force_x = 0.0;
        let spring_force_y = 0.0;
        
        const neighbors = this._graph._getNeighborsById(node.id);
        neighbors.forEach((neighbor) => {
            const d = distance(node, neighbor);
            const force_magnitude = this._springStiffness * (this._springLength - d);
            const delta_x = node.x - neighbor.x;
            const delta_y = node.y - neighbor.y;
            spring_force_x = force_magnitude * (delta_x / d);
            spring_force_y = force_magnitude * (delta_y / d);
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
            const force_magnitude = this._chargeIntensity / (Math.pow(d, 2));
            const delta_x = node.x - otherNode.x;
            const delta_y = node.y - otherNode.y;
            electro_force_x += force_magnitude * (delta_x / d);
            electro_force_y += force_magnitude * (delta_y / d);
        });
        
        return { x: x_force, y: y_force };
    }

    // Function to update every node (true and fake) position
    _updateNodes() {
        let nodes = this._graph._getNodes();
        let total_force = 0.0;
        
        nodes.forEach((node) => {
            const spring_force = this._computeSpringForce(node);
            const electro_force = this._computeElectrostaticForce(node);
            let total_force_x = spring_force.x + electro_force.x;
            let total_force_y = spring_force.y + electro_force.y;
            node.x += total_force_x;
            node.y += total_force_y;
            total_force += (Math.abs(total_force_x) + Math.abs(total_force_y));
        });

        return total_force;
    }

    /* // Function to initialize fake nodes for clusters
    _initializeFakeNodes() {
        let cluster_center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };  // Example center
        this._createFakeNodesForCluster(cluster_center, 12, 200);  // Adjust the number and radius
    } */

    /* 
    _createFakeNodesForCluster(cluster_center, num_fake_nodes = 10, radius = 200) {
        let angle_step = (2 * Math.PI) / num_fake_nodes;
        let fake_nodes = [];

        for (let i = 0; i < num_fake_nodes; i++) {
            let angle = i * angle_step;
            let x = cluster_center.x + radius * Math.cos(angle);
            let y = cluster_center.y + radius * Math.sin(angle);

            let fake_node = { id: `fake_${i}`, x: x, y: y, cluster: true }; // Create fake node
            this._nodes.push(fake_node);

            // Connect fake nodes with links to form a circular chain
            if (i > 0) {
                this._links.push({
                    source: fake_nodes[i - 1].id,
                    target: fake_node.id,
                    type: false
                });
            }

            fake_nodes.push(fake_node);
        }

        // Close the circle by connecting the last fake node with the first
        this._links.push({
            source: fake_nodes[fake_nodes.length - 1].id,
            target: fake_nodes[0].id,
            type: false
        });

        return fake_nodes;
    } 
    */

}