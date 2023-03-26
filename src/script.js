const DEFAULT_SIZE = 10;

class GraphData {
    constructor() {
      this.nodes = [];
      this.edges = [];
    }
  
    addNode(id, label, x, y, size=DEFAULT_SIZE, imgUrl="", degrees=0, description="", subdescription="", ) {
      this.nodes.push({
        id,
        label,
        x,
        y,
        size,
        imgUrl,
        description,
        subdescription,
        degrees,
      });
    }
  
    addEdge(source, target, weight) {
      this.edges.push({
        source,
        target,
        weight
      });
    }
  
    serialize() {
      return {
        nodes: this.nodes,
        edges: this.edges
      };
    }
}


function parseLine(line, imgUrls=null, degreesCnt, candNodes, candEdges) {
// remove the starting \t
line = line.replace(/^\t+/, '');
if (line.includes('--')) {
    let edge = parseEdge(line, degreesCnt);
    candEdges.push(edge);
} else if (line.includes("image") && (line.includes("label=") || line.includes("width="))) {
    let node = parseNode(line, imgUrls, degreesCnt);
    candNodes.push(node);
}
}

function parseNode(line, imgUrls=null, degreesCnt) {
const matches = line.match(/(\w+)\s+\[(.*?)\]/);
if (!matches) {
    throw new Error('Invalid node syntax');
}

const id = matches[1];
const attributes = matches[2];

const labelMatch = attributes.match(/label=([\w\s]+)/);
const label = labelMatch ? labelMatch[1] : '';

const posMatch = attributes.match(/pos="(\d+),(\d+)"/);
const x = posMatch ? parseInt(posMatch[1], 10) / 10: 0;
const y = posMatch ? parseInt(posMatch[2], 10) / 10: 0;

const widthMatch = attributes.match(/width="([\d\.]+)"/);
const width = widthMatch ? parseFloat(widthMatch[1]) : 0;

const heightMatch = attributes.match(/height="([\d\.]+)"/);
const height = heightMatch ? parseFloat(heightMatch[1]) : 0;

const imgUrl = imgUrls[parseInt(label)];

// initialize the degrees count
degreesCnt[id] = 0;

return {
    id,
    label,
    x,
    y,
    imgUrl,
    width,
    height
};
}

function parseEdge(line, degreesCnt) {
const matches = line.match(/(\w+)\s+--\s+(\w+)\s+\[(.*?)\]/);
if (!matches) {
    throw new Error('Invalid edge syntax');
}

const source = matches[1];
const target = matches[2];
const attributes = matches[3];

const weightMatch = attributes.match(/weight="([\d\.]+)"/);
const weight = weightMatch ? parseFloat(weightMatch[1]) : 0;

if (source in degreesCnt) degreesCnt[source]++;
if (target in degreesCnt) degreesCnt[target]++;

return {
    source,
    target,
    weight
};
}

function filterAndSizeGraph(g, degreesCnt, candNodes, candEdges) {
  let leafNodes = {};

  for (let ind in candNodes) {
    const node = candNodes[ind];
    if (!(node.id in degreesCnt) || degreesCnt[node.id] == 0) {
      continue;
    } else if (degreesCnt[node.id] == 1) {
      leafNodes[node.id] = node;
    } else {
      let nodeSize = 2 * Math.log2(degreesCnt[node.id]) + DEFAULT_SIZE;
      const nodeDegrees = degreesCnt[node.id];
      g.addNode(node.id, node.label, node.x, node.y, nodeSize, node.imgUrl, nodeDegrees);
    }
  }

  for (let ind in candEdges) {
    const edge = candEdges[ind];
    // if (edge.source === 'image002' && edge.target === '')
    if (!(edge.source in degreesCnt) || !(edge.target in degreesCnt) 
    || degreesCnt[edge.source] == 0 || degreesCnt[edge.target] == 0 ) {
      continue;
    } else if (degreesCnt[edge.source] == 1 && degreesCnt[edge.target] == 1) {
      leafNodes[edge.source] = null;
      leafNodes[edge.target] = null;
    } else {
    g.addEdge(edge.source, edge.target, edge.weight);
    }
  }

  for (let id in leafNodes) {
    if (leafNodes[id]) {
      const node = leafNodes[id];
      const nodeDegrees = degreesCnt[node.id];
      let nodeSize = 2 * Math.log2(degreesCnt[node.id]) + DEFAULT_SIZE;
      g.addNode(node.id, node.label, node.x, node.y, nodeSize, node.imgUrl, nodeDegrees);
    }
  }
  
}

async function parseInput(dot_url, list_url) {
    var dotFile = null;
    var imgUrls = null;

    await fetch(dot_url)
        .then(response => response.text())
        .then(data => {
        dotFile = data.split("\n");
        })
        .catch(error => {
        console.error(error);
        });

    await fetch(list_url)
        .then(response => response.text())
        .then(data => {
          imgUrls = data.split("\n");
        })
        .catch(error => {
        console.error(error);
        });
    let g = new GraphData();
    console.log(imgUrls);

    return new Promise((resolve, reject) => {
        const degreesCnt = {};
        let candNodes = [];
        let candEdges = [];

        for (let i = 0; i < dotFile.length; i++) {
            parseLine(dotFile[i], imgUrls, degreesCnt, candNodes, candEdges);
        }
        filterAndSizeGraph(g, degreesCnt, candNodes, candEdges);
        console.log('End of file');
        resolve(g);
    });
}

export default parseInput;



