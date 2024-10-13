class Graph {

    constructor(data) {
        this._nodes = [];
        this._links = [];

        // Initialize the nodes with their properties
        data.nodes.forEach(node => {
            this._nodes.push({
                id: node.id,
                neighbors: [],
                cluster: node.cluster,
                fake: false
            });
        });

        // Add neighbors of each node based on the links
        data.links.forEach(link => {
            let sourceNode = this._nodes.find((node) => node.id === link.source);
            let targetNode = this._nodes.find((node) => node.id === link.target);

            // Add each node as a neighbor to the other
            sourceNode.neighbors.push(targetNode.id);
            targetNode.neighbors.push(sourceNode.id);
            
            this._links.push({
                source: sourceNode.id,
                target: targetNode.id
            });
        });

    }

    // Function to get all the nodes of the graph
    _getNodes() {
        return this._nodes;
    }

    _getNumberOfNodes() {
        return this._nodes.length;
    }

    // Function to get a node by its id
    _getNodeById(id) {
        return this._nodes.find((node) => node.id === id);
    }

    // Function to get the of neighbors of a node
    _getNeighborsById(id) {
        const node = this._getNodeById(id);
        return node.neighbors.map( neighborId => {
            const neighborNode = this._getNodeById(neighborId);
            return {
                id: neighborNode.id,
                cluster: neighborNode.cluster,
                x: neighborNode.x, // eventuali altre proprietà del nodo
                y: neighborNode.y  // puoi aggiungere o rimuovere altre proprietà come preferisci
            };
        });
    }

    _getLinks() {
        return this._links;
    }

    _getNumberOfClusters() {
        let uniqueClusters = [...new Set(this._nodes.map(node => node.cluster))];

        return uniqueClusters.length;
    }

    _getClusters() {
        let clusters = [];

        for (let i = 1; i < this._getNumberOfClusters() + 1; i++) {
            this._nodes.forEach( node => {
                if (node.fake === false) {
                    let cluster = clusters.find((cluster) => cluster.id === i);
                    if (node.cluster === i) {
                        if (cluster)
                            cluster.nodes.push(node);
                        else
                            clusters.push({
                                id: i,
                                nodes: [node]
                            });
                    }  
                }   
            });
        }

        return clusters;
    }

    _getClusterById(id) {
        return { id: id, nodes: this._nodes.filter((node) => node.cluster === id) };
    }

    // Function to get all the fake nodes
    _getFakeNodes() {
        return this._nodes.filter((node) => node.fake);
    }

    // Function to add a fake node
    _addFakeNode(node) {
        const fakeNodeId = this._nodes.length + 1;

        this._nodes.push({
            id: fakeNodeId,
            neighbors: [],
            cluster: node.cluster,
            fake: true,
            x: node.x,
            y: node.y
        });

        return fakeNodeId;
    }

    // Function to add a fake link between two fake nodes
    _addFakeLink(link) {   
        this._nodes
            .find((node) => node.id === link.source)
            .neighbors.push(link.target);
        this._nodes
            .find((node) => node.id === link.target)
            .neighbors.push(link.source);

        this._links.push({
            source: link.source,
            target: link.target
        });
    }

}