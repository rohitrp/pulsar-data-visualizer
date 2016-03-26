var pulsarData = [];

var chartType = d3.selectAll('input[type="radio"]');
var isScatter = true;

chartType.on('click', function() {

  // A check to avoid accumulation of multiple charts if
  // current selector is clicked multiple times
  if (isScatter === (d3.select(this).attr('value') === 'scatter')) return;
  else isScatter = !isScatter;

  $('.for-scatter').toggle(isScatter);
  $('.for-bar').toggle(!isScatter);

  if (isScatter) {
    scatterPlot.initialize();
  } else {
    barChart.initialize();
  }
});

var margin = {top: 20, right: 20, bottom: 80, left: 70};
var w = 800 - margin.left - margin.right,
  h = 500 - margin.top - margin.bottom;

var xVal, yVal, xType, yType, radiusVal;

var xScale = d3.scale;
var yScale = d3.scale;
var colorScale = d3.scale.category20();
var radiusScale = d3.scale;

var xAxis, yAxis;

var svg, objects, tooltip, zoom;


d3.json('data/pulsar_data.json', function (error, data) {
  if (error) throw error;

  pulsarData = data;

  var tBody = d3.select('#pulsars-table').select('tbody');
  var pulsars = d3.select('#pulsars');

  pulsarData.forEach(function (d, i) {
    var row = tBody.append('tr');
    row.append('td').text(i+1);

    for (var key in d) {
      row.append('td').text(d[key]);
    }

    pulsars.append('div')
      .classed('pulsar-name', true)
      .style('cursor', 'pointer');

    var currPulsar = d3.select('.pulsar-name:last-child');

    currPulsar.append('div')
      .classed('pulsar-color', true)
      .style('background-color', colorScale(i % 20))
      .style('border', '2px solid ' + colorScale(i % 20))
      .style('display', 'inline-block');

    currPulsar.append('span')
      .style('display', 'inline-block')
      .text(d['Pulsar']);

    currPulsar.append('span')
      .classed('pulsar-number', true)
      .style('display', 'none')
      .text(i);

  });


  d3.selectAll('.pulsar-name').on('click', function () {
    var curr = d3.select(this);

    var pulsarNum = +curr.select('.pulsar-number').text();

    var pulsarColor = curr.select('.pulsar-color');

    pulsarColor.style('background-color', function () {
        var bubble = d3.select('.pulsar-' + pulsarNum)
          .transition()
          .duration(500)
          .ease('linear');

        if (pulsarColor.style('background-color') !== 'rgb(255, 255, 255)') {
          bubble.attr('r', function (d) {
            return radiusScale(d[radiusVal]) + 10;
          });
          return "white";
        } else {
          bubble.attr('r', function (d) {
            return radiusScale(d[radiusVal])
          });
          return colorScale(pulsarNum % 20);
        }
      });

    $('.pulsar-' + pulsarNum).toggle();
    });

  scatterPlot.initialize();
});

