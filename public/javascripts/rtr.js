$(function() {
  //custom fields
  var CountryField = function(config){
    jsGrid.Field.call(this, config);
  };
  CountryField.prototype = new jsGrid.Field({
   itemTemplate: function(v){
     return v ? "<span class='flag-icon flag-icon-" + v.toLowerCase() + "'></span>&nbsp" + v : '--';
   },
   filterTemplate: function() {
     if(!this.filtering) return "";
     this.input = $("<input type='text'></input>");
     if (this.autosearch){
       var container = this.actionContainer;
       this.input.on("keypress", function(e){
         if (e.which === 13){
           $(container).jsGrid("search");
           e.preventDefault();
         }
       });
     }
     return this.input;
   },
   filterValue: function(v) {
     return this.input.val();
   }
  });
  jsGrid.fields.countryField = CountryField;
  
  var SelectField = function(config){
    jsGrid.Field.call(this, config); 
  }
  SelectField.prototype = new jsGrid.Field({
   itemTemplate: function(v){
     return v;
   },
   filterTemplate: function() {
     if(!this.filtering) return "";
     this.select = $(
       `<select value=''>
          <option value=''>-</option>
          <option value='Y'>Y</option>
          <option value='N'>N</option>
        </select>`
     );
     if (this.autosearch){
       var container = this.actionContainer;
       this.select.on('change', function(e){
         $(container).jsGrid("search");
         e.preventDefault();
       });
     }
     return this.select;
   },
   filterValue: function(v) {
     return this.select.val();
   }
  });
  jsGrid.fields.selectField = SelectField;

  var ClickableField = function(config){
    jsGrid.Field.call(this, config);
  };
  ClickableField.prototype = new jsGrid.Field({
   itemTemplate: function(v,items){
     var container = this.actionContainer;
     var tab = this.actionTab;
     var click = this.actionFunction;
     var data = this.actionData;
     if (v == "0") return v;
     var a = $("<a></a>")
       .text(v)
       .on("click", function(e){
         click(items, container, tab, data);
       });
     return a;
   },
   filterTemplate: function() {
     if(!this.filtering) return "";
     this.input = $("<input type='text'></input>");
     if (this.autosearch){
       var container = this.searchContainer;
       this.input.on("keypress", function(e){
         if (e.which === 13){
           $(container).jsGrid("search");
           e.preventDefault();
         }
       });
     }
     return this.input;
   },
   filterValue: function(v) {
     return this.input.val();
   }
  });
  jsGrid.fields.clickableField = ClickableField;

  var StaticField = function(config){
    jsGrid.Field.call(this, config);
  };
  StaticField.prototype = new jsGrid.Field({
   itemTemplate: function(v,items){
     var container = this.actionContainer;
     var tab = this.actionTab;
     var click = this.actionFunction;
     var data = this.actionData;
     var a = $("<a>view</a>")
       .on("click", function(e){
         click(items, container, tab, data);
       });
     return a;
   }
  });
  jsGrid.fields.staticField = StaticField;

  //set up table.
  var dataObj = { 'adjTableData' : [], 'ifaceTableData' : [] , 'topoTableData' : []};
  function on_degree_click(items, container, tab, data){
    var params = {
      'action': 'adj',
      'ip': items.ip
    };
    $.ajax({
      type: "GET",
      url: "/graph",
      data: params,
      beforeSend: function(){
        $(tab).tab('show');
        $(container).find(".jsgrid-load-shader").show();
      }
    }).done(result => {
      result.forEach( (x,i) => x['#']=i );
      dataObj[data] = result;
      $(container).jsGrid("option","data",dataObj[data]);
      $(container).find(".jsgrid-load-shader").hide();
    });
  }
  
  function on_topo_click(items, container, tab, data){
    var params = {
      'action': 'vic',
      'ip': items.ip
    };
    $.ajax({
      type: "GET",
      url: "/graph",
      data: params,
      beforeSend: function(){
        $(tab).tab('show');
        $(container).find(".jsgrid-load-shader").show();
      }
    }).done(result => {
      result.forEach( (x,i) => x['#']=i );
      dataObj[data] = result;
      $(container).jsGrid("option","data",dataObj[data]);
      
      graph_data = format(dataObj[data]);
      graph = new mylib.myD3Graph($('#topo_vis_div'), graph_data, {});
      $(container).find(".jsgrid-load-shader").hide();
    });
  }

  function on_rtr_id_click(items, container, tab, data){
    var params = {
      'action': 'rtr_iface',
      'rtr_id': items.rtr_id
    };
    $.ajax({
      type: "GET",
      url: "/graph",
      data: params,
      beforeSend: function(){
        $(tab).tab('show');
        $(container).find(".jsgrid-load-shader").show();
      }
    }).done(result => {
      result.forEach( (x,i) => x['#']=i );
      dataObj[data] = result;
      $(container).jsGrid("option","data",dataObj[data]);
      $(container).find(".jsgrid-load-shader").hide();
    });
  }
  $("#rtr_table_div").jsGrid({
    width: null,
    shrinkToFit: false,

    sorting: true,
    filtering: true,
    paging: true,
    pageLoading: true,
    autoload: true,
    pageSize: 20,
    pageButtonCount: 5,
    pagerContainer: $("#pager_div"),
    pagerFormat: "{first} {prev} {pages} {next} {last} &nbsp;&nbsp; total pages: {pageCount} &nbsp;&nbsp; total items: {itemCount} &nbsp;&nbsp;",
    controller: {
      loadData: function(filter) {
        filter.action='rtr';
        return $.ajax({
          type: "GET",
          url: "/graph",
          data: filter
        });
      },
    },
    fields: [
      { name: "#", type: "text", filtering: false, sorting: false, align: 'center' },
      { name: "ip", type: "text", filtering: true, sorting: false, align: 'left' },
      { name: "country", type: "countryField", actionContainer: "#rtr_table_div", filtering: false, sorting: false, align: 'center' },
      { name: "rtr_id", type: "clickableField", actionFunction: on_rtr_id_click, actionData: 'ifaceTableData', actionContainer: "#iface_table_div", actionTab: "#nav-tab a[href=#iface-list-tab]", searchContainer: '#rtr_table_div', autosearch: true, filtering: true, sorting: false, align: 'center' },
      { name: "degree", type: "clickableField", actionFunction: on_degree_click, actionData: 'adjTableData', actionContainer: "#adj_table_div", actionTab: "#nav-tab a[href=#adj-list-tab]", filtering: false, sorting: false, align: 'center' },
      { name: "topology", type: "staticField", actionFunction: on_topo_click, actionData: 'topoTableData', actionContainer: "#topo_table_div", actionTab: "#nav-tab a[href=#topo-list-tab]", filtering: false, sorting: false, align: 'center' },
     ]
  });
  
  $("#size_select").on("change", function(){
    $("#rtr_table_div").jsGrid("option", "pageSize", $(this).val());
  });
  $("#page_input").on("keypress", function(e){
    if (e.which === 13){
      $("#rtr_table_div").jsGrid("openPage", $(this).val());
      e.preventDefault();
    }
  });

  $("#iface_table_div").jsGrid({
    width: null,
    shrinkToFit: false,

    sorting: true,
    filtering: true,
    autosearch: true,
    paging: true,
    pageSize: 20,
    pageButtonCount: 5,
    pagerFormat: "{first} {prev} {pages} {next} {last} &nbsp;&nbsp; total pages: {pageCount} &nbsp;&nbsp; total items: {itemCount} &nbsp;&nbsp;",
    noDataContent: 'No data',

    data: dataObj['ifaceTableData'],

    controller: {
      loadData: function (filter) {
        var result = $.grep(dataObj['ifaceTableData'], function (item) {
          return (
            (!filter.ip || item.ip.match(new RegExp('^'+filter.ip+'.*'))) &&
            (!filter.country || item.country == filter.country) &&
            (!filter.degree || item.degree == filter.degree)
          );
        });
        result.forEach( (x,i) => x['#']=i );
        return result;
      },
    },

    fields: [
      { name: "#", type: "text", filtering: false, sorting: false, align: 'center' },
      { name: "ip", type: "text", filtering: true, sorting: true, align: 'left' },
      { name: "country", type: "countryField", actionContainer: "#iface_table_div", filtering: true, sorting: true, align: 'center' },
      { name: "rtr_id", type: "text", filtering: false, sorting: false, align: 'center' },
      { name: "degree", type: "number", filtering: true, sorting: true, align: 'center' }
     ]
  });

  $("#adj_table_div").jsGrid({
    width: null,
    shrinkToFit: false,

    sorting: true,
    filtering: true,
    autosearch: true,
    paging: true,
    pageSize: 20,
    pageButtonCount: 5,
    pagerFormat: "{first} {prev} {pages} {next} {last} &nbsp;&nbsp; total pages: {pageCount} &nbsp;&nbsp; total items: {itemCount} &nbsp;&nbsp;",
    noDataContent: 'No data',

    data: dataObj['adjTableData'],

    controller: {
      loadData: function (filter) {
        var result = $.grep(dataObj['adjTableData'], function (item) {
          return (
            (!filter.in_ip || item.in_ip.match(new RegExp('^'+filter.in_ip+'.*'))) &&
            (!filter.out_ip || item.out_ip.match(new RegExp('^'+filter.out_ip+'.*'))) &&
            (!filter.monitor || item.monitor.match(new RegExp('^'+filter.monitor+'.*'))) &&
            (!filter.is_dest || item.is_dest == filter.is_dest) &&
            (!filter.in_country || item.in_country == filter.in_country) &&
            (!filter.out_country || item.out_country == filter.out_country)
          );
        });
        result.forEach( (x,i) => x['#']=i );
        return result;
      },
    },

    fields: [
      { name: "#", type: "text", filtering: false, sorting: false, align: 'center' },
      { name: "in_ip", type: "text", filtering: true, align: 'left' },
      { name: "out_ip", type: "text", filtering: true, align: 'left' },
      { name: "in_country", type: "countryField", actionContainer: "#adj_table_div", filtering: true, autosearch: true, align: 'center' },
      { name: "out_country", type: "countryField", actionContainer: "#adj_table_div", filtering: true, autosearch: true, align: 'center' },
      { name: "is_dest", type: "selectField", actionContainer: "#adj_table_div", filtering: true, autosearch: true, align: 'center' },
      { name: "star", type: "number", filtering: false, align: 'right' },
      { name: "delay", type: "number", filtering: false, align: 'right' },
      { name: "freq", type: "number", filtering: false, align: 'right' },
      { name: "ttl", type: "number", filtering: false, align: 'right' },
      { name: "monitor", type: "text", filtering: true, align: 'left' },
     ]
  });

  var topoTableDataObj = { 'data': [] };
  $("#topo_table_div").jsGrid({
    width: null,
    shrinkToFit: false,

    sorting: true,
    filtering: true,
    autosearch: true,
    paging: true,
    pageSize: 20,
    pageButtonCount: 5,
    pagerFormat: "{first} {prev} {pages} {next} {last} &nbsp;&nbsp; total pages: {pageCount} &nbsp;&nbsp; total items: {itemCount} &nbsp;&nbsp;",
    noDataContent: 'No data',

    controller: {
      loadData: function (filter) {
        var result = $.grep(dataObj['topoTableData'], function (item) {
          return (
            (!filter.in_ip || item.in_ip.match(new RegExp('^'+filter.in_ip+'.*'))) &&
            (!filter.out_ip || item.out_ip.match(new RegExp('^'+filter.out_ip+'.*'))) &&
            (!filter.monitor || item.monitor.match(new RegExp('^'+filter.monitor+'.*'))) &&
            (!filter.is_dest || item.is_dest == filter.is_dest) &&
            (!filter.in_country || item.in_country == filter.in_country) &&
            (!filter.out_country || item.out_country == filter.out_country)
          );
        });
        result.forEach( (x,i) => x['#']=i );
        return result;
      },
    },

    fields: [
      { name: "#", type: "text", filtering: false, sorting: false, align: 'center' },
      { name: "in_ip", type: "text", filtering: true, align: 'left' },
      { name: "out_ip", type: "text", filtering: true, align: 'left' },
      { name: "in_country", type: "countryField", actionContainer: "#topo_table_div", filtering: true, autosearch: true, align: 'center' },
      { name: "out_country", type: "countryField", actionContainer: "#topo_table_div", filtering: true, autosearch: true, align: 'center' },
      { name: "is_dest", type: "selectField", actionContainer: "#topo_table_div", filtering: true, autosearch: true, align: 'center' },
      { name: "star", type: "number", filtering: false, align: 'right' },
      { name: "delay", type: "number", filtering: false, align: 'right' },
      { name: "freq", type: "number", filtering: false, align: 'right' },
      { name: "ttl", type: "number", filtering: false, align: 'right' },
      { name: "monitor", type: "text", filtering: true, align: 'left' },
     ]
  });
  
  //setup topology graph.
  function format(input){
    var uniq = {};
    var id = x => (x in uniq) ? uniq[x] : (uniq[x]=Object.keys(uniq).length);

    var links = [];
    input.forEach((x,i) => {
      var in_id = id(x.in_ip);
      var out_id = id(x.out_ip);
      links.push({"source": in_id, "target": out_id, "id": i});
    });
    var nodes = Object.keys(uniq).map( x => ({"id": uniq[x], "label": x}) );

    return {"nodes": nodes, "links": links};
  }

  var graph_data = format(dataObj['topoTableData']);
  var graph = new mylib.myD3Graph($('#topo_vis_div'), graph_data, {});

  //resize svg after tab is shown.
  $('#nav-tab a[href=#topo-vis-tab]').on('shown.bs.tab', function(e){
    graph.resized();
  });
});
