//Creating svg element

var svg_w1 = window.innerWidth / 2;
var svg_h1 = window.innerHeight / 2;

var svg_w2 = window.innerWidth / 2;
var svg_h2 = window.innerHeight / 2;

// var svg1 = d3.select("body").append("svg")
// 	.attr("width", svg_w1)
// 	.attr("height", svg_h1);

var svg2 = d3.select("body").append("svg")
	.attr("width", svg_w2)
	.attr("height", svg_h2);

var margin = 10;
var nodes = [];

//Creating Timeline 

var options = {
	start_at_end: true,
	timevav_position: "bottom",
	dragging: true,
	start_at_slide: 0,
	timenav_height: 300
};

var pack = d3.pack()
	.size([svg_w1, svg_h1])
	.padding(3);

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

			var timeline = new TL.Timeline('timeline-embed', data, options);

			var max_num = 0;


			for (var event of test_file) {
				nodes.push({
					id: event.Category,
					number_searches: event.Num_searches_category
				});
				if (event.Num_searches_category < max_num) {
					max_num = event.Num_searches_category;
				}
			}


			var radius_scale = d3.scaleLinear()
				.domain([0, max_num])
				.range([50, 150]);

			var radius_color = d3.scaleLinear()
				.domain([0, max_num])
				.range(["pink", "#2b90f5"]);


			console.log('blah');
			var node = svg2.append("g")
				.selectAll("bubble")
				.data(nodes)
				.enter();

			node.append("circle")
				.style("fill", d => radius_color(d.Num_searches_category))
				.attr("r", d => radius_scale(d.Num_searches_category))
				.attr("stroke", "black")
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));
			console.log('blah2');

			node.append("text")
				.attr("x", function(d) {
					return d.x;
				})
				.attr("y", function(d) {
					return d.y;
				})
				.attr("text-anchor", "middle")
				.text(function(d) {
					return d.id;
				})
				.style({
					"fill": "black",
					"font-family": "Helvetica Neue, Helvetica, Arial, san-serif",
					"font-size": "12px"
				});
			console.log('blah3');
		}

	});



var slide_count = 2, // how many slides you have
	delay = 100000000; //delay between slides

var url = window.location.href;
var hash = parseInt(url.substring(url.indexOf("#") + 1));
if (isNaN(hash)) window.location.href = "#0";

function autoplay() {
	var url = window.location.href;
	var hash = parseInt(url.substring(url.indexOf("#") + 1));
	if (isNaN(hash) || hash === slide_count) window.location.href = "#0";
	else {
		$('.nav-next').trigger('click');
	}
}

setInterval(function() {
	autoplay()
}, delay);

// var simulation = d3.forceSimulation()
// 	.nodes(nodes)
// 	.force("charge", d3.forceManyBody())
// 	.force("center", d3.forceCenter(svg_w1 / 2, svg_h1 / 2));


// simulation.nodes(nodes).on("tick", ticked);

// function ticked() {
//  node
//     .attr("cx", function(d) {
//        return d.x;})
//     .attr("cy", function(d) {
//       return d.y;});
// };
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