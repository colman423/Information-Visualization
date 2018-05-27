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
var bar = svg.append('g').attr('class', 'bar');
var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
    return `<strong>${d.name} ${d.value} ${d.sum}</strong>`;
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

    xLine.call(d3.svg.axis().scale(xScale).orient("bottom"));
    yLine.call(d3.svg.axis().scale(y).orient("left"));
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
function appendData(data, clickAction) {
    console.log("append");
    console.log(data);
    setScale(data);
    svg.selectAll('.bar').remove();

    var rects = svg.append('g').attr('class', 'bar')
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
        'fill': function(d, i){return setColor(d.name)}
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
    if( clickAction=="IN" ) {
        $('#return').hide();
        rects.on('click', function(d) {
            if( !d.children ) {
                let data = [];
                let name = d.name;
                for( let i=0; i<bigData.length; i++ ) {
                    if( bigData[i].name==name) {
                        let copy = Object.assign({}, bigData[i]);
                        copy.sum = copy.value;
                        data.push(copy);
                    }
                }
                console.log(data);
                appendData(data, false);

            }
            else {
                let data = [];
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
                appendData(data, "OUT");
            }
        });
    }
    else {
        $('#return').show();
    }
}

$('#return').on('click', function() {
    appendData(bigData, "IN");
})
d3.json("./quota.json", function(err, data) {
    // console.log(err);
    bigData = data;
    appendData(data, "IN");

});
