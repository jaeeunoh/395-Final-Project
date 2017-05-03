//Creating svg element

var svg_w1 = window.innerWidth;
var svg_h1 = window.innerHeight / 2;
var svg1 = d3.select("body").append("svg")
	.attr("width", svg_w1)
	.attr("height", svg_h1);
var margin = 10;
var nodes = [];
var edges = [];
var toggle = 0;

//Creating Timeline 
var options = {
	//timevav_position: "bottom",
	dragging: true,
	start_at_slide: 0,
	timenav_height: 300,
};


d3.queue()
	.defer(d3.csv, "test_data.csv")
	.await(function(error, test_file) {
		var data = {
			title: {
				text: {
					headline: 'Fashion Trends'
				}
			},
			events: []
		};

		for (var event of test_file) {
			var name = event.Event;
			var start = new Date(event.Date);
			var end = new Date();

			data.events.push({
				text: {
					headline: name
				},
				start_date: {
					year: event.Year,
					month: start.getMonth() + 1,
					day: start.getDate()
				},
				end_date: {
					year: event.Year,
					month: end.getMonth() + 1,
					day: end.getDate()
				},
				background: {
					color: '#0000'
				}
			});

			//var timeline = new TL.Timeline('timeline-embed', data, options);

			var max_num = 0;
		}

		// Create nodes of categories
		for (var event of test_file) {
			if (!nodes.find(node => node.id == event.Category)) {
				nodes.push({
					id: event.Category,
					number_searches: event.Num_searches_category
				});
			}
			if (!nodes.find(node => node.id == event.Event)) {
				nodes.push({
					id: event.Event,
					number_searches: event.Num_searches_event
				});
			}
			edges.push({
				source: event.Category,
				target: event.Event
			});
			if (parseInt(event.Num_searches_category) > max_num || parseInt(event.Num_searches_event) > max_num) {
				console.log('heerrr');
				max_num = Math.max(parseInt(event.Num_searches_category), parseInt(event.Num_searches_event));
			}
		}
		console.log(nodes);
		console.log(edges);
		console.log(max_num + "max");

		var radius_scale = d3.scaleLinear()
			.domain([0, max_num])
			.range([50, 150]);

		var radius_color = d3.scaleLinear()
			.domain([0, max_num])
			.range(["pink", "#2b90f5"]);

		for (var node of nodes) {
			node.radius = radius_scale(node.number_searches);
			console.log(node.radius + "raddd");
		}
		var simulation = d3.forceSimulation()
			.nodes(nodes)
			.force("link", d3.forceLink().id(function(d) {
				return d.id;
			}))
			.force("charge", d3.forceManyBody().strength(-20))
			.force("center", d3.forceCenter(svg_w1 / 2, svg_h1 / 2))
			.force('collide', d3.forceCollide(node => node.radius / 2));

		var node = svg1.append("g")
			.selectAll("circle")
			.data(nodes)
			.enter()
			.append("circle")
			.style("fill", d => radius_color(d.number_searches))
			.attr("r", function(d) {
				return d.number_searches;
			})
			.attr("stroke", "black")
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended))
			.on('dblclick', connectedNodes);



		console.log('blah3');
		var svg_edges = svg1.append('g')
			.attr("class", "links")
			.selectAll("line")
			.data(edges)
			.enter()
			.append("line")
			.attr("stroke", "black")
			.attr("stroke-width", 1)
			.attr("stroke-opacity", 1);

		// Update lines and circles with each tick
		function ticked() {
			svg_edges.
			attr("x1", function(d) {
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

			node
				.attr("cx", function(d) {
					return d.x;
				})
				.attr("cy", function(d) {
					return d.y;
				});
		};

		simulation.nodes(nodes)
			.on("tick", ticked);

		// Force is calcualted 
		simulation.force("link")
			.links(edges);

		// Dragging helper functions that use simulation 
		function dragstarted(d) {
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		// Dragging helper functions that do not need simulation
		function dragended(d) {
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}

		function connectedNodes() {
			if (toggle == 0) {
				//Reduce the opacity of all but the neighbouring nodes
				d = d3.select(this).node().__data__;
				node.style("opacity", function(o) {
					return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
				});
				svg_edges.style("opacity", function(o) {
					return d.index == o.source.index | d.index == o.target.index ? 1 : 0.1;
				});
				//Reduce the op
				toggle = 1;
			} else {
				//Put them back to opacity=1
				node.style("opacity", 1);
				svg_edges.style("opacity", 1);
				toggle = 0;
			}
		}
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


		var width = 600;
		var height = 300;

		var holder = d3.select("body")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

		// draw the circle
		holder.append("circle")
			.attr("cx", 300)
			.attr("cy", 150)
			.style("fill", "none")
			.style("stroke", "blue")
			.attr("r", 120);

		// when the input range changes update the circle 
		d3.select("#nRadius").on("input", function() {
			update(+this.value);
		});

		// Initial starting radius of the circle 
		update(120);

		// update the elements
		function update(nRadius) {

			// adjust the text on the range slider
			d3.select("#nRadius-value").text(nRadius);
			d3.select("#nRadius").property("value", nRadius);

			// update the rircle radius
			holder.selectAll("circle")
				.attr("r", nRadius);
			node
				.append("circle")
				.attr("r", function(d) {
					console.log("yes");
					return nRadius; })
				.attr("fille", radius_scale(nRadius));
			node.append("title")
				.text(function(d) {
					return d.id;
				});
		}

	});



var slide_count = 2, // how many slides you have
	delay = 10; //delay between slides

var url = window.location.href;
var hash = parseInt(url.substring(url.indexOf("#") + 1));
if (isNaN(hash)) window.location.href = "#0";

function autoplay() {
	var url = window.location.href;
	console.log(url + "url");
	var hash = parseInt(url.substring(url.indexOf("#") + 1));
	console.log(hash + "hash");
	if (isNaN(hash) || hash === slide_count) window.location.href = "#0";
	else {
		$('.nav-next').trigger('click');
	}
}

// Dragging helper functions that use simulation 
function dragstarted(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

// Dragging helper functions that do not need simulation
function dragended(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}


function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}