var scatterPlot = {
  initialize: function () {
    d3.select('.plot').html("");
    $('.plot').show();
    $('#pulsars').show();

    this.checkForErrors(this.getValues());
    this.initializeAxes();
    this.update();
    this.addLabels();
  },
  initializeAxes: function() {
    xScale = d3.scale;
    yScale = d3.scale;
    colorScale = d3.scale;

    xScale = (xType === "linear") ? xScale.linear() : xScale.log();

    xScale = xScale
    .domain([0.9 * d3.min(pulsarData, function (d) {
      return d[xVal];
    }), 1.1 * d3.max(pulsarData, function(d) {
      return d[xVal];
    })])
    .range([0, w]);

    yScale = (yType === "linear" ? yScale.linear() : yScale.log());

    yScale = yScale
    .domain([0.9 * d3.min(pulsarData, function(d) {
      return d[yVal];
    }), 1.1 * d3.max(pulsarData, function(d) {
      return d[yVal];
    })])
    .range([h, 0]);

    xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .ticks(10)
    .tickSize(-h)
    .tickPadding(10);

    yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .ticks(10)
    .tickSize(-w)
    .tickPadding(10);

    zoom = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([0, 500])
    .on('zoom', this.zoomed);

    radiusScale = d3.scale.linear()
      .domain([d3.min(pulsarData, function(d) {
        return d[radiusVal];
      }), d3.max(pulsarData, function (d) {
        return d[radiusVal];
      })]);

    if (radiusVal === '...') {
      radiusScale = function () {
        return 5;
      };
    }
    else radiusScale.range([5, 30]);

    colorScale = colorScale.category20();
  },
  addLabels: function () {
    d3.selectAll('.x-label, .y-label').remove();

    svg.append('text')
    .classed('x-label', true)
    .attr('x', w/2)
    .attr('y', h + 40)
    .style('text-anchor', 'middle')
    .text(xVal);

    svg.append('text')
    .classed('y-label', true)
    .attr('x', -h/2)
    .attr('y', -60)
    .style('text-anchor', 'middle')
    .text(yVal)
    .attr('transform', 'rotate(-90)');
  },
  update: function () {
    tooltip = d3.select('.plot')
    .append('div')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .style('border', '1px solid #888')
    .style('background-color', 'rgba(100, 100, 100, .7)')
    .style('color', '#fff')
    .style('border-radius', '10px')
    .style('padding', '5px');


    svg = d3.select('.plot')
    .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
    .call(zoom);

    svg.append('rect')
    .attr('width', w)
    .attr('height', h);

    svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + (h) + ')')
    .call(xAxis);

    svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(0, 0)')
    .call(yAxis);

    objects = svg.append('svg')
    .classed('objects', true)
    .attr('width', w)
    .attr('height', h);

    objects.selectAll('circle')
    .data(pulsarData)
    .enter()
    .append('circle')
    .attr('class', function (d, i) {
      return 'bubble pulsar-' + i;
    })
    .call(this.addMouseEvents)
    .transition()
    .duration(800)
    .ease('elastic')
    .attr('transform', this.transform)
    .attr('r', 5)
    .style('fill', function (d, i) {
      return colorScale(i % 20);
    });
  },
  zoomed: function () {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll('circle')
    .attr('transform', scatterPlot.transform);
  },
  transform: function (d) {
    return "translate(" + xScale(d[xVal]) + "," + yScale(d[yVal]) + ")";
  },
  addMouseEvents: function () {
    this.on('mouseover', function() {
      return tooltip.style('visibility', 'visible');
    })
    .on('mousemove', function(d) {
      var text = "Name | Pulsar: " + d["Pulsar"] + "<br>X-axis | " + xVal + ": " + d[xVal] +
        "<br>Y-axis | " + yVal + ": " + d[yVal];

      if (radiusVal != "...") text += "<br>Radius | " + radiusVal + ": " + d[radiusVal];
      return tooltip.style('top', (event.pageY-10) + 'px')
      .style('left', (event.pageX + 10) + 'px')
      .html(text);
    })
    .on('mouseout', function() {
      return tooltip.style('visibility', 'hidden');
    });
  },
  getValues: function () {
    xVal = $('#plot-x').val();
    yVal = $('#plot-y').val();
    xType = $('#type-x').val();
    yType = $('#type-y').val();
    radiusVal = $('#radius').val();

    var res = [];

    if (xVal === "Pulsar" || xVal === "Binary") {
      res.push("x-axis: " + xVal);
    }

    if (yVal === "Pulsar" || yVal === "Binary") {
      res.push("y-axis: " + yVal);
    }

    if (radiusVal === "Pulsar" || radiusVal === "Binary") {
      res.push("Radius: " + radiusVal);
    }

    return res;

  },
  checkForErrors: function (res) {
    var snackBar = document.querySelector('#error-snackbar');
    var data = {
      message: "Non-numeric data - " + res.join(" & "),
      timeout: 2000
    };

    if (res.length !== 0) {
      snackBar.MaterialSnackbar.showSnackbar(data);
      $('.plot').hide();

      console.error(data.message);
    } else {
      $('.plot').show();
    }

  }
};

d3.selectAll('.for-scatter select').on('change', function() {

  var res = scatterPlot.getValues();

  scatterPlot.checkForErrors(res);

  svg.select('.x-label').text(xVal);
  svg.select('.y-label').text(yVal);

  scatterPlot.initializeAxes();

  scatterPlot.addLabels();

  svg.call(zoom);

  objects.selectAll('circle')
    .transition()
    .duration(400)
    .ease('back')
    .attr('transform', scatterPlot.transform)
    .attr('r', function(d) {
      return radiusScale(d[radiusVal]);
    })
    .style('fill', function (d, i) {
      return colorScale(i % 20);
    });


  svg.selectAll('g .x.axis').call(xAxis);
  svg.selectAll('g .y.axis').call(yAxis);

});


