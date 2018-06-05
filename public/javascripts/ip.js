$(function() {
  //custom fields
  var CountryField = function(config){
    jsGrid.Field.call(this, config);
  };
  CountryField.prototype = new jsGrid.Field({
   itemTemplate: function(v){
     return "<span class='flag-icon flag-icon-" + v.toLowerCase() + "'></span>&nbsp" + v
   },
   filterTemplate: function() {
     if(!this.filtering) return "";
     this.input = $("<input type='text'></input>");
     if (this.autosearch){
       this.input.on("keypress", function(e){
         if (e.which === 13){
           $("#ip_table_div").jsGrid("search");
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
  
  var ClickableField = function(config){
    jsGrid.Field.call(this, config);
  };
  ClickableField.prototype = new jsGrid.Field({
   itemTemplate: function(v,items){
     var a = $("<a></a>")
       .text(v)
       .on("click", function(e){
         console.log(items.ip);
       });
     return a;
   }
  });
  jsGrid.fields.clickableField = ClickableField;

  var StaticField = function(config){
    jsGrid.Field.call(this, config);
  };
  StaticField.prototype = new jsGrid.Field({
   itemTemplate: function(v,items){
     var a = $("<a>view</a>")
       .on("click", function(e){
         console.log(items.ip);
       });
     return a;
   }
  });
  jsGrid.fields.staticField = StaticField;

  //set up table.
  $("#ip_table_div").jsGrid({
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
        //filter.action='list';
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
      { name: "country", type: "countryField", filtering: false, sorting: false, align: 'center' },
      { name: "degree", type: "clickableField", filtering: false, sorting: false, align: 'center' },
      { name: "topology", type: "staticField", filtering: false, sorting: false, align: 'center' },
     ]
  });
  
  $("#size_select").on("change", function(){
    $("#ip_table_div").jsGrid("option", "pageSize", $(this).val());
  });
  $("#page_input").on("keypress", function(e){
    if (e.which === 13){
      $("#ip_table_div").jsGrid("openPage", $(this).val());
      e.preventDefault();
    }
  });

  
  $("#adj_table_div").jsGrid({
    width: null,
    shrinkToFit: false,

    sorting: true,
    filtering: true,
    paging: true,
    pageLoading: true,
    autoload: true,
    pageSize: 30,
    pageButtonCount: 5,
    pagerFormat: "{first} {prev} {pages} {next} {last} &nbsp;&nbsp; total pages: {pageCount} &nbsp;&nbsp; total items: {itemCount} &nbsp;&nbsp;",
    noDataContent: 'No data',
    
    data: {},

    fields: [
      { name: "#", type: "text", filtering: false, sorting: false, align: 'left' },
      { name: "in_ip", type: "text", filtering: true, align: 'left' },
      { name: "out_ip", type: "text", filtering: true, align: 'left' },
      { name: "in_country", type: "countryField", filtering: true, autosearch: true, align: 'center' },
      { name: "out_country", type: "countryField", filtering: true, autosearch: true, align: 'center' },
      { name: "is_dest", type: "selectField", filtering: true, autosearch: true, align: 'center' },
      { name: "star", type: "number", filtering: false, align: 'right' },
      { name: "delay", type: "number", filtering: false, align: 'right' },
      { name: "frequency", type: "number", filtering: false, align: 'right' },
      { name: "ttl", type: "number", filtering: false, align: 'right' },
      { name: "monitor", type: "text", filtering: true, align: 'left' },
      { name: "first_seen", type: "number", filtering: false, align: 'right' },
      { name: "last_seen", type: "number", filtering: false, align: 'right' }
     ]
  });
});
