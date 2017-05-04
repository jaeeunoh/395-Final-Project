	//Creating svg element
	var svg_w1 = window.innerWidth;
	var svg_h1 = window.innerHeight;
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
	.defer(d3.csv, "node_list_test.csv")
	.defer(d3.csv, "edge_list_test.csv")
	.await(function(error, node_list, edge_list) {

				// Create nodes of categories
				// nodes 
				for (var event of node_list) {
					nodes.push({
						id: event.Node,
						label: event.Node,
						value: event.Popularity,
						month: event.Month,
						group: event.Type
					});

					if (parseInt(event.Popularity) > max_num || parseInt(event.Popularity) > max_num) {
						max_num = Math.max(parseInt(event.Popularity), parseInt(event.Popularity));
					}
				}
				
				// edges
				for (var edge of edge_list) {
					edges.push({
						from: edge.Category,
						to: edge.Event,
						month: edge.Month,
						value: edge.Link
					})
					if (!nodes.find(node => node.id == edge.source)) {
						nodes.push({
							id: edge.Category,
							label: edge.Category,
							value: 50,
							month: edge.Month,
							group: "Clothing"
						})
					}
					if (!nodes.find(node => node.id == edge.target)) {
						nodes.push({
							id: edge.Event,
							label: edge.Event,
							value: 50,
							month: edge.Month,
							type: 'Event'
						})
					}
				}
				

				// Create scales
				var radius_scale = d3.scaleLinear()
				.domain([0, max_num])
				.range([10, 100]);

				var radius_color = d3.scaleLinear()
				.domain([0, max_num])
				.range(["pink", "#2b90f5"]);

				for (var node of nodes) {
					node.radius = radius_scale(node.number_searches);
					node.color = radius_color(node.number_searches);
				}



				// Create node and edges
				node = svg1.append("g")
				.attr("class", "nodes")
				.selectAll('circle')
				.data(nodes);

				link = svg1.append("g")
				.attr("class", "links")
				.selectAll('line')
				.data(edges);

				d3.select("#nRadius").on("input", function() {
					updateView(this.value);

				});

				// Initial starting radius of the circle 
				updateView(0);



				// update the elements
				function updateView (nRadius) {
					// filter data
					curNodes = nodes.filter(d => parseDate(d.month) == nRadius);
					curEdges = edges.filter(d => parseDate(d.month) == nRadius);
					console.log(curNodes);
					// adjust the text on the range slider
					d3.select("#nRadius-value").text(nRadius);
					d3.select("#nRadius").property("value", nRadius);
					

					
					// Update nodes 
					//node.exit().remove();
					node.enter()
					.append('circle')
					.merge(node)
					.attr('r', d => (parseDate(d.month) == nRadius) * radius_scale(d.value))


  					// Update links
  					//link.exit().remove()
  					link.enter()
  					.enter()
  					.append('line')
  					.merge(link)
  					.attr('stroke-width', d => (parseDate(d.month) == nRadius) * 5);
  					
  					simulation
					.nodes(node)
					.on("tick", ticked);

					simulation.force("link")
					.links(edge);


  					function ticked() {
  						link
  						.attr("x1", function(d) { return d.source.x; })
  						.attr("y1", function(d) { return d.source.y; })
  						.attr("x2", function(d) { return d.target.x; })
  						.attr("y2", function(d) { return d.target.y; });

  						node
  						.attr("cx", function(d) { return d.x; })
  						.attr("cy", function(d) { return d.y; });
  					}
  					//node.exit().remove();
  					//link.exit().remove();

  				};




  			});

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
