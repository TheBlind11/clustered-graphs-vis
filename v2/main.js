const boardHeight = Math.floor(0.8 * window.screen.height);
const boardWidth = Math.floor(0.6 * window.screen.width);

d3.json("data.json")
    .then(function(data) {
        const svgBoard = d3.select("#svg-board");
        svgBoard.attr("width", boardWidth);
        svgBoard.attr("height", boardHeight);
        const drawingArea = svgBoard.append("g");
        let graph = new Graph(data);
        let forceDirected = new SpringEmbedder(graph, drawingArea);
        forceDirected._drawGraph();
        var zoom = d3.zoom();
        zoom.scaleExtent([0.1, 2])
            .on("zoom", (event) => {
                drawingArea.attr("transform", event.transform);
            });
        svgBoard.call(zoom);
    })
    .catch(error => console.log(error));