import parseInput from './parse';

const urlParams = new URLSearchParams(window.location.search);
const dot_url = urlParams.get('dot_url');
const list_url = urlParams.get('list_url');

const data = await parseInput(dot_url, list_url);

let graph = null;

var container = document.getElementById("graphContainer");
const width = container.offsetWidth;
const height = container.offsetWidth;

window.addEventListener('resize', () => {
    graph.render();
    graph.fitView();
});

if (!graph) {
    graph = new G6.Graph({
    container: "graphContainer",
    width,
    height,
    linkCenter: true,
    modes: {
        default: ['drag-canvas', 'zoom-canvas'],
    },
    defaultNode: {
        shape:"circle",
        size: 10,
        labelCfg: {
        style: {
            fill: '#000000A6',
            fontSize: 0,
        },
        },
        style: {
        stroke: '#72CC4A',
        fill: '#bae637',
        width: 10,
        lineWidth: 3,
        },
    },
    defaultEdge: {
        type: 'line',
    },
    nodeStateStyles: {
        hover: {
            fill: 'lightsteelblue',
        },
        click: {
            stroke: '#000',
            lineWidth: 3,
        },
        },
        edgeStateStyles: {
        click: {
            stroke: 'steelblue',
        },
        },
    });
}

graph.on('node:mouseenter', (e) => {
    console.log("mouse enter");
    const item = e.item;
    changeImgUrl(item);
    graph.setAutoPaint(false);
    graph.getNodes().forEach(function(node) {
        graph.clearItemStates(node);
        graph.setItemState(node, 'dark', true);
    })
    graph.setItemState(item, 'dark', false);
    graph.setItemState(item, 'highlight', true);
    // const start = Date.now();
    item.getEdges().forEach(function(edge) {
        if (edge.getSource() === item) {
        graph.setItemState(edge.getTarget(), 'dark', false);
        graph.setItemState(edge.getTarget(), 'highlight', true);
        graph.setItemState(edge, 'highlight', true);
        edge.toFront();
        } else if (edge.getTarget() === item) {
        graph.setItemState(edge.getSource(), 'dark', false);
        graph.setItemState(edge.getSource(), 'highlight', true);
        graph.setItemState(edge, 'highlight', true);
        edge.toFront();
        } else {
        graph.setItemState(edge, 'highlight', false);
        }
    });
    // const end = Date.now();
    // console.log(`Execution time: ${end - start} ms`);
    graph.paint();
    graph.setAutoPaint(true);
});

graph.on('node:mouseleave', (e) => {
    clearAllStats();
    clearImgUrl();
});

function clearAllStats() {
    graph.setAutoPaint(false);
    graph.getNodes().forEach(function(node) {
    graph.clearItemStates(node);
    });
    graph.getEdges().forEach(function(edge) {
    graph.clearItemStates(edge);
    });
    graph.paint();
    graph.setAutoPaint(true);
}

function changeImgUrl(node) {
    var img = document.getElementById("thumbnail");
    img.src = node.getModel().imgUrl;
}

function clearImgUrl() {
    var img = document.getElementById("thumbnail");
    img.src = "./default_thumbnail.jpeg";
}

function cacheImgs(data) {
    const {nodes} = data;
    var preloadImgs = [];
    nodes.forEach(function (node) {
        const imgUrl = node.imgUrl;
        var img = new Image();
        preloadImgs.push(img);
        img.src = imgUrl;
        console.log("cached img: %s", imgUrl);
    })
}


graph.data(data);
cacheImgs(data);
graph.render();
graph.fitView();