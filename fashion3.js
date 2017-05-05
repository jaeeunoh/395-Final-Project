var nodes = [];
var edges = [];
var max_num = 0;
var months = [];

var svg_w1 = window.innerWidth;
	var svg_h1 = window.innerHeight;
	var svg1 = d3.select("body").append("svg")
	.attr("width", svg_w1)
	.attr("height", svg_h1);

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
				
				var container = document.getElementById("mynetwork");
				

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

					var data = {
						nodes: curNodes,
						edges: curEdges
					}

					var options = {
						nodes: {
							shape: 'dot',
							scaling: {
								customScalingFunction: function (min,max,total,value) {
									return value/total;
								},
								min:5,
								max:150
							}
						},

						edges: {
							scaling: {
								customScalingFunction: function(min, max, total,value) {
									return value/total;
								},
								min:1,
								max: 10
							}
						},
						physics: {
							stabilization: {
								enabled: false
								
							}
						}
					};

					network = new vis.Network(container, data, options);
					

				};




			});

function parseDate (dateString) {
	var parser = d3.timeParse("%b-%y");
	var date = parser(dateString);
	return (date.getFullYear() - 2012) * 12 +  date.getMonth();
}

			