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
    return `<strong>${d.category} ${d.quota}</strong>`;
});
svg.call(tip);

var xScale = d3.scale.ordinal()
.domain([103, 104, 105, 106, 107, "sum"])
.rangeRoundBands([0, width]);

var yScale = d3.scale.linear()
.domain([0,2000])
.range([0, height])

var y = d3.scale.linear()
.domain([0,2000])
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

d3.json("./quota.json", function(err, data) {
    console.log(data);


    for( let i=0; i<data.length; i++ ) {
        let item = data[i];
        let label = item['year'];
        let g = svg.append('g').attr('class', 'bar');    //year bar

        let prevHeight = 0;

        g.selectAll('rect')
        .data(item.data)
        .enter()
        .append('rect')
        .attr({
            'x': function() {
                return xScale(label) + margin.left + margin.right;
            },
            'y': function(d) {
                console.log(d);
                console.log(prevHeight);
                return y(d.quota) + margin.top - prevHeight;
            },
            'id': function(d) {
                return d.category+"-"+d.quota;
            },
            'width': 105,
            'height': function(d){
                let h = yScale(d.quota);
                prevHeight += h;
                return h;
            },
            'fill': function(d, i){return colors(i)},
        })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
        // }
    }

});
