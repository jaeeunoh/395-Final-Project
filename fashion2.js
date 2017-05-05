	//Creating svg element
	var svg_w1 = 600;
	var svg_h1 = 800;
	var svg1 = d3.select("body").append("svg")
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
	.force("link", d3.forceLink().id(function(d) { return d.id; }))
	.force("charge", d3.forceManyBody())
	.force("center", d3.forceCenter(svg_w1 / 2, svg_h1 / 2));

	d3.queue()
	.defer(d3.csv, "node_list_test.csv")
	.defer(d3.csv, "edge_list_test.csv")
	.await(function(error, node_list, edge_list) {

				// Create nodes of categories
				// nodes 
				for (var event of node_list) {
					nodes.push({
						id: event.Node,
						label: event.Node,
						value: parseInt(event.Popularity),
						month: event.Month,
						group: event.Type
					});

					if (parseInt(event.Popularity) > max_num || parseInt(event.Popularity) > max_num) {
						max_num = Math.max(parseInt(event.Popularity), parseInt(event.Popularity));
					}
				}
				
				// edges
				// for (var edge of edge_list) {
				// 	edges.push({
				// 		source: edge.Category,
				// 		target: edge.Event,
				// 		month: edge.Month,
				// 		value: parseInt(edge.Link)
				// 	})
				// 	if (!nodes.find(node => node.id == edge.Event)) {
				// 		nodes.push({
				// 			id: edge.Category,
				// 			label: edge.Category,
				// 			value: 50,
				// 			month: edge.Month,
				// 			group: "Clothing"
				// 		})
				// 	}
				// 	if (!nodes.find(node => node.id == edge.Category)) {
				// 		nodes.push({
				// 			id: edge.Event,
				// 			label: edge.Event,
				// 			value: 50,
				// 			month: edge.Month,
				// 			type: 'Event'
				// 		})
				// 	}
				// }
				

				// Create scales
				var radius_scale = d3.scaleLinear()
				.domain([0, max_num])
				.range([10, 100]);

				var radius_color = d3.scaleLinear()
				.domain([0, max_num])
				.range(["pink", "#2b90f5"]);

				for (var node of nodes) {
					node.radius = radius_scale(node.value);
					node.color = radius_color(node.value);
				}



				// Create node and edges
				node = svg1.append("g")
					.attr("class", "nodes")
					.selectAll('circle')
					.data(eval("nodes.filter(d => parseDate(d.month) == " + timeIndex +")"))
					.enter()
					.append("circle")
					//.attr('class', 'node')
					.attr('r', d => radius_scale(d.value));


				// link = svg1.append("g")
				// 	.attr("class", "links")
				// 	.selectAll('line')
				// 	.data(eval("edges.filter(d => parseDate(d.month) == " + timeIndex +")"))
				// 	.enter()
				// 	.append('line');




				function ticked() {
					// link
					// .attr("x1", function(d) { return d.source.x; })
					// .attr("y1", function(d) { return d.source.y; })
					// .attr("x2", function(d) { return d.target.x; })
					// .attr("y2", function(d) { return d.target.y; });
					node
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; });
				}


				simulation.nodes(eval("nodes.filter(d => parseDate(d.month) == " + timeIndex +")"))
					.on("tick", ticked);
				
					

				// simulation.force("link") .links(eval("edges.filter(d => parseDate(d.month) == " + timeIndex +")"));
				console.log(nodes);
				
				d3.select("#nRadius").on("input", function() {
					updateView(this.value);

				});
				
				//updateView(0);
				



				//update the elements
				function updateView (nRadius) {
					// filter data
					curNodes = nodes.filter(d => parseDate(d.month) == nRadius);
					curEdges = edges.filter(d => parseDate(d.month) == nRadius);
					console.log(curNodes);
					// adjust the text on the range slider

					d3.select("#nRadius-value").text(nRadius);
					d3.select("#nRadius").property("value", nRadius);
					timeIndex = nRadius;

					
					// Update nodes 
					node = node.data(curNodes)
					node.exit().remove();
					

					
					node.enter()
					.append('circle')
					.attr('class','node')
					.attr('r', d => radius_scale(d.value))
					.merge(node);

					

  					// Update links
  					// var link = svg1.append("g").selectAll('line').data(curEdges);
  					// link.exit().remove();
  					// link.enter()
  					// .append('line')
  					// .attr('class','link')
  					// .attr('stroke-width', d => 5);
  					
  					
  					simulation = d3.forceSimulation()
						.force("link", d3.forceLink().id(function(d) { return d.id; }))
						.force("charge", d3.forceManyBody())
						.force("center", d3.forceCenter(svg_w1 / 2, svg_h1 / 2));
  					

  					simulation.nodes(curNodes)
  						.restart()
  						.on("tick", ticked);
  					
  						

  					// simulation.force("link")
  					// 	.links(curEdges);

  					
  						


  					function ticked() {
  						// link
  						// .attr("x1", function(d) { return d.source.x; })
  						// .attr("y1", function(d) { return d.source.y; })
  						// .attr("x2", function(d) { return d.target.x; })
  						// .attr("y2", function(d) { return d.target.y; });

  						node
  						.attr("cx", function(d) { return d.x; })
  						.attr("cy", function(d) { return d.y; });
  					}
  					//node.exit().remove();
  					//link.exit().remove();

  				}
  			});




  			//});

	function parseDate (dateString) {
		var parser = d3.timeParse("%b-%y");
		var date = parser(dateString);
		return (date.getFullYear() - 2012) * 12 +  date.getMonth();
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
