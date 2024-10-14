function distance(node1, node2) {
    delta_x = node1.x - node2.x;
    delta_y = node1.y - node2.y;
    return Math.sqrt(delta_x * delta_x + delta_y * delta_y);
}

function computeClusterCenter(nodes) {
    let sumX = 0.0, sumY = 0.0;
    nodes.forEach( node => {
        sumX += node.x;
        sumY += node.y;
    });
    
    return { x: sumX / nodes.length, y: sumY / nodes.length };
}