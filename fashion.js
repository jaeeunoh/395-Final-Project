//Creating svg element 
var svg_width = 900;
var svg_height = 900;
//Creating svg for the network
var svg_network = d3.select("div.network").append("svg")
	.attr("width", svg_width)
	.attr("height", svg_height);
//Create array nodes and edges to contain data
var nodes = [];
var edges = [];
//Keep track time of the slider
var myTimer;
//Array for autocompletion
var autocomplete_array = [];
//Speed of the slider
var speed = 0;

//Function to change the speed for 3 different levels
function changeSpeed() {
	if (document.getElementById("speed").value == "800") {
		speed = 800;
	} else if (document.getElementById("speed").value == "1500") {
		speed = 1500;
	} else if (document.getElementById("speed").value == "3000") {
		speed = 3000;
	}
}
//Loading data and create visualization
d3.queue()
	.defer(d3.csv, "data-processing/node_list.csv") 
	.defer(d3.csv, "data-processing/edge_list.csv") 
	.defer(d3.csv, "data-processing/node_url.csv") // list containing url to a picture 
	.await(function(error, node_list, edge_list, node_url) {
		// Create nodes of categories and events 
		for (var event of node_list) {
			var obj = {};
			obj = {
				id: event.Node,
				label: event.Node,
				group: event.Type,
				value: event.value0,
				x: event.x,
				y: event.y,
				active: event.active0
			};
			// Create value for edges for each object
			for (i = 0; i < 48; i++) {
				obj["value" + i] = eval("event.value" + i);
			}
			//Create value indicating whether the event is active within 2 months
			for (i = 0; i < 48; i++) {
				obj["active" + i] = eval("event.active" + i);
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
					if (nodes[i].group == "Event") {
						nodes[i].url_event = url.url_event;
					}
				}

			}
		}

		//Filter the edges which has high correlation
		edges.forEach(function(d) {
			d.sum = 0;
			for (var i = 0; i < 48; i++) {
				d.sum += eval("Math.abs(d.value" + i + ")");
			}
			d.sum = d.sum / 48;
		});
		edges = edges.filter(d => d.sum >= 0.5);

		
		/* ------------- Create different scales  ---------------------- */
		// Create scale for node radius
		var radius_scale = d3.scaleLinear()
			.domain([0, 100])
			.range([0, 20]);

		// Create scale for edge link 
		var link_scale = d3.scaleLinear()
			.domain([0.7, 1])
			.range([0.5, 5]);


		// Assign source and target 
		edges.forEach(function(d) {
			for (var node of nodes) {
				if (node.id == d.source) {
					d.source = node;
					break;
				}
			}
			for (var node of nodes) {
				if (node.id == d.target) {
					d.target = node;
					break;
				}
			}
		});

		
		/* ------------- Create SVG element in the network container */
		// Create link grouop
		linkG = svg_network.append("g")
			.attr("class", "links");

		// Create links 
		link = linkG.selectAll('path')
			.data(edges)
			.enter()
			.append('path')
			.attr('class', 'link')
			.style('opacity', 0.5);

		// Create node group 
		nodeG = svg_network.append("g")
			.attr("class", "nodes");

		// Create nodes 
		node = nodeG.selectAll('circle')
			.data(nodes)
			.enter()
			.append("circle")
			.attr('class', 'node')
			.style('opacity', 0.8);

		// Allow nodes to be draggable
		node.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended));

		// Click to show the image on the right 
		node.on("click", function(d) {
			if (d.group == "Clothing") {
				d3.select('#category_img') // display cateogry image 
					.attr('src', d.url);
				var t = d.id;
				d3.select("#category_name") // display category name 
					.text(function(d) {
						return t;
					})
			}

		});

		// Create event images for event circles 
		var image = nodeG.selectAll("image")
			.data(nodes)
			.enter()
			.append("image")
			.attr("xlink:href", function(d) {
				if (d.group == "Event") {
					return d.url_event;
				}
			})
			.attr("width", function(d) {
				if (d.group == "Event") {
					return "80px";
				} else {
					return "0px";
				}
			})
			.attr("height", function(d) {
				if (d.group == "Event") {
					return "80px";
				} else {
					return "0px";
				}
			});

		// Allow event images to be draggable
		image.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended));


		/* ---------- Highlight neighboring nodes ------------------ */
		// Mouse over to highlight the connected nodes 
		var tool_tip = d3.tip()
			.attr("class", "d3-tip")
			.offset([-8, 0]);

		node.call(tool_tip);
		node.on('mouseover', function(d) {
				tool_tip.html(d.id).show();
				if (selectedNodes.length == 0) {
					searchNode([d.id]);
				} else {
					if (selectedNodes.indexOf(d.id) == -1) {
						node.filter(function(n) {
								return n.id == d.id;
							})
							.attr('r', radius_scale(d.value) * 1.5)
							.style('opacity', 1);

						link.filter(function(l) {
								return l.source.id == d.id;
							})
							.style('opacity', 1);
					}
				}
			})


			.on('mouseout', function(d) {
				tool_tip.hide();
				if (selectedNodes.length == 0) {
					reset();
				} else {
					node.filter(function(n) {
							return selectedNodes.indexOf(n.id) == -1;
						})
						.attr('r', d => radius_scale(d.value))
						.style('opacity', 0.2);

					link.filter(function(l) {
							return selectedNodes.indexOf(l.source.id) == -1;
						})
						.style('opacity', 0.1);
				}

			});

		
		/* ------------ Create Search Autocomplete ----------------- */

		//Create list of autocomplete
		for (var i = 0; i < nodes.length - 1; i++) {
			if (nodes[i].group == "Clothing") {
				autocomplete_array.push(nodes[i].id);
			}
		}
		autocomplete_array = autocomplete_array.sort();

		//Highlight characters found in the autocomplete box
		$(function() {
			function highlightText(text, $node) {
				var searchText = $.trim(text).toLowerCase(),
					currentNode = $node.get(0).firstChild,
					matchIndex, newTextNode, newSpanNode;
				while ((matchIndex = currentNode.data.toLowerCase().indexOf(searchText)) >= 0) {
					newTextNode = currentNode.splitText(matchIndex);
					currentNode = newTextNode.splitText(searchText.length);
					newSpanNode = document.createElement("span");
					newSpanNode.className = "highlight";
					currentNode.parentNode.insertBefore(newSpanNode, currentNode);
					newSpanNode.appendChild(newTextNode);
				}
			}

			//Extract the first element of the array
			function extractLast(term) {
				return term.split(/,\s*/).pop();
			}
			
			//Create dropdown autocomplete and allow for multiple searches
			$("#search")
				.on("keydown", function(event) {
					if (event.keyCode === $.ui.keyCode.TAB &&
						$(this).autocomplete("instance").menu.active) {
						event.preventDefault();
					}
				})
				.autocomplete({
					source: autocomplete_array,
					source: function(request, response) {
						// delegate back to autocomplete, but extract the last term
						response($.ui.autocomplete.filter(
							autocomplete_array, extractLast(request.term)));
					},
					select: function(event, ui) {
						var terms = this.value.split(/,\s*/);
						// remove the current input
						terms.pop();
						// add the selected item
						terms.push(ui.item.value);
						// add placeholder to get the comma-and-space at the end
						terms.push("");
						this.value = terms.join(", ");
						return false;
					}
				})
				.data("ui-autocomplete")._renderItem = function(ul, item) {
					var $a = $("<a></a>").text(item.label);
					highlightText(this.term, $a);
					return $("<li></li>").append($a).appendTo(ul);
				};
		});

		//Set response to the search button
		var selectedNodes = [];
		d3.select("#autocomplete").on("click", function() {

			//find the array of nodes in the search box
			var selectedVal = document.getElementById('search').value;
			if (selectedVal == "none") {
				// node.attr("stroke", "white")
				// .attr("stroke-width", "1");
			} else {
				//Create an array to hold different search items
				selectedNodes = selectedVal.split(/,\s*/);
				selectedNodes = selectedNodes.slice(0, -1); // skip the last string
				searchNode(selectedNodes);
			}
		});

		//Set response to reset button
		d3.select("#reset").on("click", function() {
			selectedNodes = [];
			reset();
		})

		function searchNode(nodeIdArray) {
			// Updating node opacity and radius
			node
				.attr('r', function(d) {
					return nodeIdArray.indexOf(d.id) != -1 ? radius_scale(d.value) * 1.5 : radius_scale(d.value);
				})
				.style("opacity", function(d) {
					return nodeIdArray.indexOf(d.id) != -1 ? 1 : 0.2;
				});

			// Updating connected link

			link
				.style("opacity", function(d) {
					return nodeIdArray.indexOf(d.source.id) != -1 ? 1 : 0.1;
				});
			}

		function reset() {
			node.attr('r', d => radius_scale(d.value))
				.style('opacity', 0.8);
			link.style('opacity', 0.5);
		}
		
		/* ------------ Update view based on Time -------------------- */

		//Update view as slider changes
		d3.select("#nRadius").on("input", function() {
			updateView(this.value);
		});
		//Set initial point on slider
		updateView(0);

		//Formating the input date for printing purpose
		function formatDate(date) {
			var months = [
				"January", "February", "March",
				"April", "May", "June", "July",
				"August", "September", "October",
				"November", "December"
			];

			var month = date.getMonth();
			var year = date.getFullYear();
			return months[month] + ' ' + year;
		}

		//Update view
		function updateView(nRadius) {
			//Set initial and updated point as the slider moves
			var startdate = new Date(2012, 0, 1);
			var updated = new Date(startdate.setMonth(startdate.getMonth() + nRadius));
			nodes.forEach(function(d) {
				d.value = eval("d.value" + nRadius);
				d.active = eval("d.active" + nRadius)
			});
			//Set format of the date
			d3.select("#nRadius-value").text(formatDate(updated))
				.style("font-family", "Poppins")
				.style("font-size", "20px")
				.style("text-align", "center");
			d3.select("#nRadius").property("value", nRadius);

			// Update positions
			ticked();

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
						return "#000";
					} else {
						return "transparent";
					}
				});


			//Update links
			link = link.attr('stroke-width', function(d) {
					if (eval("Math.abs(d.value" + nRadius + ")") < 0.7) {
						return 0;
					} else {
						return link_scale(eval("Math.abs(d.value" + nRadius + ")"));
					}

				})
				.attr("stroke", function(d) {
					if (eval("d.value" + nRadius) < 0) {
						return "#003399";
					} else {
						return "#801515";
					}
				})
				.merge(link);
			// Update images
			image = image.attr('width', function(d) {
					if (d.group == "Event") {
						if (d.active == 1) {
							return "90px";
						} else {
							return "50px";
						}
					} else {
						return "0px";
					}
				})
				.attr('height', function(d) {
					if (d.group == "Event") {
						if (d.active == 1) {
							return "120px";
						} else {
							return "50px";
						}
					} else {
						return "0px";
					}
				});

			// Create timer functions 
			d3.select("#start").on("click", function() {
				clearInterval(myTimer);
				if (speed == 0) {
					speed = 1000;
				}
				myTimer = setInterval(function() {
					var b = d3.select("#nRadius");
					var t = (+b.property("value") + 1) % (+b.property("max") + 1);
					if (t == 0) {
						t = +b.property("min");
					}
					if (parseInt($("#nRadius").val()) == 47) {
						clearInterval(myTimer); //stop the autoplay
					}
					d3.select("#nRadius-value").text(t);
					d3.select("#nRadius").property("value", t);
					b.property("value", t);
					updateView($("#nRadius").val());
				}, speed);
			});

			d3.select("#pause").on("click", function() {
				clearInterval(myTimer);
			});

			d3.select("#stop").on("click", function() {
				d3.select("#nRadius-value").text(formatDate(new Date(2012, 0, 1)))
					.style("font-family", "Poppins")
					.style("font-size", "20px")
					.style("text-align", "center");
				d3.select("#nRadius").property("value", 0);
				clearInterval(myTimer);
			});

		}; // end updateView


		function ticked() {
			svg_network.selectAll('path.link')
				.attr("d", function(d) {
					var dx = d.target.x - d.source.x,
						dy = d.target.y - d.source.y,
						dr = Math.sqrt(dx * dx + dy * dy);
					return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
				})
			svg_network.selectAll('circle.node')
				.attr("cx", function(d) {
					return d.x;
				})
				.attr("cy", function(d) {
					return d.y;
				});
			svg_network.selectAll('image').attr("transform", function(d) {
				var x = d.x - 15;
				var y = d.y - 30;
				return "translate(" + x + "," + y + ")";
			});

		};

		// Dragging helper functions that use simulation 
		function dragstarted(d) {
			d.x = d.x;
			d.y = d.y;
		};

		function dragged(d) {
			d.x = d3.event.x;
			d.y = d3.event.y;

		};

		function dragended(d) {
			if (!d3.event.active) {
				ticked();
				d.x = d3.event.x;
				d.y = d3.event.y;
			}
		};

		var width = 1140,
			height = 20,
			padding = 10;

		// Create svg for time range scales 
		var svg = d3.select('div.tick').append('svg')
			.attr('width', width)
			.attr('height', height);

		var mindate = new Date(2012, 0, 1),
			maxdate = new Date(2015, 10, 31);

		// Scale for the time range 
		var scale = d3.scaleTime()
			.domain([mindate, maxdate])
			.range([10, width]);

		var axis = d3.axisBottom(scale).ticks(47).tickFormat(d3.timeFormat("%m"));

		// Create the ticks for time range 
		svg.append('g')
			.attr('transform', 'translate(' + -5 + ', ' + 1 + ')')
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
			.attr("class", "year_tick")
			.attr("x", function(d, i) {
				return 285 * i;
			})
			.attr("y", 8)
			.text(function(d) {
				return d;
			});

	});