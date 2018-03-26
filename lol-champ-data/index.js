var data;

// // get data
// if (document.location.host) {
//   // on website
//   $.getJSON("./data.json", function(d) {
//     data = d;
//   });
// }
// else {
  // on local host
  data = localData;
// }

var svg = d3.select('div#chart-container').append('svg').attr('width', 1000).attr('height', 600);
var chart = svg.append('g').attr('id', 'chart');

chart.append('text').attr({'class': 'label', 'id': 'name', 'x': 70, 'y': 40});
chart.append('text').attr({'class': 'label', 'id': 'win', 'x': 70, 'y': 80});
chart.append('text').attr({'class': 'label', 'id': 'ban', 'x': 70, 'y': 120});
chart.append('text').attr({'class': 'label', 'id': 'pick', 'x': 70, 'y': 160});

chart.append('g').attr({'id': 'xAxis', 'transform': 'translate(0, 540)'});
chart.append('g').attr('id', 'yAxis').attr('transform', 'translate(65, 0)');
chart.append('line').attr('id', 'bestfit');
chart.append('text').attr({'id': "xLabel", 'x': "500", 'y': "580", 'text-anchor': "middle"}).text('禁用率');
chart.append('text').attr({'id': "yLabel", 'text-anchor': "middle", 'transform': 'translate(20, 330)rotate(-90)'}).text('勝率');

var margin = {top: 20, right: 20, bottom: 50, left: 70};
var width = +svg.attr("width") - margin.left - margin.right;
var height = +svg.attr("height") - margin.top - margin.bottom;
var pointColor = d3.scale.category20b(), pointSize = 8;

var xAxis = "ban", yAxis = "win";
var domain = {
  'ban': [0, 50],
  'win': [44, 56],
  'pick': [0, 30]
};
var xScale;
var yScale;

updateChart(true);

$('.btn-axis').on('click', function() {
  $(this).addClass('active').siblings().removeClass('active');
  let rel = $(this).attr('rel');
  let text = $(this).text();
  if( $(this).hasClass('btn-xAxis') ) {
    xAxis = rel;
    $('#xLabel').text(text);
  }
  else {
    yAxis = rel;
    $('#yLabel').text(text);
  }
  updateChart();
});


function updateChart(init) {

  xScale = d3.scale.linear().domain(domain[xAxis]).range([margin.left, width]);
  yScale = d3.scale.linear().domain(domain[yAxis]).range([height, margin.bottom]);
  chart.select('#xAxis').call(function(g) {
    let axis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(function(d) {
      return d+"%";
    })
    g.call(axis);
  });
  chart.select('#yAxis').call(function(g) {
    let axis = d3.svg.axis().scale(yScale).orient("left").tickFormat(function(d) {
      return d+"%";
    })
    g.call(axis);
  });

  if(init) {
    chart.selectAll('circle').data(data).enter().append('circle').attr('r', pointSize).style('cursor', 'pointer')
    .attr('cx', function(d) {
      console.log(d);
      return xScale(d[xAxis]);
    }).attr('cy', function(d) {
      return yScale(d[yAxis]);
    }).attr('fill', function(d, i) {
      return pointColor(i);
    }).on('click', function(d) {
      window.open("https://lol.garena.tw/game/champion/"+d.en);
    }).on('mouseover', function(d) {
      chart.select('#name').text(d.name+" "+d.en).transition().style('opacity', 1);
      chart.select('#win').text("勝率: "+d.win+"%").transition().style('opacity', 1);
      chart.select('#ban').text("禁用率: "+d.ban+"%").transition().style('opacity', 1);
      chart.select('#pick').text("出場率: "+d.pick+"%").transition().style('opacity', 1);
    }).on('mouseout', function(d) {
      chart.select('#name').transition().duration(1000).style('opacity', 0);
      chart.select('#win').transition().duration(1000).style('opacity', 0);
      chart.select('#ban').transition().duration(1000).style('opacity', 0);
      chart.select('#pick').transition().duration(1000).style('opacity', 0);
    }).append("svg:title").text(function(d) { return d.name; });
  }
  else {
    chart.selectAll('circle')
    .attr('cx', function(d) {
      return xScale(d[xAxis]);
    }).attr('cy', function(d) {
      return yScale(d[yAxis]);
    });
  }
}

function updateCorrelation() {
  var xArray = _.map(data, function(d) {return d[xAxis];});
  var yArray = _.map(data, function(d) {return d[yAxis];});
  var c = getCorrelation(xArray, yArray);
  var x1 = xScale.domain()[0], y1 = c.m * x1 + c.b;
  var x2 = xScale.domain()[1], y2 = c.m * x2 + c.b;

  // Fade in
  d3.select('#bestfit')
  .style('opacity', 0)
  .attr({'x1': xScale(x1), 'y1': yScale(y1), 'x2': xScale(x2), 'y2': yScale(y2)})
  .transition()
  .duration(1500)
  .style('opacity', 1);
}
