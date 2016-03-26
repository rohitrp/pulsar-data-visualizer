var pulsarData = [];
var snack = document.querySelector('#demo-snackbar-example');

var bubbleColors = ["#D32F2F", "#536DFE", "#F44336", "#C2185B", "#388E3C"];

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

var xVal, yVal, xType, yType;

var xScale = d3.scale;
var yScale = d3.scale;
var colorScale = d3.scale;

var xAxis, yAxis;

var svg, objects, tooltip, zoom, bubbleColor;


d3.json('data/pulsar_data.json', function (error, data) {
  if (error) throw error;

  pulsarData = data;

  scatterPlot.initialize();

  pulsarData.forEach(function (d, i) {
    var row = d3.select('#pulsars').select('tbody').append('tr');
    row.append('td').text(i+1);

    for (var key in d) {
      row.append('td').text(d[key]);
    }

  })
});

var scatterPlot = {
  initialize: function () {
    d3.select('.plot').html("");

    this.checkForErrors(this.getValues());
    this.initializeAxes();
    this.update();
    this.addLabels();
  },
  initializeAxes: function() {
    bubbleColor = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];

    xScale = d3.scale;
    yScale = d3.scale;

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
    .attr('class', 'bubble')
    .call(this.addMouseEvents)
    .transition()
    .duration(800)
    .ease('elastic')
    .attr('transform', this.transform)
    .attr('r', 5)
    .style('fill', bubbleColor)
    .style('stroke', bubbleColor)
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
      var text = "Pulsar: " + d["Pulsar"] + "<br>" + xVal + ": " + d[xVal] +
        "<br>" + yVal + ": " + d[yVal];
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

    var res = {
      x: {},
      y: {},
      xy: {}
    };

    if (xVal === "Pulsar" || xVal === "Binary") {
      res.x = {
        error: true,
        data: "x-axis: " + xVal
      };
    }

    if (yVal === "Pulsar" || yVal === "Binary") {
      res.y = {
        error: true,
        data: "y-axis: " + yVal
      }
    }

    if (res.x.error && res.y.error) {
      res.xy = {
        error: true,
        data: "x-axis: " + xVal + " & y-axis: " + yVal
      }
    }

    return res;

  },
  checkForErrors: function (res) {
    var snackBar = document.querySelector('#error-snackbar');
    var data = {
      timeout: 2000
    };
    var throwError = false;

    if (res.xy.error) {
      data.message = res.xy.data + " are non-numeric";
    } else if (res.x.error) {
      data.message = res.x.data + " is non-numeric";
    } else {
      data.message = res.y.data + " is non-numeric";
    }

    if (res.xy.error || res.x.error || res.y.error) throwError = true;

    if (throwError) {
      snackBar.MaterialSnackbar.showSnackbar(data);
      $('.plot').hide();

      throw new Error('Data is not numeric');
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
    .style('fill', bubbleColor)
    .style('stroke', bubbleColor);


  svg.selectAll('g .x.axis').call(xAxis);
  svg.selectAll('g .y.axis').call(yAxis);

});


var barChart = {
  initialize: function () {
    d3.select('.plot').html("");

    this.getValues();
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
      .attr('x', function (d) {
        return xScale(d[xVal]);
      })
      .attr('y', function (d) {
        return h - yScale(d[yVal]);
      })
      .attr('width', xScale.rangeBand())
      .attr('height', function (d) {
        return yScale(d[yVal]);
      })
      .style('fill', function(d, i) {
        return colorScale(i);
      });
  },
  getValues: function () {
    xVal = $('.data-label').val();
    yVal = $('.data').val();
  }
};

d3.selectAll('.for-bar select').on('change', function() {
  barChart.getValues();

  barChart.initializeAxes();

  svg.selectAll('.bar')
    .transition()
    .duration(500)
    .ease('back')
    .attr('x', function(d) {
      return xScale(d[xVal]);
    })
    .attr('y', function (d) {
      return h - yScale(d[yVal]);
    })
  .attr('width', xScale.rangeBand())
  .attr('height', function (d) {
    return yScale(d[yVal]);
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

d3.select('#pulsars button').on('click', function () {
  if (d3.select(this).html() === "Show Table") {
    d3.select(this).html("Hide Table");
    d3.select('.pulsars-table').style('display', 'block');
  } else {
    d3.select(this).html("Show Table");
    d3.select('.pulsars-table').style('display', 'none');
  }


});