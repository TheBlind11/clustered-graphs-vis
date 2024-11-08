# clustered-graphs-vis

The input is a clustered graph, meaning a graph where nodes are partitioned into clusters.

This project aims to represent a clustered graph using a force-directed algorithm. The approach consists of creating chains of fictitious nodes that surround the nodes within each cluster.

These chains form the boundaries of the regions representing each cluster in the final drawing.

The graph nodes are kept within the regions representing their clusters by repulsive forces with respect to the chain nodes.

The purpose of the project is to compare various solutions and, potentially, to create a D3.js library for drawing clustered graphs.

## Project Structure and Functionality

The project is organized as follows:

* The `data.json` file represents a graph composed of nodes divided into clusters and connected by edges.
* The `Graph` class (`graph.js`) contains all methods for managing the graph, from node and edge initialization to handling the data structures characteristic of the graph itself (including "fictitious" nodes).
* The `SpringEmbedder` class (`spring-embedder.js`) manages the entire SpringEmbedding algorithm logic, specifically calculating all forces (electrostatic, elastic, containment, and global centering force) and visualizing the graph by arranging the nodes to be well distributed and easily distinguishable, with clearly separated clusters.
* The `utils.js` file contains methods for geometric calculations, such as calculating the center of a graph cluster or the distance between two points.
* The `main.js` file initializes the graph and implements zoom and translation functionalities, allowing user to explore the graph interactively, enhancing usability even for large graphs.

### Data Format

Each node contains information such as:

* id: unique identifier of the node.
* cluster: id of the cluster to which the node belongs.

An example representation of a node is as follows:

```json
[
    {
        "id": "30",
        "cluster": 5
    }
]
```

## Setup 

- Clone the repository

```
git clone https://github.com/TheBlind11/clustered-graphs-vis
cd clustered-graphs-vis
```

- Start the server

```
bash start_server.sh
```

- Visit http://localhost:8888/
