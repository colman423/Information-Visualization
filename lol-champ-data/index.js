$.getJSON("https://colman423.github.io/Information-Visualization/lol-champ-data/data.json", function(data) {
  var w = $('#chart-container').width();
  console.log(w);
  var svg = d3.select('div#chart-container').append('svg').attr('width', w).attr('height', w*0.63);
  var chart = svg.append('g').attr('id', 'chart');
  var pointContainer = svg.append('g').attr('id', 'point-container');

  chart.append('text').attr({'class': 'info', 'id': 'name', 'x': w*0.55, 'y': 40});
  chart.append('text').attr({'class': 'info', 'id': 'win', 'x': w*0.55, 'y': 80});
  chart.append('text').attr({'class': 'info', 'id': 'ban', 'x': w*0.55, 'y': 120});
  chart.append('text').attr({'class': 'info', 'id': 'pick', 'x': w*0.55, 'y': 160});
  chart.append('svg:image').attr({'class': 'info', 'id': 'photo', 'x': w*0.75, 'y': 50});

  chart.append('g').attr({'id': 'xAxis', 'transform': 'translate(0, '+w*0.568+')'});
  chart.append('g').attr('id', 'yAxis').attr('transform', 'translate(65, 0)');
  chart.append('line').attr('id', 'bestfit');
  chart.append('text').attr({'id': "xLabel", 'x': "500", 'y': w*0.61, 'text-anchor': "middle"}).text('禁用率');
  chart.append('text').attr({'id': "yLabel", 'text-anchor': "middle", 'transform': 'translate(15, 330)rotate(-90)'}).text('勝率');

  var margin = {top: 20, right: 20, bottom: 50, left: 70};
  var width = +svg.attr("width") - margin.left - margin.right;
  var height = +svg.attr("height") - margin.top - margin.bottom;
  var pointColor = d3.scale.category20b(), pointSize = 8;

  var xAxis = "win", yAxis = "ban";
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
      pointContainer.selectAll('circle').data(data).enter().append('circle').attr('r', pointSize).style('cursor', 'pointer')
      .attr('cx', function(d) {
        return xScale(d[xAxis]);
      }).attr('cy', function(d) {
        return yScale(d[yAxis]);
      }).attr('fill', function(d, i) {
        return pointColor(i);
      }).on('click', function(d) {
        window.open(getUrl(d.en));
      }).on('mouseover', function(d) {
        chart.select('#name').text(d.name+" "+d.en).transition().style('opacity', 1);
        chart.select('#win').text("勝率: "+d.win+"%").transition().style('opacity', 1);
        chart.select('#ban').text("禁用率: "+d.ban+"%").transition().style('opacity', 1);
        chart.select('#pick').text("出場率: "+d.pick+"%").transition().style('opacity', 1);
        chart.select('#photo').attr('xlink:href', getPhoto(d.en)).transition().style('opacity', 1);
      }).on('mouseout', function(d) {
        chart.selectAll('.info').transition().duration(1000).style('opacity', 0);
      }).append("svg:title").text(function(d) { return d.name; });
    }
    else {
      pointContainer.selectAll('circle')
      .attr('cx', function(d) {
        return xScale(d[xAxis]);
      }).attr('cy', function(d) {
        return yScale(d[yAxis]);
      });
    }
    updateCorrelation();
  }
  function updateCorrelation() {
    var xArray = _.map(data, function(d) {return parseInt(d[xAxis]);});
    var yArray = _.map(data, function(d) {return parseInt(d[yAxis]);});
    var c = getCorrelation(xArray, yArray);
    var x1 = xScale.domain()[0], y1 = c.m * x1 + c.b;
    var x2 = xScale.domain()[1], y2 = c.m * x2 + c.b;

    // Fade in
    d3.select('#bestfit')
    .style('opacity', 0)
    .attr({'x1': xScale(x1), 'y1': yScale(y1), 'x2': xScale(x2), 'y2': yScale(y2)})
    .transition()
    .duration(200)
    .style('opacity', 1);
  }

});