var barChart = {
  initialize: function () {
    d3.select('.plot').html("");
    $('.plot').show();
    $('#pulsars').hide();

    this.checkForErrors(this.getValues());
    this.initializeAxes();
    this.update();
  },
  initializeAxes: function () {
    xScale = d3.scale.ordinal()
    .domain(pulsarData.map(function (d) {
      return d[xVal];
    }))
    .rangeRoundBands([0, w], .1);

    yScale = d3.scale.linear()
    .domain([0.9 * d3.min(pulsarData, function (d) {
      return d[yVal];
    }), 1.1 * d3.max(pulsarData, function (d) {
      return d[yVal];
    })])
    .range([h, 0]);

    colorScale = d3.scale.linear()
      .domain([0, pulsarData.length])
      .range(['orange', 'purple']);

    xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom');

    yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left');
  },
  update: function () {
    tooltip = d3.select('.plot')
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .style('border', '1px solid #888')
      .style('background-color', 'rgba(100, 100, 100, .7)')
      .style('color', '#fff')
      .style('border-radius', '10px')
      .style('padding', '5px');

    svg = d3.select('.plot').append('svg')
      .attr('width', w + margin.left + margin.right)
      .attr('height', h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + h + ')')
        .call(xAxis)
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-65)');

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0, 0)')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(yVal);

    svg.selectAll('.bar')
      .data(pulsarData)
      .enter()
      .append('rect')
      .classed('bar', true)
      .call(this.addMouseEvents)
      .attr('x', function (d) {
        return xScale(d[xVal]);
      })
      .attr('y', function (d) {
        console.log(d[xVal] + " " + (h-yScale(d[yVal])));
        return yScale(d[yVal]);
      })
      .attr('width', xScale.rangeBand())
      .attr('height', function (d) {
        return h - yScale(d[yVal]);
      })
      .style('fill', function(d, i) {
        return colorScale(i);
      });
  },
  getValues: function () {
    xVal = $('.data-label').val();
    yVal = $('.data').val();

    var res = [];

    if (yVal === "Pulsar" || yVal == "Binary") {
      res.push("y-axis: " + yVal);
    }

    return res;
  },
  checkForErrors: function (res) {
    var snackBar = document.querySelector('#error-snackbar');
    var data = {
      message: "Non-numberic data - " + res.join(),
      timeout: 2000
    };

    if (res.length !== 0) {
      snackBar.MaterialSnackbar.showSnackbar(data);
      $('.plot').hide();

      console.error(data.message);
    } else {
      $('.plot').show();
    }
  },
  addMouseEvents: function () {
    this.on('mouseover', function() {
      return tooltip.style('visibility', 'visible');
    })
    .on('mousemove', function(d) {
      var text = "Name | Pulsar: " + d["Pulsar"] + "<br>Data | " + yVal + ": " + d[yVal] +
        "<br>Label | " + xVal + ": " + d[xVal];

      return tooltip.style('top', (event.pageY-10) + 'px')
      .style('left', (event.pageX + 10) + 'px')
      .html(text);
    })
    .on('mouseout', function() {
      return tooltip.style('visibility', 'hidden');
    });
  }
};

d3.selectAll('.for-bar select').on('change', function() {
  var res = barChart.getValues();
  barChart.checkForErrors(res);

  barChart.initializeAxes();

  svg.selectAll('.bar')
    .transition()
    .duration(500)
    .ease('back')
    .attr('x', function(d) {
      return xScale(d[xVal]);
    })
    .attr('y', function (d) {
      return yScale(d[yVal]);
    })
  .attr('width', xScale.rangeBand())
  .attr('height', function (d) {
    console.log(d[xVal] + " "  + (h - yScale(d[yVal])));
    return h - yScale(d[yVal]);
  });

  svg.selectAll('.x.axis, .y.axis').remove();

  svg.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0, ' + h + ')')
  .call(xAxis)
  .selectAll('text')
  .style('text-anchor', 'end')
  .attr('dx', '-.8em')
  .attr('dy', '.15em')
  .attr('transform', 'rotate(-65)');

  svg.append('g')
  .attr('class', 'y axis')
  .attr('transform', 'translate(0, 0)')
  .call(yAxis)
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', 6)
  .attr('dy', '.71em')
  .style('text-anchor', 'end')
  .text(yVal);

});

d3.select('#pulsars-table button').on('click', function () {
  if (d3.select(this).html() === "Show Table") {
    d3.select(this).html("Hide Table");
    d3.select('.pulsars-table').style('display', 'block');
  } else {
    d3.select(this).html("Show Table");
    d3.select('.pulsars-table').style('display', 'none');
  }
});