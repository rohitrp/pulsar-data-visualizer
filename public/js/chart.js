var pulsarData = [];

var chartType = d3.selectAll('input[type="radio"]');

chartType.on('click', function() {
  console.log(d3.select(this).attr('value'));
});

var margin = {top: 20, right: 20, bottom: 40, left: 70};
var w = 800 - margin.left - margin.right,
  h = 500 - margin.top - margin.bottom;

var xVal = $('#plot-x').val();
var yVal = $('#plot-y').val();
var xType = $('#type-x').val();
var yType = $('#type-y').val();

var xScale = d3.scale;
var yScale = d3.scale;

var xAxis, yAxis;

var svg, objects, tooltip;


d3.json('data/pulsar_data.json', function (data) {
  pulsarData = data;

  initializeAxes();
  update();
});

function initializeAxes() {

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
}

function update() {

  tooltip = d3.select('.plot')
    .append('div')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .style('border', '1px solid #888')
    .style('background-color', 'rgba(100, 100, 100, .7)')
    .style('color', '#fff')
    .style('border-radius', '10px');

  var zoom = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([0, 500])
    .on('zoom', zoomed);

  svg = d3.select('.plot').append('svg')
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
    .attr('transform', transform)
    .attr('r', 5)
    .call(addMouseEvents);

  function zoomed() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll('circle')
      .attr('transform', transform);
  }

  function transform(d) {
    return "translate(" + xScale(d[xVal]) + "," + yScale(d[yVal]) + ")";
  }
}

function addMouseEvents() {
  this.on('mouseover', function() {
      return tooltip.style('visibility', 'visible');
    })
    .on('mousemove', function(d) {
      var text = xVal + ": " + d[xVal] +
        "<br>" + yVal + ": " + d[yVal];
      return tooltip.style('top', (event.pageY-10) + 'px')
      .style('left', (event.pageX + 10) + 'px')
      .html(text);
    })
    .on('mouseout', function() {
      return tooltip.style('visibility', 'hidden');
    });
}

d3.selectAll('select').on('change', function() {
  xVal = $('#plot-x').val();
  yVal = $('#plot-y').val();
  xType = $('#type-x').val();
  yType = $('#type-y').val();

  $('.plot').remove();
  $('body').append('<div class="plot"></div>');

  initializeAxes();
  update();

});

function r() {
  d3.selectAll('.bubble').remove();
}