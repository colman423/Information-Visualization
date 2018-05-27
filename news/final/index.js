var margin = {
    top: 60,
    right: 10,
    bottom: 30,
    left: 60
};
var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var svg = d3.select('#svg');
var xLine = svg.append("g").attr("class", "x axis").attr("transform", `translate(${margin.left}, ${height+margin.top})`);
var yLine = svg.append("g").attr("class", "y axis").attr("transform", `translate(${margin.left}, ${margin.top})`);
var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
    return `<strong>${d.name} ${d.value} ${d.sum}</strong>`;
});
svg.call(tip);

var xScale = d3.scale.ordinal()
.domain([103, 104, 105, 106, 107])
.rangeRoundBands([0, width]);

var yScale = d3.scale.linear()
.domain([0,5000])
.range([0, height])

var y = d3.scale.linear()
.domain([0,5000])
.range([height, 0]);

var colors = d3.scale.category10();

xLine.call(function(g){
    let axis = d3.svg.axis().scale(xScale).orient("bottom");
    g.call(axis);
});

yLine.call(function(g){
    let axis = d3.svg.axis().scale(y).orient("left");
    g.call(axis);
});

d3.json("http://ghost.cs.nccu.edu.tw/~s10329/vis/news/quota.json", function(err, data) {
    // console.log(err);
    console.log(data);
    let g = svg.append('g').attr('class', 'bar');
    g.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr({
        'x': function(d) {
            return xScale(d.year) + margin.left + margin.right;
        },
        'y': function(d) {
            return y(d.sum) + margin.top;
        },
        'id': function(d) {
            return d.name;
        },
        'width': 105,
        'height': function(d) {
            return yScale(d.value);
        },
        'fill': function(d, i){return colors(d.name)}
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .on('click', function(d) {
        console.log(d);
    })
});
