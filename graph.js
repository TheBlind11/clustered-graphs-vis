class Graph {

    constructor(data) {
        this._nodes = []

        // Initialize the nodes with their properties
        data.nodes.forEach(node => {
            this._nodes.push({
                id: node.id,
                x: node.x,
                y: node.y,
                neighbors: [],
                cluster: node.cluster,
                fake: false,
            });
        });

        // Add neighbors of each node based on the links
        data.links.forEach(link => {
            let sourceNode = this._nodes.find((node) => node.id === link.source);
            let targetNode = this._nodes.find((node) => node.id === link.target);

            // Add each node as a neighbor to the other
            sourceNode.neighbors.push(targetNode.id);
            targetNode.neighbors.push(sourceNode.id);
        });
    }

    // Function to get all the nodes of the graph
    _getNodes() {
        return this._nodes;
    }

    // Function to get a node by its id
    _getNodeById(id) {
        return this._nodes.find((node) => node.id === id);
    }

    // Function to get the of neighbors of a node
    _getNeighborsById(id) {
        return this._getNodeById(id).neighbors;
    }

}