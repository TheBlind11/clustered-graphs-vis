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

* Il file `data.json` rappresenta un grafo composto da nodi suddivisi in cluster e connessi tra loro tramite archi.
* La classe Graph (`graph.js`) contiene tutti i metodi per la gestione del grafo, dall'inizializzazione di nodi ed archi alla gestione delle strutture dati caratteristiche del grafo stesso (nodi "fittizi" compresi).
* La classe SpringEmbedder (`spring-embedder.js`) gestisce tutta la logica dell'algoritmo SpringEmbedding, in particolare si occupa del calcolo di tutte le forze (elettrostatica, elastica, forza di contenimento e di "centratura" globale) e della visualizzazione del grafo organizzando i nodi in modo che risultino ben distribuiti e facilmente distinguibili, con cluster chiaramente separati. 
* Il file `utils.js` contiene metodi per calcoli geometrici, come il calcolo del centro di un cluster del grafo o della distanza tra due punti.
* Il file `main.js` inizializza il grafo ed implementa le funzionalità di zoom e traslazione per permettere all'utente di esplorare il grafo in modo interattivo, migliorando l'usabilità anche per grafi di grandi dimensioni.

### Formato dei dati

Ogni nodo contiene informazioni come:

* id: identificatore univoco del nodo.
* cluster: id del cluster a cui appartiene il nodo.

Un esempio di rappresentazione di un nodo è il seguente:

```json
[
    {
        "id": "30",
        "cluster": 5
    }
]
```

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

<<<<<<< HEAD
- Visitare http://localhost:8000/

## Esempio di visualizzazione

![Alt text](layout.png)


>>>>>>> 702ed60 (feat: visualization improvements)
=======
- Visitare http://localhost:8000/
>>>>>>> dc527a2 (feat: README update, fake nodes/links opacity + refactoring)
