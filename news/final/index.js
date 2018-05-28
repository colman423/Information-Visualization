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
    return `<strong>${d.name}<br>招生名額：${d.value}<br>總計：${d.sum}</strong>`;
});
svg.call(tip);

var xScale = d3.scale.ordinal()
.domain([103, 104, 105, 106, 107])
.rangeRoundBands([0, width]);

var yScale, y;

function setScale(data) {
    var max = d3.max(data, function(d) {return d.sum;});

    yScale = d3.scale.linear().domain([0, max]).range([0, height]);
    y = d3.scale.linear().domain([0, max]).range([height, 0]);

    xLine.transition().duration(500).call(d3.svg.axis().scale(xScale).orient("bottom"));
    yLine.transition().duration(500).call(d3.svg.axis().scale(y).orient("left"));
}

var colors = d3.scale.category10();
function setColor(name) {
    if( name=="第一類組" || name=="科大第一類組" ) return colors(1);
    else if( name=="第二類組" || name=="科大第二類組" ) return colors(2);
    else if( name=="第三類組" || name=="科大第三類組" ) return colors(3);
    else if( name=="第四類組" || name=="科大第四類組" ) return colors(4);
    else return colors(name);
}

var bigData;
var nowTitle = "";
function appendLittle(data) {
    console.log("append");
    console.log(data);
    setScale(data);

    svg.selectAll(`rect[id="${nowTitle}"]`)
    .transition()
    .duration(500)
    .attr({
        'y': function(d) {
            return y(d.value)+margin.top;
        },
        'height': function(d) {
            return yScale(d.value);
        }
    });
    svg.selectAll(`rect:not([id="${nowTitle}"])`)
    .transition()
    .duration(500)
    .attr({
        x: -100,
        width: 0,
        y: 0
    });

    svg.selectAll('.bar')
    .transition()
    .duration(1000)
    .style('opacity', 0)
    .remove();

    svg.append('g').attr('class', 'bar')
    .selectAll('rect')
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
        'width': 130,
        'height': function(d) {
            return yScale(d.value);
        },
        'fill': function(d, i){return setColor(d.name)},
        "opacity": 0
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .transition()
    .duration(1000)
    .attr('opacity', 1);
}

function appendBig(data, clickAction) {
    console.log("append");
    console.log(data);
    setScale(data);

    if( nowTitle ) {
        let scale = {};
        for( let i=0; i<data.length; i++ ) {
            if( data[i].name==nowTitle ) {
                scale[data[i].year] = {value: data[i].value, sum: data[i].sum};
            }
        }
        console.log(scale);

        svg.selectAll(`rect`)
        .transition()
        .duration(500)
        .attr({
            'y': function(d) {
                return y(scale[d.year].sum) + margin.top;
            },
            'height': function(d) {
                return yScale(scale[d.year].value);
            }
        });
        nowTitle = "";

        svg.selectAll('.bar')
        .transition()
        .duration(1000)
        .style('opacity', 0)
        .remove();
    }
    else {
        svg.selectAll('.bar')
        .transition()
        .duration(1000)
        .style('opacity', 0)
        .remove();
    }


    svg.append('g').attr('class', 'bar')
    .selectAll('rect')
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
        'width': 130,
        'height': function(d) {
            return yScale(d.value);
        },
        'fill': function(d, i){return setColor(d.name)},
        "opacity": 0
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .on('click', function(d) {
        let data = [];
        if( !d.children ) {
            let name = d.name;
            for( let i=0; i<bigData.length; i++ ) {
                if( bigData[i].name==name) {
                    let copy = Object.assign({}, bigData[i]);
                    copy.sum = copy.value;
                    data.push(copy);
                }
            }
            console.log(data);
            nowTitle = name;
        }
        else {
            let name = d.name;
            for( let i=0; i<bigData.length; i++ ) {
                if( bigData[i].name==name) {
                    let year = bigData[i].year;
                    let child = bigData[i].children.slice();
                    for( let j=0; j<child.length; j++ ) {
                        data.push( Object.assign({ "year": year }, child[j]) );
                    }
                }
            }
            console.log(data);
            nowTitle = name;
        }
        appendLittle(data);
    })
    .transition()
    .duration(1000)
    .attr('opacity', 1);
}

$('#return').on('click', function() {
    appendBig(bigData);
})
d3.json("./quota.json", function(err, data) {
    // console.log(err);
    bigData = data;
    appendBig(data);

});
