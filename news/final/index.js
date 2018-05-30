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
var xCommon = 0;
var xTech = 130;
var wCommon = 130;
var wTech = 0;
function toggleSchoolCate(common, tech) {
    if( common && tech ) {
        xTech = 70;
        wCommon = 60;
        wTech = 60;
    }
    else if( common ) {
        xTech = 130;
        wCommon = 130;
        wTech = 0;
    }
    else if( tech ) {
        xTech = 0;
        wCommon = 0;
        wTech = 130;
    }
    else {
        xTech = 130;
        wCommon = 0;
        wTech = 0;
    }
    svg.selectAll('.bar')
    .selectAll('rect.rect')
    .transition()
    .attr({
        'x': function(d) {
            console.log(d, xTech);
            if( d.school=="科大" ) {
                return xScale(d.year) + margin.left + margin.right + xTech;
            }
            else return xScale(d.year) + margin.left + margin.right + xCommon;
        },
        'width':function(d) {
            if( d.school=="科大"  ) {
                return wTech;
            }
            else return wCommon;
        }
    });
}

var yScale, y;
var isBig = true;;

function setScale(data) {
    // var max = d3.max(data, function(d) {return d.sum;});
    let maxScale = {
        '103': { '大學': 0, '科大': 0 },
        '104': { '大學': 0, '科大': 0 },
        '105': { '大學': 0, '科大': 0 },
        '106': { '大學': 0, '科大': 0 },
        '107': { '大學': 0, '科大': 0 },
    }
    for( let i=0; i<data.length; i++ ) {
        let cate = data[i].school;
        if( isBig ) {
            if(checkCate(data[i].name[1])) {
                maxScale[data[i].year][cate] += data[i].value;;
            }
        }
        else {
            maxScale[data[i].year][cate] += data[i].value;
        }
    }
    let maxData = [];
    for( let d in maxScale ) {
        maxData.push(maxScale[d]['大學']);
        maxData.push(maxScale[d]['科大']);
    }
    var max = d3.max(maxData);

    yScale = d3.scale.linear().domain([0, max]).range([0, height]);
    y = d3.scale.linear().domain([0, max]).range([height, 0]);

    xLine.transition().duration(500).call(d3.svg.axis().scale(xScale).orient("bottom"));
    yLine.transition().duration(500).call(d3.svg.axis().scale(y).orient("left"));
}

var colors = d3.scale.category10();
function setColor(name) {
    if( name=="第一類組" ) return colors(1);
    else if( name=="第二類組" ) return colors(2);
    else if( name=="第三類組" ) return colors(3);
    else if( name=="第四類組" ) return colors(4);
    else return colors(name);
}

var bigData;
var nowTitle = "";
function appendLittle(data) {
    isBig = false;
    $('.menu#big').hide();
    $('.menu#small').show();
    console.log("append");
    console.log(data);
    setScale(data);

    svg.selectAll(`rect.rect[id="${nowTitle}"]`)
    .transition()
    .duration(500)
    .attr({
        'x': function(d) {
            return xScale(d.year) + margin.left + margin.right;
        },
        'y': function(d) {
            return y(d.value)+margin.top;
        },
        width: 130,
        'height': function(d) {
            return yScale(d.value);
        }
    });
    svg.selectAll(`rect.rect:not([id="${nowTitle}"])`)
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
        'class': 'rect',
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
function appendBig(data) {
    isBig = true;
    $('.menu#big').show();
    $('.menu#small').hide();
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

        svg.selectAll(`rect.rect`)
        .transition()
        .duration(500)
        .attr({
            'y': function(d) {
                return y(scale[d.year].sum) + margin.top;
            },
            'height': function(d) {
                return yScale(scale[d.year].value);
            }
            // x: function(d) {
            //     console.log(d);
            //     return 0;
            // }
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
    let ySum = {
        '103': { '大學': 0, '科大': 0 },
        '104': { '大學': 0, '科大': 0 },
        '105': { '大學': 0, '科大': 0 },
        '106': { '大學': 0, '科大': 0 },
        '107': { '大學': 0, '科大': 0 },
    }

    svg.append('g').attr('class', 'bar')
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr({
        'class': 'rect',
        'x': function(d) {
            if( d.school=="科大" ) {
                return xScale(d.year) + margin.left + margin.right + xTech;
            }
            else return xScale(d.year) + margin.left + margin.right + xCommon;
        },
        'id': function(d) {
            return d.name;
        },
        'width':function(d) {
            if( d.school=="科大"  ) {
                return wTech;
            }
            else return wCommon;
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
            let cate = d.school;
            for( let i=0; i<bigData.length; i++ ) {
                if( bigData[i].name==name && bigData[i].school==cate ) {
                    // console.log("YA");
                    let year = bigData[i].year;
                    let child = bigData[i].children.slice();
                    for( let j=0; j<child.length; j++ ) {
                        data.push( Object.assign({ "year": year, "school": cate }, child[j]) );
                    }
                }
            }
            console.log(data);
            nowTitle = name;
        }
        appendLittle(data);
    }).each(function(d) {
        // console.log(d);
        $(this).attr('height', function() {
            let name = d.name;
            if(!checkCate(name[1])) return 0;
            else {
                let cate = d.school;
                ySum[d.year][cate] += d.value;
                // console.log(ySum[d.year]);
                return yScale(d.value);
            }
        })
        $(this).attr('y', function() {
            // return y(d.sum) + margin.top;
            let cate = d.school;
            let sum = ySum[d.year][cate];
            return y(sum)+margin.top;
        });
    })
    .transition()
    .duration(500)
    .attr('opacity', 1);
}

svg.append("rect")
.attr({"class": "overlay" , "width": width , "height": height, "opacity": 0})
.on({
    "click":  function() {
        console.log(isBig);
        if( !isBig) {
            appendBig(bigData);
        }
     }
});

d3.json("http://ghost.cs.nccu.edu.tw/~s10329/vis/news/quota.json", function(err, data) {
    // console.log(err);
    bigData = data;
    appendBig(data);

});
function checkCate(cate) {
    return cateStr.indexOf(cate)!=-1;
}
var cateStr = "一二三四";
$(() => {
    $(".school").on('change', function() {
        console.log("sdf");
        toggleSchoolCate($('#common').prop('checked'), $('#tech').prop('checked'));
    })
    $('.category').on('change', () => {
        cateStr = "";
        $('.category:checked').each( (a, b, c) => {
            cateStr += $(b).attr('id');
        });
        appendBig(bigData);
    });
});
