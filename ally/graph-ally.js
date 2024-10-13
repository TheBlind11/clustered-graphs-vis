export const { innerHeight: height, innerWidth: width } = window;

export default  class Graph {
    constructor() {
        this._dataNodes = [];
        this._id = 0;
    }

    get dataNodes() {
        return this._dataNodes;
    }

    set dataNodes(nodes) {
        this._dataNodes = nodes;
    }

    getNodeById(id) {
        return this._dataNodes.find(node => node.id === id);
    }

    getFakeNodes() {
        return this._dataNodes.filter(node => node.fake);
    }

    addNode(x, y, fake, clusterId) {
        const id = this._id++;
        const newNode = { id, x, y, fake, cluster: clusterId, neighbors: [] };
        this._dataNodes.push(newNode);
        return id;
    }

    addLink(sourceNodeId, targetNodeId) {
        const sourceNode = this.getNodeById(sourceNodeId);
        const targetNode = this.getNodeById(targetNodeId);
        if (sourceNode && targetNode) {
            sourceNode.neighbors.push(targetNodeId);
            targetNode.neighbors.push(sourceNodeId);
        }
    }

    addFakeNodeBetween(sourceNode, targetNode, maxSpringLength) {
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const distance = Math.hypot(dx, dy);

        // console.log(`${distance} > ${maxSpringLength}`);
        if (distance > maxSpringLength) {
            sourceNode.neighbors = sourceNode.neighbors.filter(id => id !== targetNode.id);
            targetNode.neighbors = targetNode.neighbors.filter(id => id !== sourceNode.id);

            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;

            const fakeNodeId = this.addNode(midX, midY, true, sourceNode.cluster);
            console.log("Added fake node with id", fakeNodeId);

            this.addLink(sourceNode.id, fakeNodeId);
            this.addLink(fakeNodeId, targetNode.id);

            return fakeNodeId;
        }
    }

    removeFakeNodeBetween(nodeToRemove, neighbor1, neighbor2, minSpringLength) {
        if (!neighbor1 || !neighbor2) {
            console.log("Neighbor is undefined");
            return;
        }

        const dx = neighbor1.x - neighbor2.x;
        const dy = neighbor1.y - neighbor2.y;
        const distance = Math.hypot(dx, dy);

        // console.log(`${distance} < ${minSpringLength}`);
        if (distance < minSpringLength) {
            this.dataNodes = this.dataNodes.filter(node => node.id !== nodeToRemove.id);

            this._dataNodes.forEach(node => {
                node.neighbors = node.neighbors.filter(id => id !== nodeToRemove.id);
            });

            this.addLink(neighbor1.id, neighbor2.id);
            console.log("Removed fake node with id", nodeToRemove.id);
        }
    }

 addRemoveNodes(cluster, springEmbedder) {
    cluster.forEach(node => {
        if (node.fake) {
            node.neighbors.forEach(neighborId => {
                const neighbor = this.getNodeById(neighborId);
                if (neighbor) {
                    this.addFakeNodeBetween(node, neighbor, springEmbedder.maxSpringLength);
                } else {
                    console.error("Neighbor is undefined", cluster);
                }
            });
        }
    });

    const fakeNodes = this.getFakeNodes();
    fakeNodes.forEach(node => {
        const [neighborId1, neighborId2] = node.neighbors;
        const neighbor1 = this.getNodeById(neighborId1);
        const neighbor2 = this.getNodeById(neighborId2);

        if (neighbor1 && neighbor2) {
            this.removeFakeNodeBetween(node, neighbor1, neighbor2, springEmbedder.minSpringLength);
        } else {
            console.error("Neighbor is undefined for fake node", node);
        }
    });
}

tuneFakeNodes(springEmbedder) {
    const clusters = d3.group(this.dataNodes, node => node.cluster);

    for (const [clusterId, cluster] of clusters.entries()) {
        this.addRemoveNodes(cluster, springEmbedder);          
    }
}


    drawGraph() {
        const t = d3.transition().duration(1000);
        const t_exit = d3.transition().duration(100);
        const svg = d3.select("svg");
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const links = this._dataNodes.flatMap(node =>
            node.neighbors
                .map(nId => ({ source: node, target: this.getNodeById(nId) }))
                .filter(link => link.source.id < link.target.id && link.target)
        );

        svg.selectAll("line")
        .data(links)
        .join(
            (enter) => enter
                .append("line")
                .attr("stroke", "#B9BEC4")
                .attr("stroke-width", 2)
                .transition(t)
                .attr("x1", (link) => link.source.x)
                .attr("y1", (link) => link.source.y)
                .attr("x2", (link) => link.target.x)
                .attr("y2", (link) => link.target.y),
            (update) => update
                .transition(t)
                .attr("x1", (link) => link.source.x)
                .attr("y1", (link) => link.source.y)
                .attr("x2", (link) => link.target.x)
                .attr("y2", (link) => link.target.y),
            (exit) => exit
                .remove());

    svg
        .selectAll("circle")
        .data(this.dataNodes, (node) => node.id)
        .join(
            (enter) => enter
                .append("circle")
                .attr("fill", (node) => {
                    if (node.fake) {
                      return color(node.cluster); 
                    } else {
                      return "black"; 
                    }
                  })
                .attr("r", 5)
                .transition(t)
                .attr("cx", (node) => node.x)
                .attr("cy", (node) => node.y),
            (update) => update
                .transition(t)
                .attr("fill", (node) => {
                    if (node.fake) {
                      return color(node.cluster); 
                    } else {
                      return "black"; 
                    }
                  })
                .attr("cx", (node) => node.x)
                .attr("cy", (node) => node.y),
            (exit) => exit
                .transition(t_exit)
                .attr("fill", "red")
                .remove()
        );

        /*
    svg
        .selectAll("text")
        .data(this._dataNodes, (node) => node.id)
        .join(
            (enter) => enter.append("text")
                .transition(t)
                .attr("x", (node) => node.x)
                .attr("y", (node) => node.y)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .text((node) => node.id),
            (update) => update
                .transition(t)
                .attr("x", (node) => node.x)
                .attr("y", (node) => node.y)
                .style("fill", "white"),
            (exit) => exit
                .transition(t)
                .attr("fill", "white")
                .remove()
        );*/
    }
}

