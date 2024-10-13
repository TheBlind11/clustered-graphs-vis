import { width, height } from "./graph.js";
export function calculateCenter(cluster) {
    let centerX = 0;
    let centerY = 0;

    cluster.forEach(({ x, y }) => {
        centerX += x;
        centerY += y;
    });

    centerX /= cluster.length;
    centerY /= cluster.length;

    return { centerX, centerY };
}


export function calculateMax(cluster) {
    let meanDistance = 0;
    let pairCount = 0;
    let maxDistance = 0;

    for (let i = 0; i < cluster.length; i++) {
        for (let j = i + 1; j < cluster.length; j++) {
            const { x: x1, y: y1 } = cluster[i];
            const { x: x2, y: y2 } = cluster[j];

            const distance = Math.hypot(x1 - x2, y1 - y2);
            meanDistance += distance;
            pairCount++;

            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }
    }

    meanDistance /= pairCount;
    return { meanDistance, maxDistance };
}


export function initScaling(graph) {
  
    const x_min = Math.min(...graph.map(({ x }) => x));
    const y_min = Math.min(...graph.map(({ y }) => y));
    const x_max = Math.max(...graph.map(({ x }) => x));
    const y_max = Math.max(...graph.map(({ y }) => y));

    const xScale = d3.scaleLinear()
        .domain([x_min, 1.3 * x_max])
        .range([width * 0.1, width * 0.9]);

    const yScale = d3.scaleLinear()
        .domain([y_min, 1.3 * y_max])
        .range([height * 0.1, height * 0.9]);

    graph.forEach(node => {
        node.x = xScale(node.x);
        node.y = yScale(node.y);
    });
}


export function getRandomPosition() {
    return {
        x: Math.random() * width ,
        y: Math.random() * height
    };
}


export function initGraph(graph,) {
    console.log("Initializing graph");
    graph.dataNodes.forEach((node, i) => {
        const { x, y } = getRandomPosition();
        node.x = x;
        node.y = y;
    });
}


export function createCircularGraph(graph, nodeCount, centerX, centerY, clusterId, radius) {
    let previousNodeId = -1;
    let firstNodeId = -1;
    const scalingFactor = 1.5;

    for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * (2 * Math.PI);
        const x = centerX + radius * Math.cos(angle) * scalingFactor;
        const y = centerY + radius * Math.sin(angle) * scalingFactor;

        const currentNodeId = graph.addNode(x, y, true, clusterId);

        if (previousNodeId !== -1) {
            graph.addLink(previousNodeId, currentNodeId);
        } else {
            firstNodeId = currentNodeId;
        }

        previousNodeId = currentNodeId;

        if (i === nodeCount - 1) {
            graph.addLink(currentNodeId, firstNodeId);
        }
    }

    const fakeNodes = graph.getFakeNodes();
    console.log(`Added ${fakeNodes.length} fake nodes`);
}


export function createChain(clusters, graph) {

    console.log("Processing clusters");
    clusters.forEach((cluster, clusterId) => {
        let { meanDistance, maxDistance } = cluster.length > 1 ? calculateMax(cluster) : { meanDistance: 30, maxDistance: 50 };
        const fakeNodeCount = 9;
        const { centerX, centerY } = calculateCenter(cluster);
        createCircularGraph(graph, fakeNodeCount, centerX, centerY, clusterId, maxDistance / 2);
    });

    clusters = d3.group(graph.dataNodes, node => node.cluster);
    return new Promise(resolve => setTimeout(resolve, 1000));
}
