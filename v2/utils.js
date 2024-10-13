function distance(node1, node2) {
    delta_x = node1.x - node2.x;
    delta_y = node1.y - node2.y;
    return Math.sqrt(delta_x * delta_x + delta_y * delta_y);
}

function computeClusterCenter(fakeNodes) {
    let sumX = 0.0, sumY = 0.0;
    fakeNodes.forEach( node => {
        sumX += node.x;
        sumY += node.y;
    });
    
    return { x: sumX / fakeNodes.length, y: sumY / fakeNodes.length };
}

function maintainCircularChain(fakeNodes, centerX, centerY, radius) {
    fakeNodes.forEach( (fakeNode, i) => {
        const angle = (i / fakeNodes.length) * 2 * Math.PI;
        const targetX = centerX + Math.cos(angle) * radius;
        const targetY = centerY + Math.sin(angle) * radius;

        fakeNode.x = targetX;
        fakeNode.y = targetY;
    });
}