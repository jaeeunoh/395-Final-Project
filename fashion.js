//Creating svg element
var svg_w1 = 750;
var svg_h1 = 300;
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
.force('collide', d3.forceCollide(node => node.radius * 2));

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

	// Create scales for node radius
	var radius_scale = d3.scaleLinear()
	.domain([0, 100])
	.range([0, 20]);

	// Create scales for node colors 
	var radius_color = d3.scaleLinear()
	.domain([0, 100])
	.range(["pink", "#2b90f5"]);

	// Assign radius and color according to their num searches 
	for (var node of nodes) {
		node.radius = radius_scale(node.value);
		node.color = radius_color(node.value);
	}

	// Create node group 
	nodeG = svg1.append("g")
	.attr("class", "nodes");

	// Create node circles 
	node = nodeG.selectAll('circle')
	.data(nodes)
	.enter()
	.append("circle")
	.attr('class', 'node')
	.attr("xlink:href", function(d) {
		if (d.group == "Event") {
			return d.url;

		}
	})
	.call(d3.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended))
	.on("click", function(d) {
		d3.select('#img')
		.attr('src', d.url);
		var t = d.id;
		d3.select("#name")
		.text(function(d) {
			return t;
		})
	});

	// Create labels for each circles 	
	var label = svg1.selectAll("text")
	.data(nodes)
	.enter()
	.append("text")
	.text(function(d) {
		return d.id;
	})
	.style("text-anchor", "middle")
	.style("fill", "#555")
	.style("font-family", "Arial")
	.style("font-size", 5);
	
	// Create images for each circles 
	var image = svg1.selectAll("img")
	.data(nodes)
	.enter()
	.append("img")
	.attr("xlink:href", function(d) {
		if (d.group == "Event") {
			return d.url;
		}
	})
	.attr("width", 50)
	.attr("height", 50);
	
	// Update simulation 
	simulation = simulation.nodes(nodes).restart();


	linkG = svg1.append("g")
	.attr("class", "links")

	link = linkG.selectAll('line')
	.data(edges)
	.enter()
	.append('line')
	.attr('class', 'link');

	simulation.force("link")
	.links(edges);


	d3.select("#nRadius").on("input", function() {
		console.log(this.value);
		updateView(this.value);
	});

	updateView(0);



	//update the elements
	function updateView(nRadius) {
		d3.select("#nRadius-value").text(nRadius);
		d3.select("#nRadius").property("value", nRadius);

		// Update nodes 
		node = node.attr('r', function(d) {
			if (d.group == "Event") {
				return radius_scale(100);
			}
			return radius_scale(eval("d.value" + nRadius));
		})
		.attr("fill", function(d) {
			if (d.group == "Event") {
				return "red";
			} else {
				return radius_color(eval("d.value"));
			}
		})
		.append("text")
		.text(function(d) {
			if (d.group == "Clothing") {
				var t = d.id;
				console.log(d.id);
				return t;
			}
		})
		.attr("dx", 6)
		.attr("dy", 10)
		.attr("fill", "black")
		.attr("font-size", "40px")
		.merge(node);

		//Update links
		link = link.attr('stroke-width', function(d) {
			return 1;
		})
		.merge(link);


		simulation.on("tick", ticked);


		function ticked() {
			svg1.selectAll('line.link')
			.attr("x1", function(d) {
				return d.source.x;
			})
			.attr("y1", function(d) {
				return d.source.y;
			})
			.attr("x2", function(d) {
				return d.target.x;
			})
			.attr("y2", function(d) {
				return d.target.y;
			});

			svg1.selectAll('circle.node')
			.attr("cx", function(d) {
				return d.x;
			})
			.attr("cy", function(d) {
				return d.y;
			});
			label.attr("x", function(d) {
				return d.x;
			})
			.attr("y", function(d) {
				return d.y - 10;
			});
			image.attr("x", function(d) {
				return d.x;
			})
			.attr("y", function(d) {
				return d.y - 10;
			});
		}

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


// Dragging helper functions that use simulation 
function dragstarted(d) {
// if (!d3.event.active) simulation.alphaTarget(0.3).restart();
// force.stop();
// d.fx = d.x;
// d.fy = d.y;
force.stop();
}

// Dragging helper functions that do not need simulation
function dragended(d) {
// if (!d3.event.active) simulation.alphaTarget(0);
// d.fx = null;
// d.fy = null;
// 
d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
tick();
force.resume();
}


function dragged(d) {
	d.px += d3.event.dx;
	d.py += d3.event.dy;
	d.x += d3.event.dx;
	d.y += d3.event.dy;
	tick();
}

// Color by group
function color(group) {
	if (group == "Event") {
		return COLOR.red;
	} else {
		return COLOR.blue;
	}
}


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