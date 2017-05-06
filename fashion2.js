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

	var simulation = d3.forceSimulation()
	.force("link", d3.forceLink().id(function(d) { return d.id; }))
	.force("charge", d3.forceManyBody())
	.force("center", d3.forceCenter(svg_w1 / 2, svg_h1 / 2));

	d3.queue()
	.defer(d3.csv, "data-processing/node_list.csv")
	.defer(d3.csv, "data-processing/edge_list.csv")
	.await(function(error, node_list, edge_list) {

				// Create nodes of categories
				// nodes 
				for (var event of node_list) {
					nodes.push({
						id: event.Node,
						label: event.Node,
						value: parseInt(event.Popularity),
						month: parseDate(event.Month),
						group: event.Type
					});

					if (parseInt(event.Popularity) > max_num || parseInt(event.Popularity) > max_num) {
						max_num = Math.max(parseInt(event.Popularity), parseInt(event.Popularity));
					}
				}
				
				//edges
				for (var edge of edge_list) {
					edges.push({
						source: edge.Category,
						target: edge.Event,
						month: parseDate(edge.Month),
						value: parseInt(edge.Link)
					});
					// if (!nodes.find(node => node.id == edge.Event)) {
					// 	nodes.push({
					// 		id: edge.Category,
					// 		label: edge.Category,
					// 		value: 50,
					// 		month: edge.Month,
					// 		group: "Clothing"
					// 	})
					// }
					// if (!nodes.find(node => node.id == edge.Category)) {
					// 	nodes.push({
					// 		id: edge.Event,
					// 		label: edge.Event,
					// 		value: 50,
					// 		month: edge.Month,
					// 		type: 'Event'
					// 	})
				}
				//}
				
				
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
				nodeG = svg1.append("g")
				.attr("class", "nodes")

				node = nodeG.selectAll('circle')
				.data(nodes)
				.enter()
				.append("circle")
				.attr('class', 'node');
					//.attr('class', 'node')
					
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
				function updateView (nRadius) {
					// filter data
					// curNodes = nodes.filter(d => parseDate(d.month) == nRadius);
					// curEdges = edges.filter(d => parseDate(d.month) == nRadius);
					// console.log(curNodes);
					// adjust the text on the range slider

					d3.select("#nRadius-value").text(nRadius);
					d3.select("#nRadius").property("value", nRadius);
					//timeIndex = nRadius;

					
					// Update nodes 
					svg1.selectAll('circle.node').attr('r', function (d) {
						if (d.month == nRadius) {
							console.log("updated r");
							console.log(d.radius);
							return d.radius;
						} else {
							console.log("not updated r")
							return 0;
						}
					});
					
					
					

					
					// node.enter()
					// .append('circle')
					// .attr('class','node')
					// .attr('r', d => radius_scale(d.value));
					

					

  					//Update links
  					link = link.attr('stroke-width', function(d) {
  						if (d.month == nRadius) {
  							return Math.abs(d.value)*2;
  						} else {
  							return 0;
  						}
  					})
  					.merge(link);
  					

  					simulation.on("tick", ticked);

  					



  					function ticked() {
  						svg1.selectAll('line.link')
  						.attr("x1", function(d) { return d.source.x; })
  						.attr("y1", function(d) { return d.source.y; })
  						.attr("x2", function(d) { return d.target.x; })
  						.attr("y2", function(d) { return d.target.y; });

  						svg1.selectAll('circle.node')
  						.attr("cx", function(d) { return d.x; })
  						.attr("cy", function(d) { return d.y; });
  					}
  					
  					

  				}
  			});




  			//});

	function parseDate (dateString) {
		var parser = d3.timeParse("%y-%b");
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
