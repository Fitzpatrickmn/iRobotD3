// Set up SVG definitions
let svgWidth = 1160;
let svgHeight = 820;

// set up borders in svg
let margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100
};

// calculate chart height and width
let width = svgWidth - margin.right - margin.left;
let height = svgHeight - margin.top - margin.bottom;

// append a div class to the scatter element
let chart = d3.select('#scatter')
  .append('div')
  .classed('chart', true);

//append an svg element to the chart 
let svg = chart.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

//append an svg group
let chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

//initial parameters; x and y axis
let chosenXAxis = 'robotCount';
let chosenYAxis = 'avgRun';

//a function for updating the x-scale variable upon click of label
function xScale(robotData, chosenXAxis) {
  //scales
  let xLinearScale = d3.scaleLinear()
    .domain([d3.min(robotData, d => d[chosenXAxis]) * 0.8,
    d3.max(robotData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;
}
//a function for updating y-scale variable upon click of label
function yScale(robotData, chosenYAxis) {
  //scales
  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(robotData, d => d[chosenYAxis]) * 0.8,
    d3.max(robotData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
}
//a function for updating the xAxis upon click
function renderXAxis(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);

  return xAxis;
}

//function used for updating yAxis variable upon click
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(2000)
    .call(leftAxis);

  return yAxis;
}

//a function for updating the circles with a transition to new circles 
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(2000)
    .attr('cx', data => newXScale(data[chosenXAxis]))
    .attr('cy', data => newYScale(data[chosenYAxis]))

  return circlesGroup;
}

//function for updating labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(2000)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]));

  return textGroup
}
//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

  //style based on variable
  //robotCount
  if (chosenXAxis === 'robotCount') {
    return `${value}`;
  }
  // missingMssn
  else if (chosenXAxis === 'missingMssn') {
    return `${value}`;
  }
  else {
    return `${value}`;
  }
}

