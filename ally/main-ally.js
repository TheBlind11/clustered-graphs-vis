import Graph from './graph.js';
import SpringEmbedder from './spring-embedder.js';
import { initGraph, initScaling, createChain } from './utility.js';
import { width, height } from './graph.js';

// function sleep(milliseconds) {
//     return new Promise(resolve => setTimeout(resolve, milliseconds));
// }

async function main() {

    const graph = new Graph();
    const springEmbedder = new SpringEmbedder(graph);
    graph.dataNodes = await d3.json("data.json");

    let clusters = d3.group(graph.dataNodes, node => node.cluster);

    initGraph(graph);
    initScaling(graph.dataNodes);
    console.log(graph.dataNodes);
    // graph.drawGraph();

    for (const [clusterId, cluster] of clusters.entries()) {

        // const updateGraph = () => {
            for (let i = 0; i < 1000; i++) {
                graph.dataNodes.forEach(node => {
                    const force = springEmbedder.calculateTotalForce(node);
                    if (force.x == 0 && force.y == 0) {
                        console.log('Force is 0');
                    }
                    node.x = Math.min(width, Math.max(node.x + force.x, 0));
                    node.y = Math.min(height, Math.max(node.y + force.y, 0));
                });
            }
            graph.drawGraph(); 
        // };

        // const intervalId = setInterval(updateGraph, 1000);

        // let iterations = 0;
        // const maxIterations = 10;

        // const iterationLimitCheck = setInterval(() => {
        //     iterations++;
        //     if (iterations >= maxIterations) {
        //         clearInterval(intervalId); 
        //         clearInterval(iterationLimitCheck); 
        //     }
        // }, 1000);
    }

    // setTimeout(() => {
        createChain(clusters, graph);
        graph.tuneFakeNodes(springEmbedder);
        initScaling(graph.dataNodes);
        graph.drawGraph(); 
    // }, 1000);

}

main().catch(error => console.error(error));




