import { width, height } from './graph.js';

export default class SpringEmbedder {
    constructor(graph) {
        this.graph = graph;
        this.springRestLength = 100;
        this.springStiffness = 0.1;
        this.chargeIntensity = 100000;
        this.maxSpringLength = 100;
        this.minSpringLength = 100;        
    }

    getLinksFromDifferentClusters() {
    const links = this.graph.dataNodes.flatMap(node =>
        node.neighbors
            .map(nId => ({ source: node, target: this.graph.getNodeById(nId) }))
            .filter(link => link.source.id < link.target.id && link.target)
    );

    return links.filter(link => link.source.cluster != link.target.cluster); 
    }


    calculateForce(sourceNode, targetNode, forceFunction) {
        let dx = targetNode.x - sourceNode.x;
        let dy = targetNode.y - sourceNode.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) {
            // console.log("Collision detected");
            return { x: 0, y: 0 };
        }
        let forceMagnitude = forceFunction(distance);
        let xForce = forceMagnitude * (dx / distance);
        let yForce = forceMagnitude * (dy / distance);
        return { x: xForce, y: yForce };
    }

    calculateSpringForce(sourceNode, targetNode, springStiffness = this.springStiffness) {

        let filteredLinks = this.getLinksFromDifferentClusters();

        // if (sourceNode.fake) {
        //     return this.calculateForce(sourceNode, targetNode, (distance) => {
        //         return 0.1 * springStiffness * (this.springRestLength - distance);
        //     });
        // }

        if (filteredLinks.some(link => (link.source.id === sourceNode.id && link.target.id === targetNode.id) || (link.source.id === targetNode.id && link.target.id === sourceNode.id))) {
            let springRestLength = 300;
            return (this.calculateForce(sourceNode, targetNode, (distance) => {
                return  springStiffness * (springRestLength - distance);
            }));

        }
        return this.calculateForce(sourceNode, targetNode, (distance) => {
            return springStiffness * (this.springRestLength - distance);
        });
    }

    calculateElectrostaticForce(sourceNode, targetNode, chargeIntensity = this.chargeIntensity) {

        // if (sourceNode.fake) {
        //     return this.calculateForce(sourceNode, targetNode, (distance) => {
        //         return  0.1 * chargeIntensity / Math.pow(distance, 3);
        //     });
        // }
        return this.calculateForce(sourceNode, targetNode, (distance) => {
            return chargeIntensity / Math.pow(distance, 3);
        });
    }

    calculateCenterForce(node) {
        let epsilon = 1e-6;
        let k = -0.0006;
        let center = { x: width / 2, y: height / 2 };
        let dx = center.x - node.x;
        let dy = center.y - node.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let xForce = (dx / (distance + epsilon)) * k * distance;
        let yForce = (dy / (distance + epsilon)) * k * distance;

        return { x: xForce, y: yForce };
    }


    calculateTotalSpringForce(node, springStiffness = this.springStiffness) {
        let totalSpringForce = { x: 0, y: 0 };
        node.neighbors.forEach((nId) => {
            let neighbor = this.graph.getNodeById(nId);
            if (neighbor) {
                let springForce = this.calculateSpringForce(neighbor, node, springStiffness);
                totalSpringForce.x += springForce.x;
                totalSpringForce.y += springForce.y;
            }
        });
        return totalSpringForce;
    }

    calculateTotalElectrostaticForce(node, chargeIntensity = this.chargeIntensity) {        
        let totalElectrostaticForce = { x: 0, y: 0 };
        this.graph.dataNodes.forEach((neighbor) => {
            if (neighbor.id !== node.id) {
                let electrostaticForce = this.calculateElectrostaticForce(neighbor, node, chargeIntensity);
                totalElectrostaticForce.x += electrostaticForce.x;
                totalElectrostaticForce.y += electrostaticForce.y;
            }
        });
        return totalElectrostaticForce;
    }

    calculateTotalForce(node) {
        let springForce = this.calculateTotalSpringForce(node);
        let electrostaticForce = this.calculateTotalElectrostaticForce(node);
        // let repulsiveForce = this.calculateCenterForce(node);

        return {
            x: springForce.x + electrostaticForce.x,  // + repulsiveForce.x,
            y: springForce.y + electrostaticForce.y //  + repulsiveForce.y
        };
    }
}
