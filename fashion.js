//Creating svg element
var svg_w1 = 900;
var svg_h1 = 500;
var svg1 = d3.select("div.network").append("svg")
.attr("width", svg_w1)
.attr("height", svg_h1);
var margin = 10;
var nodes = [];
var edges = [];
var toggle = 0;
var max_num = 0;
var months = [];
var timeIndex = 3;


var simulation = d3.forceSimulation()
.force("link", d3.forceLink().id(function(d) {
return d.id;
}).distance(20).strength(0.5))
.force("charge", d3.forceManyBody())
.force("center", d3.forceCenter(svg_w1 / 2, svg_h1 / 2))
.force('collide', d3.forceCollide(node => node.radius * 2.5).strength(0.5));

d3.queue()
.defer(d3.csv, "data-processing/node_list.csv")
.defer(d3.csv, "data-processing/edge_list.csv")
.defer(d3.csv, "data-processing/node_url.csv")
.await(function(error, node_list, edge_list, node_url) {

// Create nodes of categories
for (var event of node_list) {
var obj = {};
obj = {
id: event.Node,
label: event.Node,
group: event.Type,
value: event.value0,
};

for (i = 0; i < 48; i++) {
obj["value" + i] = eval("event.value" + i);
}
nodes.push(obj);

}

// Create edges
for (var edge of edge_list) {
var obj = {};
obj = {
source: edge.Category,
target: edge.Event,
value: edge.value0
};
for (i = 0; i < 48; i++) {
obj["value" + i] = eval("edge.value" + i);
}
edges.push(obj);
}

// Push the url fields to corresponding nodes 
for (var url of node_url) {
for (var i in nodes) {
if (nodes[i].id == url.Node) {
nodes[i].url = url.url;
}
}
}
var linkNodes = [];
edges.forEach(function(link) {
linkNodes.push({
source: nodes[link.source],
target: nodes[link.target]
});
});

var defs = svg1.append("defs")
.attr("id", "imgdefs");
var clipPath = defs.append('clipPath')
.attr("id", "clip-circle")
.attr("r", 20);
// Create scales for node radius
var radius_scale = d3.scaleLinear()
.domain([0, 100])
.range([0, 20]);

// Create scales for node colors 
var radius_color = d3.scaleLinear()
.domain([0, 100])
.range(["pink", "#2b90f5"]);

var link_scale = d3.scaleLinear()
.domain([0, 1])
.range([0, 5]);

// Assign radius and color according to their num searches 
for (var node of nodes) {
node.radius = radius_scale(node.value);
node.color = radius_color(node.value);
}

// Create node group 
nodeG = svg1.append("g")
.attr("class", "nodes");

// Create node circles 
//node = nodeG.selectAll(".node")
// .data(nodes);

//node = node.enter()
// .append("g")
// .attr("class","node");

//var circle = node.append('circle')


node = nodeG.selectAll('circle')
.data(linkNodes)
.enter()
.append("circle")
.attr('class', 'node');
node.on('dblclick', connectedNodes);

node.call(d3.drag()
.on("start", dragstarted)
.on("drag", dragged)
.on("end", dragended));
// force.stop();
//      d3.select(this).attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");

node.on("click", function(d) {
d3.select('#img')
.attr('src', d.url);
var t = d.id;
d3.select("#name")
.text(function(d) {
return t;
})
});

//Create labels for each circles

// var label = svg1.selectAll("text")
// .data(nodes)
// .enter()
// .append("text")
// .text(function(d) {
// return d.id;
// });


// Create images for each circles 
var image = svg1.selectAll("image")
.data(nodes)
.enter()
.append("image")
.attr("xlink:href", function(d) {
if (d.group == "Event") {
return d.url;
}
})
.attr("clip-path", "url(#clip-circle)")
.attr("width", "20px")
.attr("height", "20px");

// Update simulation 
simulation = simulation.nodes(nodes.concat(linkNodes));


linkG = svg1.append("g")
.attr("class", "links");

link = linkG.selectAll('path')
.data(edges)
.enter()
.append('path')
.attr('class', 'link');

simulation.force("link")
.links(edges);
//Toggle stores whether the highlighting is on
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < nodes.length; i++) {
linkedByIndex[i + "," + i] = 1;
};
edges.forEach(function(d) {
linkedByIndex[d.source.index + "," + d.target.index] = 1;
});
//This function looks up whether a pair are neighbours
function neighboring(a, b) {
return linkedByIndex[a.index + "," + b.index];
}

function connectedNodes() {
if (toggle == 0) {
//Reduce the opacity of all but the neighbouring nodes
d = d3.select(this).node().__data__;
node.style("opacity", function(o) {
return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
});
link.style("opacity", function(o) {
return d.index == o.source.index | d.index == o.target.index ? 1 : 0.1;
});
//Reduce the op
toggle = 1;
} else {
//Put them back to opacity=1
node.style("opacity", 1);
links.style("opacity", 1);
toggle = 0;
}
}
var optArray = [];
for (var i = 0; i < nodes.length - 1; i++) {
optArray.push(nodes[i].id);
}
optArray = optArray.sort();
(function($) { //
$("#search").autocomplete({
source: optArray
});
});

d3.select("#autocomplete").on("click", function() {
//find the node
var selectedVal = document.getElementById('search').value;
console.log(selectedVal);

//var node = svg1.selectAll("circle");
if (selectedVal == "none") {
node.attr("stroke", "white")
.attr("stroke-width", "1");
} else {
var selected = node.filter(function(d) {
console.log(d.id.toUpperCase());
return d.id.toUpperCase() != selectedVal.toUpperCase();
});
console.log(selected);
selected.style("opacity", "0");
// var link = svg.selectAll(".link")
link.style("opacity", "0");
svg1.selectAll("circle, line").transition()
.duration(5000)
.style("opacity", 0.3);
}
});

d3.select("#nRadius").on("input", function() {
console.log(this.value);
updateView(this.value);
});

updateView(0);

function formatDate(date) {
	var months = [
	"January", "February", "March", 
	"April", "May", "June", "July", 
	"August", "September", "October", 
	"November", "December"];
	var month = date.getMonth();
	var year = date.getFullYear(); 

	return months[month] + ' ' + year;
}

//update the elements
function updateView(nRadius) {
	var startdate = new Date (2012, 0, 1); 
	var updated = new Date(startdate.setMonth(startdate.getMonth() + nRadius)); 

d3.select("#nRadius-value").text(formatDate(updated));
d3.select("#nRadius").property("value", nRadius);

// Update nodes 
node = node.attr('r', function(d) {
if (d.group == "Event") {
return radius_scale(100);
}
return radius_scale(eval("d.value" + nRadius));
})
.merge(node)
.style("fill", function(d) {
if (d.group == "Clothing") {
return radius_color(eval("d.value" + nRadius));
} else {
return "transparent";
}
});


//Update links
link = link.attr('stroke-width', function(d) {
return link_scale(eval("Math.abs(d.value" + nRadius + ")"));
})
.attr("stroke", function(d) {
if (eval("d.value" + nRadius) < 0) {
return "red";
} else {
return "blue";
}
})
.attr("opacity", 0.3)
.merge(link);


simulation.on("tick", ticked);

// Create timer functions 
var myTimer;
d3.select("#start").on("click", function() {
clearInterval(myTimer);
myTimer = setInterval(function() {
var b = d3.select("#nRadius");
var t = (+b.property("value") + 1) % (+b.property("max") + 1);
if (t == 0) {
t = +b.property("min");
}
if (parseInt($("#nRadius").val()) == 48) {
clearInterval(myTimer); //stop the autoplay
}
d3.select("#nRadius-value").text(t);
d3.select("#nRadius").property("value", t);
console.log(t); //log value display at nRadius
b.property("value", t);
updateView($("#nRadius").val());
//updateView(t); /// For updating the view
}, 1000);
});



}
});



