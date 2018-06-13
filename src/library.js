import $ from 'jquery';
import * as d3 from 'd3';

export function myD3Graph(container, data, options){
  var width = typeof options.width !== "undefined" ? options.width : $(container).width();
  var height = typeof options.height !== "undefined" ? options.height : 1000;
  var min_node_radius = typeof options.min_node_radius !== "undefined" ? options.min_node_radius : 5;
  var max_node_radius = typeof options.max_node_radius !== "undefined" ? options.max_node_radius : 35;
  var label_text_size = typeof options.label_text_size !== "undefined" ? options.label_text_size : '9px';
  var min_link_distance = typeof options.min_link_distance !== "undefined" ? options.min_link_distance : 100;
 
  var node_color = typeof options.node_color !== "undefined" ? options.node_color : "#3498db";
  var link_color = typeof options.link_color !== "undefined" ? options.node_color : "#049141";
  var node_color_hl = typeof options.node_color_hl !== "undefined" ? options.node_color_hl : "#ffaaff";
  var node_color_super = typeof options.node_color_super !== "undefined" ? options.node_color_super : "#00cc66";
  
  var collapse_th = typeof options.collapse_th !== "undefined" ? options.collapse_th : 10;

  $(container).empty();
  $(container).append('<svg></svg>');
  var svg = d3.select($(container).find('svg').get(0))
    .attr("width",width)
    .attr("height",height);
  var node_radius_scale = d3.scaleLinear().domain([0,data.nodes.length]).range([min_node_radius,max_node_radius]);
  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(60))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width/2, height/2))
    .force("xAxis",d3.forceX(width/2))
    .force("yAxis",d3.forceY(height/2));
  
  var radius_scale = d3.scaleLinear()
    .domain([0,data.nodes.length])
    .range([min_node_radius, max_node_radius]);
  
  window.addEventListener("resize", resized);

  var links = svg.append("g")
    .attr("class","links");
  var nodes = svg.append("g")
    .attr("class","nodes");
  var link, node;
  
  update();
  simplify();
  
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
      .style("stroke", function(d){return link_color;})
      .style("opacity", 0.7)
      .style("stroke-width", 1); //enter
    link.exit().remove();
    
    node = nodes.selectAll(".node")
       .data(data.nodes, function(d){return d.id;});
    var update = node.enter()
      .append("g")
        .attr("class","node")
        .on("dbclick", dbclicked)
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
    update.append("circle")
      .attr("r", function(d){return radius_scale(0);})
      .attr("fill", function(d){return d.hl ? node_color_hl : node_color})
      .attr("id", function(d){return d.id;})
      .append("title")
        .text(function(d){return d.id;});
    update.append("text")
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.35em')
      .attr('font-size', label_text_size)
      .style('text-anchor', 'middle')
      .style('user-select', 'none')
      .style('cursor', 'default')
      .text(function(d){return d.label;});
    node.exit().remove();

    //manually update the circle style.
    node.selectAll("circle")
      .attr("r", function(d){return radius_scale(d.sub ? d.sub.nodes.length : 0);})
      .attr("fill", function(d){return d.hl ? node_color_hl : (d.sub ? node_color_super : node_color)});
    node.selectAll("text")
      .attr("text", function(d){return d.label + (d.sub ? ' (' + d.sub.nodes.length + ')' : ''); });

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

    nodes.selectAll(".node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
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

  function dbclicked(){
    return;
  }

  function collapse(id_list, rep_id){
    if (!id_list.includes(rep_id)) return;
    //save sub graph induced by collapsing node set.
    var rep_node = data.nodes.find(x => x.id == rep_id);
    if (rep_node.sub) return;
    rep_node.sub = {
      "nodes": id_list.map( id => data.nodes.find(x => x.id == id) ),
      "links": []
    };
    //delete every other node in the collapsing node set.
    var dl = [];
    id_list.filter( x => !(x==rep_id) ).forEach(function(d){
      var i = data.nodes.findIndex(x => x.id==d);
      if (i>=0) dl.push(i);
    });
    dl.sort((a,b) => a-b).reverse().forEach( i => data.nodes.splice(i,1) );
    //backup related links. delete intra-links. update inter-links.
    var rep_node = data.nodes.find(x => x.id == rep_id);
    
    var dl = [];
    data.links.forEach(function(d){
      if (!id_list.includes(d.source.id) && !id_list.includes(d.target.id)) return;

      rep_node.sub.links.push(d);
      if (id_list.includes(d.source.id) && id_list.includes(d.target.id)){
        var i = data.links.findIndex(x => x.id==d.id);
        if (i>=0) dl.push(i);
      }else{
        if (id_list.includes(d.source.id)){
          d.source = rep_node;
        }else{
          d.target = rep_node;
        }
      }
    });
    dl.sort((a,b) => a-b).reverse().forEach( i => data.links.splice(i,1) );
    update();
  }
  
  function expand(rep_id){
    var sub = data.nodes.find(x => x.id == rep_id).sub;
    if (!sub) return;
    //add every others nodes from sub to graph.
    sub.nodes.filter( x => !(x.id==rep_id)).forEach(function(d){
      data.nodes.push(d);
    });
    //restore backed-up links. add intra links to graph. update inter-links.
    var id_list = sub.nodes.map(x => x.id);
    sub.links.forEach(function(d){
      if (id_list.includes(d.source.id) && id_list.includes(d.target.id)){
        data.links.push(d);
      }else if (id_list.includes(d.source.id) || id_list.includes(d.target.id)){
        if (id_list.includes(d.source.id)){
          data.links.find(x => x.id == d.id).source = d.source;
        }else{
          data.links.find(x => x.id == d.id).target = d.target;
        }
      }
    });
    data.nodes.find(x => x.id == rep_id).sub = null;
    update();
  }
  
  //calculate degree as UAG.
  function degree(){
    data.links.forEach(function(d){
      var source_node = data.nodes.find(x => x.id == d.source.id); source_node.degree = (source_node.degree || 0) + 1;
      var target_node = data.nodes.find(x => x.id == d.target.id); target_node.degree = (target_node.degree || 0) + 1;
    });
  }

  function adj_leaf(id){
    var ll=[];
    data.links.forEach(function(d){
      if (d.source.id == id && data.nodes.find(x=> x.id == d.target.id).degree == 1) ll.push(d.target.id);
      else if (d.target.id == id && data.nodes.find(x=> x.id == d.source.id).degree == 1) ll.push(d.source.id);
    });
    return ll;
  }

  function simplify(){
    degree();
    var collapse_list = [];
    data.nodes.filter(x => x.degree > collapse_th).forEach(function(d){
      var al = adj_leaf(d.id); al.push(d.id);
      if (al.length > collapse_th) collapse_list.push(al);
    });
    collapse_list.forEach(al => collapse(al, al[al.length-1]))
  }
  
  return {
    "update": update,
    "resized": resized,
    "collapse": collapse,
    "expand": expand
  };

}
