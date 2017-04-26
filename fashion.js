var svg_w1 = window.innerWidth / 2;
var svg_h1 = window.innerHeight / 2;

var svg_w2 = window.innerWidth / 2;
var svg_h2 = window.innerHeight / 2;

var svg1 = d3.select("body").append("svg")
.attr("width", svg_w1)
.attr("height", svg_h1);

var svg2 = d3.select("body").append("svg")
.attr("width", svg_w2)
.attr("height", svg_h2);

var margin = 10;

svg1.append('rect')
.attr('width', svg_w1 - margin)
.attr('height', svg_h1 - margin)
.attr('x', margin)
.attr('y', svg_h1 - margin)
.attr('stroke', 'black');

svg2.append('rect')
.attr('width', svg_w2 - margin)
.attr('height', svg_h2 - margin)
.attr('x', svg_w2 + margin)
.attr('y', svg_h1 - margin)
.attr('stroke', 'black');


