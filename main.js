const boardHeight = Math.floor(0.8 * window.screen.height);
const boardWidth = Math.floor(0.6 * window.screen.width);

d3.json("data.json")
    .then(function(data) {
        const svgBoard = d3.select("#svg-board");
        svgBoard.attr("width", boardWidth);
        svgBoard.attr("height", boardHeight);
        let graph = new Graph(data);
        let forceDirected = new SpringEmbedder(graph, svgBoard);
    })
    .catch(error => console.log(error));