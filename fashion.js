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


	d3.queue()
		.defer(d3.csv, "node_list_test.csv")
		.defer(d3.csv, "edge_list_test.csv")
		.await(function(error, node_list, edge_list) {

			// Create nodes of categories
			for (var event of node_list) {
				nodes.push({
					id: event.Node,
					number_searches: event.Popularity,
					month: event.Month,
					type: event.Type
				});

				if (parseInt(event.Popularity) > max_num || parseInt(event.Popularity) > max_num) {
					max_num = Math.max(parseInt(event.Popularity), parseInt(event.Popularity));
				}
			}
			for (var edge of edge_list) {
				edges.push({
					source: edge.Category,
					target: edge.Event
				})
				if (!nodes.find(node => node.id == edge.source)) {
					nodes.push({
						id: edge.Category,
						number_searches: 50,
						month: edge.Month,
						type: "Clothing"
					})
				}
				if (!nodes.find(node => node.id == edge.target)) {
					nodes.push({
						id: edge.Event,
						number_searches: 50,
						month: edge.Month,
						type: Event
					})
				}
			}
			var radius_scale = d3.scaleLinear()
				.domain([0, max_num])
				.range([50, 150]);

			var radius_color = d3.scaleLinear()
				.domain([0, max_num])
				.range(["pink", "#2b90f5"]);


			for (var node of nodes) {
				node.radius = radius_scale(node.number_searches);
				node.color = radius_color(node.number_searches);
			}

			var simulation = d3.forceSimulation()
				.nodes(nodes)
				.force("link", d3.forceLink().id(function(d) {
					return d.id;
				}))
				.force("charge", d3.forceManyBody().strength(-20))
				.force("center", d3.forceCenter(svg_w1 / 2, svg_h1 / 2))
				.force('collide', d3.forceCollide(node => node.radius / 2));

			// var node = svg1.append("g").selectAll("circle")
			// 	.data(nodes)
			// 	.enter()
			// 	.append("circle")
			// 	.style("fill", d => radius_color(d.number_searches))
			// 	.attr("r", function(d) {
			// 		return d.number_searches;
			// 	})
			// 	.attr("stroke", "black")
			// 	.call(d3.drag()
			// 		.on("start", dragstarted)
			// 		.on("drag", dragged)
			// 		.on("end", dragended));
			// //.on('dblclick', connectedNodes);



			var svg_edges = svg1.append("g").selectAll("line")
			.attr("class", "links")
			.data(edges)
			.enter()
			.append("line")
			.attr("stroke", "black")
			.attr("stroke-width", 1)
			.attr("stroke-opacity", 1);

			// function update_date(time) {
			// 	var update_node = [];
			// 	for (var node of nodes) {
			// 		if (node.Month == time) {
			// 			update_node.push(node);
			// 		}
			// 	}
			// 	return update_node;
			// };


			// Update lines and circles with each tick
			function ticked() {
				svg1.selectAll("line.links").
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


			function dragged(d) {
				d.fx = d3.event.x;
				d.fy = d3.event.y;
			}

			var node = svg1.append("g")
				.selectAll("circle")
				.data(nodes)
				.enter()
				.append('circle')

			d3.select("#nRadius").on("input", function() {
				update(node, this.value);
			});

			// Initial starting radius of the circle 
			update(node, 0);

			// update the elements
			function update(node, nRadius) {

				// adjust the text on the range slider
				d3.select("#nRadius-value").text(nRadius);
				d3.select("#nRadius").property("value", nRadius);
				console.log(nRadius);
				// // node.remove();
				// node = node.data(nodes, function(d) {
				// 	var temp = [];
				// 	if (d.number_searches == nRadius) {
				// 		console.log(d);
				// 		temp.push(d);
				// 	}
				// 	return temp;
				// });
				// node.exit().remove();

				node.attr('r', function(d) {
					console.log(d);
					if (parseDate(d.month) == nRadius) {
						return radius_scale(d.number_searches);
					} else {
						return 0;
					}
				});

				simulation.nodes(nodes)
				.on("tick", ticked);

				node.exit().remove();

				//Force is calcualted 
				simulation.force("link")
				.links(edges);

				//node = node.enter().append("circle").attr("fill", function(d) { return radius_color(d.number_searches); }).attr("r", radius_scale(nRadius));
			}

			// node = svg1.select("g").selectAll("circle").data(nodes)
			// 	.enter()
			// 	.append("circle")
			// 	.attr("r", 10)
			// 	.style("fill", d => radius_color(d.number_searches))
			// 	.attr("stroke", "pink")
			// 	.call(d3.drag()
			// 		.on("start", dragstarted)
			// 		.on("drag", dragged)
			// 		.on("end", dragended))
			// 	.on('dblclick', connectedNodes);



		});


	function parseDate(date) {
		var parser = d3.timeParse("%b-%y");
		var date = parser(date);
		return (date.getYear() - 2012) * 12 + date.getMonth();
	}

	// $('.btn').click(function() {
	// 	console.log('test');
	// 	//if value < max
	// 	var temp = parseInt($("#nRadius").val()) + 12;
	// 	console.log(temp);
	// 	if (temp <= 48) {
	// 		$("#nRadius").val(temp);
	// 		$("#nRadius").trigger('change');
	// 		d3.select("#nRadius-value").text(temp);
	// 		d3.select("#nRadius").property("value", temp);
	// 	}
	// });

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
			//updateView(t); /// For updating the view
		}, 1000);
	});

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
	var svg = d3.select('div.col-md-12.tick').append('svg')
		.attr('width', width)
		.attr('height', height);
	var mindate = new Date(2012, 0, 1),
		maxdate = new Date(2016, 0, 31);
	var scale = d3.scaleTime()
		.domain([mindate, maxdate])
		.range([10, width]);
	var axis = d3.axisBottom(scale).ticks(48).tickFormat(d3.timeFormat("%m"));
	svg.append('g')
		.attr('transform', 'translate(' + 0 + ', ' + 0 + ')')
		.call(axis);
	var year = ["2012", "2013", "2014", "2015"];
	var svg2 = d3.select('div.col-md-12.tick').append('svg')
		.attr('width', width)
		.attr('height', height);
	svg2.selectAll('text')
		.data(year)
		.enter()
		.append('text')
		.attr("dx", margin)
		.attr("x", function(d, i) {
			return 280 * i;
		})
		.attr("font-size", "10px")
		.attr("fill", "black")
		.attr("y", 20)
		.text(function(d) {
			return d;
		});