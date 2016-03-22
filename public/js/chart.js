var pulsarData = [];

var chartType = d3.selectAll('input[type="radio"]');

chartType.on('click', function() {
  console.log(d3.select(this).attr('value'));
});

d3.json('data/pulsar_data.json', function (data) {
  pulsarData = data;
});

var margin = {top: 20, right: 20, bottom: 40, left: 70};
var w = 800 - margin.left - margin.right,
  h = 500 - margin.top - margin.bottom;

function onClick() {

  var tooltip = d3.select('.plot')
    .append('div')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden');

  var xScale = d3.scale.linear()
  .domain([0.9 * d3.min(pulsarData, function (d) {
    return d["Period"];
  }), 1.1 * d3.max(pulsarData, function(d) {
    return d["Period"];
  })])
  .range([0, w]);

  var yScale = d3.scale.log()
  .domain([0.9 * d3.min(pulsarData, function(d) {
    return d["Period Derivative"];
  }), 1.1 * d3.max(pulsarData, function(d) {
    return d["Period Derivative"];
  })])
  .range([h, 0]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .ticks(10)
    .tickSize(-h)
    .tickPadding(10);

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .ticks(10)
    .tickSize(-w)
    .tickPadding(10);

  var zoom = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([0, 500])
    .on('zoom', zoomed);

  var svg = d3.select('.plot').append('svg')
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

  var objects = svg.append('svg')
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
    .on('mouseover', function() {
      return tooltip.style('visibility', 'visible');
    })
    .on('mousemove', function(d) {
      var text = JSON.stringify(d);
      return tooltip.style('top', (event.pageY-10) + 'px')
      .style('left', (event.pageX + 10) + 'px')
      .text(text);
    })
    .on('mouseout', function() {
      return tooltip.style('visibility', 'hidden');
    });

  function zoomed() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll('circle')
      .attr('transform', transform);
  }

  function transform(d) {
    return "translate(" + xScale(d["Period"]) + "," + yScale(d["Period Derivative"]) + ")";
  }
}