class Graph {

    constructor(data) {
        this._nodes = [];
        this._links = [];
        this._clusterRadius = 100;
        this._chainRadius = 120;
        this._numFakeNodes = 10; 

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
        return this._nodes.find( node => node.id === id);
    }

    // Function to get the of neighbors of a node
    _getNeighborsById(id) {
        const node = this._getNodeById(id);
        return node.neighbors.map( neighborId => {
            const neighborNode = this._getNodeById(neighborId);
            return {
                id: neighborNode.id,
                cluster: neighborNode.cluster,
                x: neighborNode.x,
                y: neighborNode.y,
                fake: neighborNode.fake
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
        return { id: id, nodes: this._nodes.filter( node => node.cluster === id && !node.fake) };
    }

    _getNodesOfCluster(clusterId) {
        return this._nodes.filter(node => node.cluster === clusterId && !node.fake);
    }

    // Function to get all the fake nodes
    _getFakeNodes() {
        return this._nodes.filter((node) => node.fake);
    }

    _getFakeNodesOfCluster(clusterId) {
        return this._nodes.filter(node => node.cluster === clusterId && node.fake);
    }

    // Function to add a fake node
    _addFakeNode(node) {
        const fakeNodeId = (this._nodes.length + 1).toString();

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

    _placeClusterNodes(cluster, centerX, centerY) {
        const minDistance = 50.0;
        
        cluster.nodes.forEach(node => {
            let placed = false;

            while (!placed) { 
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.random() * this._clusterRadius;
                node.x = centerX + Math.cos(angle) * radius;
                node.y = centerY + Math.sin(angle) * radius;

                let isOverlapping = false;
                for (let otherNode of this._nodes) {
                    if(otherNode.id != node.id && otherNode.cluster != node.cluster) {
                        if(otherNode.x != undefined && otherNode.y != undefined) {
                            const d = distance(node, otherNode);
                            if (d < minDistance) {
                                isOverlapping = true;
                                break;
                            }
                        }
                    }
                }

                if (!isOverlapping) {
                    placed = true;
                }
            }
        });
    }

    _createFakeChain(clusterId, centerX, centerY) {
        let fakeNodes = [];
        let previousNodeId = null;
        let firstNodeId = null;

        for (let i = 0; i < this._numFakeNodes; i++) {
            const angle = (i / this._numFakeNodes) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * this._chainRadius;
            const y = centerY + Math.sin(angle) * this._chainRadius;
            const node = { cluster: clusterId, x: x, y: y };
            const fakeNodeId = this._addFakeNode(node);

            if (i === 0)
                firstNodeId = fakeNodeId;
            else
                this._addFakeLink({ source: previousNodeId, target: fakeNodeId });

            previousNodeId = fakeNodeId;
        }

        if (firstNodeId) {
            this._addFakeLink({ source: previousNodeId, target: firstNodeId });
        }
        
        return fakeNodes;
    }

    _initializeGraph() {
        const clusters = this._getClusters();
        clusters.forEach( cluster => {
            const centerX = Math.random() * (boardWidth - 2 * this._chainRadius) + this._chainRadius;
            const centerY = Math.random() * (boardHeight - 2 * this._chainRadius) + this._chainRadius;

            this._placeClusterNodes(cluster, centerX, centerY);
            this._createFakeChain(cluster.id, centerX, centerY);
        });
    }

}