//});

function ticked() {
svg1.selectAll('path.link')
.attr("d", function(d) {
var dx = d.target.x - d.source.x,
dy = d.target.y - d.source.y,
dr = Math.sqrt(dx * dx + dy * dy);
return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
})
svg1.selectAll('circle.node')
.attr("cx", function(d) {
return d.x;
})
.attr("cy", function(d) {
return d.y;
});
linkNodes.attr("cx", function(d) {
return d.x = (d.source.x + d.target.x) * 0.5;

})
.attr("cy", function(d) {
return d.x = (d.source.x + d.target.x) * 0.5;

})
// svg1.selectAll('text').attr("x", function(d) {
// return d.x;
// })
// .attr("y", function(d) {
// return d.y - 10;
// });

svg1.selectAll('image').attr("transform", function(d) {
return "translate(" + d.x + "," + d.y + ")";
});
};

// Dragging helper functions that use simulation 
function dragstarted(d) {
d.fx = d.x;
d.fy = d.y;
};

function dragged(d) {
d.x = d3.event.x;
d.y = d3.event.y;

};

function dragended(d) {
//if (!d3.event.active) simulation.alphaTarget(0);
//d.fx = null;
//d.fy = null;
if (!d3.event.active) {
ticked();
d.x = d3.event.x;
d.y = d3.event.y;
}
};

function parseDate(dateString) {
var parser = d3.timeParse("%y-%b");
var date = parser(dateString);
return (date.getFullYear() - 2012) * 12 + date.getMonth();
}

d3.select("#pause").on("click", function() {
clearInterval(myTimer);
});

d3.select("#stop").on("click", function() {
d3.select("#nRadius-value").text(0);
d3.select("#nRadius").property("value", 0);
clearInterval(myTimer);
});


var width = 1140,
height = 20,
padding = 10;
margin = 140;

// Create svg for time range scales 
var svg = d3.select('div.tick').append('svg')
.attr('width', width)
.attr('height', height);

var mindate = new Date(2012, 0, 1),
maxdate = new Date(2015, 11, 31);

var scale = d3.scaleTime()
.domain([mindate, maxdate])
.range([10, width]);

var axis = d3.axisBottom(scale).ticks(47).tickFormat(d3.timeFormat("%m"));

// Create the ticks for time range 
svg.append('g')
.attr('transform', 'translate(' + -5 + ', ' + 0 + ')')
.call(axis);

var year = ["2012", "2013", "2014", "2015"];

// Create the labels for the time range ticks 
var svg2 = d3.select('div.tick').append('svg')
.attr('width', width)
.attr('height', height);

svg2.selectAll('text')
.data(year)
.enter()
.append('text')
.attr("x", function(d, i) {
return 280 * i;
})
.attr("font-size", "10px")
.attr("fill", "black")
.attr("y", 10)
.text(function(d) {
return d;
});
