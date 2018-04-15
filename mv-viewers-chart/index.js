var margin = {top: 40, right: 100, bottom: 0, left: 175},
width = 1200 - margin.left - margin.right,
height = 550 - margin.top - margin.bottom;

var y = d3.scale.linear()
.range([0, height-100]);

var yNeg = d3.scale.linear()
.range([height-100, 0]);

var barHeight = 25;

var color = d3.scale.ordinal()
.range(["#000000", "#111111"]);

var duration = 750,
delay = 25;

var partition = d3.layout.partition()
.value(function(d) { return d.viewers; });

var yAxis = d3.svg.axis()
.scale(y)
.orient("left");
var yAxisNeg = d3.svg.axis()
.scale(yNeg)
.orient("left");

var svg = d3.select("#svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("rect")
.attr("class", "background")
.attr("width", width)
.attr("height", height)
.on("click", up)


svg.append("text")
.attr({
  'text-anchor': "middle",
  'transform': `translate(-120, ${height*0.5})`,
  'class': 'label',
  'id': "x-label",
})
.html("觀看人數");
svg.append("text")
.attr({
  'text-anchor': "middle",
  'transform': `translate(-120, ${height*0.5+30})`,
  'class': 'label',
})
.html("(萬人)");

svg.append("text")
.attr({
  'transform': `translate(${width*0.5}, ${height*0.95})`,
  'class': 'label',
  'id': "y-label",
})
.text("專輯名稱");

svg.append("g")
.attr("class", "y axis");

svg.append("g")
.attr("class", "x axis")
.attr("transform", `translate(0, ${height*0.803})`)
.append("line")
.attr("x1", "100%");

d3.json("https://colman423.github.io/Information-Visualization/mv-viewers-chart/data.json", function(error, root) {
  if (error) throw error;
  // console.log(root);

  partition.nodes(root);
  y.domain([0, root.value]).nice();
  yNeg.domain([0, root.value]).nice();
  down(root, 0);
});

function down(d, i) {
  // console.log(d);
  // console.log(i);
  if (!d.children || this.__transition__) return;
  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter")
  .attr("class", "exit");

  // Entering nodes immediately obscure the clicked-on bar, so hide it.
  exit.selectAll("rect").filter(function(p) { return p === d; })
  .style("fill-opacity", 1e-6);

  // Update the y-scale domain.
  var max = d3.max(d.children, function(d) { return d.value; });
  y.domain([0, max]).nice();
  yNeg.domain([0, max]).nice();

  // Enter the new bars for the clicked-on data.
  // Per above, entering bars are immediately visible.
  var enter = bar(d)
  .attr("transform", stack(i))
  .style("opacity", 1);

  // Have the text fade-in, even though the bars are visible.
  // Color the bars as parents; they will fade to children if appropriate.
  enter.select("text").style("fill-opacity", 1e-6);
  enter.select("rect").style("fill", getColor(d));

  // Update the y-axis.
  svg.selectAll(".y.axis").transition()
  .duration(duration)
  .call(yAxisNeg);

  // Transition entering bars to their new position.
  var enterTransition = enter
  .transition()
  .duration(duration)
  .delay(function(d, i) { return i * delay; })
  .attr("transform", function(d, i) { return `translate( ${barHeight * i * 2.8}, ${height*0})`; });

  // Transition entering text.
  enterTransition.select("text")
  .style("fill-opacity", 1);

  // Transition entering rects to the new y-scale.
  enterTransition.select("rect")
  .attr("height", function(d) { return y(d.value); })
  .style("fill", function(d) { return getColor(d); });

  // Transition exiting bars to fade out.
  var exitTransition = exit
  .transition()
  .duration(duration)
  .style("opacity", 1e-6)
  .remove();

  // Transition exiting bars to the new y-scale.
  exitTransition.selectAll("rect")
  .attr("height", function(d) { return y(d.value); });
  // exit.remove();

  // Rebind the current node to the background.
  svg.select(".background")
  .datum(d)
  .transition()
  .duration(end);

  $('#y-label').text(d.label);

  d.index = i;
}

function up(d, i) {
  // console.log(d);
  // console.log(i);
  if (!d.parent || this.__transition__) return;
  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter")
  .attr("class", "exit");

  // Update the y-scale domain.
  var max = d3.max(d.parent.children, function(d) { return d.value; });
  y.domain([0, max]).nice();
  yNeg.domain([0, max]).nice();

  // Enter the new bars for the clicked-on data's parent.
  var enter = bar(d.parent)
  .attr("transform", function(d, i) { return `translate( ${barHeight * i * 2.8}, 0)`; })
  .style("opacity", 1);
  // Color the bars as appropriate.
  // Exiting nodes will obscure the parent bar, so hide it.
  enter.select("rect")
  .style("fill", function(d) { return getColor(d); })
  // .filter(function(p) { return p === d; })
  .style("opacity", 1e-6).transition()
  .duration(duration)
  .style("opacity", 1);


  // Update the x-axis.
  svg.selectAll(".y.axis").transition()
  .duration(duration)
  .call(yAxisNeg);

  // // Transition entering bars to fade in over the full duration.
  // var enterTransition = enter.transition()
  // .duration(duration)
  // .style("opacity", 1);
  // // Transition entering rects to the new y-scale.
  // // When the entering parent rect is done, make it visible!
  // enterTransition.select("rect")
  // .attr("height", function(d) { return y(d.value); })
  // .each("end", function(p) {  d3.select(this).style("opacity", 1); });

  // Transition exiting bars to the parent's position.
  var exitTransition = exit.selectAll("g").transition()
  .duration(duration)
  .delay(function(d, i) { return i * delay; })
  .attr("transform", stack(d.index));

  // Transition exiting text to fade out.
  exitTransition.select("text")
  .style("fill-opacity", 1e-6);

  // Transition exiting rects to the new scale and fade to parent color.
  exitTransition.select("rect")
  .attr("height", function(d) { return y(d.value); })
  .style("fill", getColor(d));

  // Remove exiting nodes when the last child has finished transitioning.
  exit.transition()
  .duration(end)
  .remove();

  $('#y-label').text(d.parent.label);

  // Rebind the current parent to the background.
  svg.select(".background")
  .datum(d.parent)
  .transition()
  .duration(end);
}

// Creates a set of bars for the given data node, at the specified index.
function bar(d) {
  var bar = svg.insert("g", ".x.axis")
  .attr("class", "enter")
  .attr("transform", "translate(0,0)")
  .selectAll("g")
  .data(d.children)
  .enter().append("g")
  .style("cursor", function(d) { return !d.children ? null : "pointer"; })
  .on("click", down);


  bar.append("text")
  .attr("y", height-60)
  .attr("x", barHeight / 2)
  .attr("dx", ".35em")
  .attr("transform", "translate(280, 70)rotate(40)")
  // .style("text-anchor", "end")
  .attr("font-family", "Comic Sans MS")
  .attr('font-weight', "bold")
  .text(function(d) { return d.name; });

  bar.append("rect")
  .attr("width", barHeight)
  .attr("y", function(d) { return yNeg(d.value); })
  .attr("height", function(d) { return y(d.value); })
  .append("title")
  .text(function(d) {return getTitle(d.value);})

  return bar;
}

// A stateful closure for stacking bars horizontally.
function stack(i) {
  var y0 = height;
  return function(d) {
    var tx = `translate(${barHeight*i*2.8}, ${y0})`;
    // "translate(" + y0 + "," + barHeight * i * 2.8 + ")";
    y0 += yNeg(d.value);
    return tx;
  };
}

function getColor(d) {
  if( d.color ) return d.color;
  else if( d.parent ) return getColor(d.parent);
  else return getColor(d.children[0]);

  // return d.color ? d.color : getColor(d.parent);
}

function getTitle(num) {
  if( num>=10000 ) return (num/10000).toFixed(2)+"億";
  else return num+"萬";
}