//funtion for updating circles group
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  //robotCount
  if (chosenXAxis === 'robotCount') {
    var xLabel = 'Robot Count:';
  }
  //missingMssn
  else if (chosenXAxis === 'missingMssn') {
    var xLabel = 'Missing Missions:';
  }
  //missionCount
  else {
    var xLabel = 'Mission Count:';
  }
  //Y label
  //avgRun
  if (chosenYAxis === 'avgRun') {
    var yLabel = "Average Run Time:"
  }
  else if (chosenYAxis === 'avgChrg') {
    var yLabel = 'Average Charge Time:';
  }
  //pause
  else {
    var yLabel = 'Average Pause Time:';
  }

  //create tooltip
  var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function (d) {
      return (`${d.region}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  //add
  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

  return circlesGroup;
}
//retrieve data
d3.csv('./assets/data/region_filtered_data.csv').then(function (robotData) {

  console.log(robotData);

  //Parse data
  robotData.forEach(function (data) {
    data.robotCount = +data.robotCount;
    data.missionCount = +data.missionCount;
    data.missingMssn = +data.missingMssn;
    data.avgRun = +data.avgRun;
    data.avgChrg = +data.avgChrg;
    data.avgPause = +data.avgPause;
  });

  //create linear scales
  var xLinearScale = xScale(robotData, chosenXAxis);
  var yLinearScale = yScale(robotData, chosenYAxis);

  //create x axis
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //append X
  var xAxis = chartGroup.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${height})`)
    .call(bottomAxis);

  //append Y
  var yAxis = chartGroup.append('g')
    .classed('y-axis', true)
    //.attr
    .call(leftAxis);

  //append Circles
  var circlesGroup = chartGroup.selectAll('circle')
    .data(robotData)
    .enter()
    .append('circle')
    .classed('stateCircle', true)
    .attr('cx', d => xLinearScale(d[chosenXAxis]))
    .attr('cy', d => yLinearScale(d[chosenYAxis]))
    .attr('r', 20)
    .attr('opacity', '.5');

  //append Initial Text
  var textGroup = chartGroup.selectAll('.stateText')
    .data(robotData)
    .enter()
    .append('text')
    .classed('stateText', true)
    .attr('x', d => xLinearScale(d[chosenXAxis]))
    .attr('y', d => yLinearScale(d[chosenYAxis]))
    .attr('dy', 3)
    .attr('font-size', '7px')
    .text(function (d) { return d.region });

  //create a group for the x axis labels
  var xLabelsGroup = chartGroup.append('g')
    .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

  var robotCountLabel = xLabelsGroup.append('text')
    .classed('aText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 20)
    .attr('value', 'robotCount')
    .text('Number of Robots');

  var missionCountLabel = xLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 40)
    .attr('value', 'missionCount')
    .text('Number of Missions');

  var missingMssnsLabel = xLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 60)
    .attr('value', 'missingMssn')
    .text('Number of Missing Missions')

  //create a group for Y labels
  var yLabelsGroup = chartGroup.append('g')
    .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`);

  var runLabel = yLabelsGroup.append('text')
    .classed('aText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 0 - 20)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'avgRun')
    .text('Average Run Time (minutes)');

  var chargeLabel = yLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 40)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'avgChrg')
    .text('Average Charge Time (minutes)');

  var pauseLabel = yLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 60)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'avgPause')
    .text('Average Pause Time (minutes)');

  //update the toolTip
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  //x axis event listener
  xLabelsGroup.selectAll('text')
    .on('click', function () {
      var value = d3.select(this).attr('value');

      if (value != chosenXAxis) {

        //replace chosen x with a value
        chosenXAxis = value;

        //update x for new data
        xLinearScale = xScale(robotData, chosenXAxis);

        //update x 
        xAxis = renderXAxis(xLinearScale, xAxis);

        //upate circles with a new x value
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text 
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update tooltip
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //change of classes changes text
        if (chosenXAxis === 'robotCount') {
          robotCountLabel.classed('active', true).classed('inactive', false);
          missionCountLabel.classed('active', false).classed('inactive', true);
          missingMssnsLabel.classed('active', false).classed('inactive', true);
        }
        else if (chosenXAxis === 'missionCount') {
          robotCountLabel.classed('active', false).classed('inactive', true);
          missionCountLabel.classed('active', true).classed('inactive', false);
          missingMssnsLabel.classed('active', false).classed('inactive', true);
        }
        else {
          robotCountLabel.classed('active', false).classed('inactive', true);
          missionCountLabel.classed('active', false).classed('inactive', true);
          missingMssnsLabel.classed('active', true).classed('inactive', false);
        }
      }
    });
  //y axis lables event listener
  yLabelsGroup.selectAll('text')
    .on('click', function () {
      var value = d3.select(this).attr('value');

      if (value != chosenYAxis) {
        //replace chosenY with value  
        chosenYAxis = value;

        //update Y scale
        yLinearScale = yScale(robotData, chosenYAxis);

        //update Y axis 
        yAxis = renderYAxis(yLinearScale, yAxis);

        //Udate CIRCLES with new y
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update TEXT with new Y values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update tooltips
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //Change of the classes changes text
        if (chosenYAxis === 'avgPause') {
          pauseLabel.classed('active', true).classed('inactive', false);
          chargeLabel.classed('active', false).classed('inactive', true);
          runLabel.classed('active', false).classed('inactive', true);
        }
        else if (chosenYAxis === 'avgChrg') {
          pauseLabel.classed('active', false).classed('inactive', true);
          chargeLabel.classed('active', true).classed('inactive', false);
          runLabel.classed('active', false).classed('inactive', true);
        }
        else {
          pauseLabel.classed('active', false).classed('inactive', true);
          chargeLabel.classed('active', false).classed('inactive', true);
          runLabel.classed('active', true).classed('inactive', false);
        }
      }
    });
});