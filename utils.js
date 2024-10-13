function distance(node1, node2) {
    delta_x = node1.x - node2.x;
    delta_y = node1.y - node2.y;
    return Math.sqrt(delta_x * delta_x + delta_y * delta_y);
}

function assignRandomInitialPositions(nodes) {

    const xRandomScale = d3.scaleLinear();
    const yRandomScale = d3.scaleLinear();
    xRandomScale.domain([0, 1]);
    yRandomScale.domain([0, 1]);
    xRandomScale.range([-2 * boardWidth, 3 * boardWidth]);
    yRandomScale.range([3 * boardHeight, -2 * boardHeight]);

    const assignedXs = new Set();
    const assignedYs = new Set();

    nodes.forEach(node => {
        let x = parseFloat(xRandomScale(Math.random()));
        while (assignedXs.has(x))
            x = parseFloat(xRandomScale(Math.random()));
        let y = parseFloat(yRandomScale(Math.random()));
        while (assignedYs.has(y))
            y = parseFloat(yRandomScale(Math.random()));
        node.x = x;
        node.y = y;
        assignedXs.add(x);
        assignedYs.add(y);
    });
}

function assignRandomInitialPositions2(nodes, clusters) {

    const clusterCenters = {};

    // Determina il centro di ogni cluster in modo che siano sparsi sulla board
    clusters.forEach(cluster => {
        clusterCenters[cluster.id] = {
            x: Math.random() * boardWidth * 0.8 + boardWidth * 0.1,
            y: Math.random() * boardHeight * 0.8 + boardHeight * 0.1
        };
    });

    console.log(clusters);
    console.log(clusterCenters);

    // Scala per generare posizioni casuali attorno al centro di ogni cluster
    const clusterRadius = Math.min(boardWidth, boardHeight) / 10;
    const xRandomScale = d3.scaleLinear().domain([0, 1]).range([-clusterRadius, clusterRadius]);
    const yRandomScale = d3.scaleLinear().domain([0, 1]).range([-clusterRadius, clusterRadius]);

    const assignedPositions = new Set();

    nodes.forEach(node => {
        const clusterCenter = clusterCenters[node.cluster];
        console.log(clusterCenter);
        let x = clusterCenter.x + xRandomScale(Math.random());
        let y = clusterCenter.y + yRandomScale(Math.random());

        // Assicura che la posizione non sia già assegnata
        while (assignedPositions.has(`${x},${y}`)) {
            x = clusterCenter.x + xRandomScale(Math.random());
            y = clusterCenter.y + yRandomScale(Math.random());
        }

        node.x = x;
        node.y = y;
        assignedPositions.add(`${x},${y}`);
    });
}

function addFakeNodesAndLinks(graph) {
    const clusters = graph._getClusters();

    clusters.forEach(cluster => {
        const center = calculateClusterCenter(cluster);
        // Calcola il raggio basato sulla distanza massima tra il centro e i nodi reali
        const maxDistance = Math.max(...cluster.nodes.map(node => distance(center, node)));
        const radius = maxDistance + 20; // Aggiungi un margine per assicurare che la catena sia esterna
        const numFakeNodes = Math.max(5, cluster.nodes.length * 1.5); // Aumento del numero di nodi fittizi

        let previousNodeId = null;
        let firstNodeId = null;

        for (let i = 0; i < numFakeNodes; i++) {
            const angle = (2 * Math.PI / numFakeNodes) * i;
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);

            let fakeNode = { cluster: cluster.id, x: x, y: y };
            const fakeNodeId = graph._addFakeNode(fakeNode);

            if (i === 0)
                firstNodeId = fakeNodeId;
            else
                graph._addFakeLink({ source: previousNodeId, target: fakeNodeId });

            previousNodeId = fakeNodeId;
        }

        if (firstNodeId) {
            graph._addFakeLink({ source: previousNodeId, target: firstNodeId });
        }
    });
}

function calculateClusterCenter(cluster) {
    const totalX = cluster.nodes.reduce((sum, node) => sum + node.x, 0);
    const totalY = cluster.nodes.reduce((sum, node) => sum + node.y, 0);
    return { x: totalX / cluster.nodes.length, y: totalY / cluster.nodes.length };
}

/* function calculateMax(cluster) {
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

function createCircularGraph(graph, nodeCount, centerX, centerY, clusterId, radius) {
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

function createChain(graph) {

    let clusters = d3.group(graph._getNodes(), node => node.cluster);
    console.log("Processing clusters");
    clusters.forEach((cluster, clusterId) => {
        let { meanDistance, maxDistance } = cluster.length > 1 ? calculateMax(cluster) : { meanDistance: 30, maxDistance: 50 };
        const fakeNodeCount = 9;
        const { centerX, centerY } = calculateCenter(cluster);
        createCircularGraph(graph, fakeNodeCount, centerX, centerY, clusterId, maxDistance / 2);
    });

    clusters = d3.group(graph.dataNodes, node => node.cluster);
    return new Promise(resolve => setTimeout(resolve, 1000));
} */