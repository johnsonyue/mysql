import $ from 'jquery';
import * as d3 from 'd3';

export function myD3Graph(container, data, options){
  var width = typeof options.width !== "undefined" ? options.width : $(container).width();
  var height = typeof options.height !== "undefined" ? options.height : 1000;
  var min_node_radius = typeof options.min_node_radius !== "undefined" ? options.min_node_radius : 5;
  var max_node_radius = typeof options.max_node_radius !== "undefined" ? options.max_node_radius : 35;


  $(container).empty();
  $(container).append('<svg></svg>');
  var svg = d3.select($(container).find('svg').get(0))
    .attr("width",width)
    .attr("height",height);
  var node_radius_scale = d3.scaleLinear().domain([0,data.nodes.length]).range([min_node_radius,max_node_radius]);
  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width/2, height/2))
    .force("xAxis",d3.forceX(width/2))
    .force("yAxis",d3.forceY(height/2));
  
  window.addEventListener("resize", resized);

  var links = svg.append("g")
    .attr("class","links");
  var nodes = svg.append("g")
    .attr("class","nodes");
  var link, node;
  
  update();
  
  /*d3 selection in-depth explanation:
    selectAll() selects corespoding DOM, even if there's none.
    selectAll.data() joins data to DOM, and returns a update selection.
    update.enter() returns a enter selection.
    update.enter().append() will merge update and enter selection \
      to recude code redundancy.
    update.exit()

    NOTE: by default, data join uses index.
    if you use the dedicated ID to join data,
    overwrite the key function of join:

      selectAll.data(data, function(d){d.id});
  */
  function update(){
    link = links.selectAll("line")
      .data(data.links, function(d){return d.id;});
    link.enter()
      .append("line")
      .style("stroke", function(d){return "#3498db";})
      .style("opacity", 0.7)
      .style("stroke-width", 1); //enter
    link.exit().remove();
    //link.exit().style("stroke", "#ffaaff");
    
    node = nodes.selectAll("circle")
      .data(data.nodes, function(d){return d.id;});
    node.enter()
      .append("circle")
        .attr("r", 5)
        .attr("fill", "#3498db")
        .attr("id", function(d){return d.id;})
        .on("dbclick", dbclicked)
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)) //enter
      .append("title")
        .text(function(d){return d.id;});
    node.exit().remove();

    simulation
      .nodes(data.nodes)
      .on("tick", ticked);
    simulation.force("link")
      .links(data.links);
    simulation.restart();
  }

  function ticked(){
    links.selectAll("line")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    nodes.selectAll("circle")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
  }

  function resized(){
    width = $(container).width();
    height = $(container).height();
    svg
      .attr("width", width)
      .attr("height", height)
    simulation.force("center", d3.forceCenter(width/2, height/2))
      .force("xAxis",d3.forceX(width/2))
      .force("yAxis",d3.forceY(height/2));
    simulation.restart();
  }
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function collapse(){
    return;
  }
  
  function expand(){
    return;
  }
  
  function dbclicked(){
    return;
  }
  
  return {
    "update": update,
    "resized": resized
  };

}
