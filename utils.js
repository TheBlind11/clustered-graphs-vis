function distance(node1, node2) {
    delta_x = node1.x - node2.x;
    delta_y = node1.y - node2.y;
    return Math.sqrt(delta_x * delta_x + delta_y * delta_y);
}