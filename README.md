<<<<<<< HEAD
# clustered-graphs-vis
=======
# Algoritmi per la visualizzazione di grafi clusterizzati

Si suppone di avere in input un grafo clusterizzato, cioè per il quale esiste una partizione dei nodi in cluster.

Questo progetto si propone di sperimentare una strategia per la rappresentazione del grafo clusterizzato tramite un algoritmo force directed consistente nel creare delle catenelle di nodi fittizi che accerchiano i nodi dello stesso cluster. 

Queste catenelle diventano, nel disegno finale, i bordi delle regioni che rappresentano i cluster. 

I nodi del grafo sono tenuti all'interno delle regioni rappresentanti i loro cluster dalle forze repulsive rispetto ai nodi delle catenelle. 

Lo scopo del progetto è quello di confrontare le varie soluzioni possibili e, potenzialmente, di creare una libreria D3.js per il disegno di grafi clusterizzati.

## Struttura del progetto e funzionamento

Il progetto è organizzato in questo modo:

* il file `data.json` rappresenta un grafo composto da nodi suddivisi in cluster e connessi tra loro tramite archi.
* la classe Graph (`graph.js`) contiene tutti i metodi per la gestione del grafo, dall'inizializzazione di nodi ed archi alla visualizzazione degli stessi.
* la classe SpringEmbedder (`spring-embedder.js`) gestisce tutta la logica dell'algoritmo SpringEmbedding, in particolare si occupa del calcolo delle forze (elettrostatica ed elastica) ed organizza i nodi del grafo in modo che risultino ben distribuiti e facilmente distinguibili, con cluster di nodi chiaramente separati. 
* il file `utility.js` contiene metodi per calcoli geometrici, come il calcolo del centro di un cluster del grafo o della distanza massima tra due punti. Inoltre, presenta metodi di inizializzazione delle coordinate del grafo e delle "catenelle" che circondano i singoli cluster.
* il file `main.js` inizializza il grafo ed implementa il processo principale per la visualizzazione del grafo stesso.

### Formato dei dati

Ogni nodo contiene informazioni come:

* id: identificatore univoco del nodo.
* x, y: posizione iniziale del nodo.
* fake: booleano che indica se il nodo è fittizio o reale.
* cluster: id del cluster a cui appartiene il nodo.
* neighbors: lista degli id dei nodi connessi.

Un esempio di rappresentazione di un nodo è il seguente:

```json
[
    {
        "id": 102,
        "x": 0,
        "y": 0,
        "fake": false,
        "cluster": 0,
        "neighbors": [
            103,
            104,
            105
        ]
    }
]

```

<!-- {id: 102, x: 101.17054204513589, y: 69.035637519084, fake: false, cluster: 0, neighbors: []} -->

### Spring Embedder

Il metodo `calculateTotalForce()` calcola la somma di tutte le forze (elettrostatica ed elastica) da applicare ai singoli nodi ad ogni passo iterativo. L'intensità della forza elettrostatica tra due nodi dipende dal parametro `chargeIntensity` e dalla distanza tra essi. Invece, l'intensità della forza elastica dipende dalla costante elastica `springStifness` e dalla deformazione della molla.  

Anche se un nodo può appartenere a un solo cluster, gli archi possono connettere nodi di cluster diversi, creando connessioni tra cluster: al fine di migliorare la visualizzazione, viene aumentata la lunghezza della molla a riposo (denominata `springRestLength`) per gli archi inter-cluster. 

### Costruzione delle "catenelle" 

Dato un cluster, si calcola la distanza massima tra due nodi: il diametro della "catenella" si ottiene moltiplicando la stessa distanza per un fattore scelto arbitrariamente.

### Aggiunta e rimozione di nodi fake

Per gestire l'aggiunta o la rimozione di nodi fittizi, viene utilizzata una soglia arbitraria. Se due nodi della "catena" si trovano a una distanza superiore alla soglia `maxSpringLength`, viene inserito un nodo intermedio. Al contrario, se la distanza tra due nodi è inferiore a `minSpringLength`, uno dei due nodi viene rimosso.

### Visualizzazione

La libreria D3.js consente di gestire l'inserimento, l'aggiornamento e l'eliminazione di ogni elemento visivo. In particolare, il metodo `drawGraph()` all'interno della classe `Graph` si occupa della visualizzazione del grafo clusterizzato: gli archi vengono calcolati dinamicamente ad ogni aggiornamento della visualizzazione, così da evitare problemi di incoerenza degli stati dopo le eliminazioni.

## Setup 

- Clonare la repository

```
git clone https://github.com/allegrastrippoli/infovis.git
cd infovis
```

- Avviare il server

```
bash start_server.sh
```

- Visitare http://localhost:8000/

## Esempio di visualizzazione

![Alt text](layout.png)


>>>>>>> 702ed60 (feat: visualization improvements)
