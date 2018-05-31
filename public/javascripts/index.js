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
           $("#table_div").jsGrid("search");
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
       this.select.on('change', function(e){
         $("#table_div").jsGrid("search");
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

  var myPagerRenderer = function(a){
    console.log(a);
    var pageIndex = a.pageIndex; var pageCount = a.pageCount;
    return ;
  }

  $("#table_div").jsGrid({
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
        return $.ajax({
          type: "GET",
          url: "/db",
          data: filter
        });
      },
    },
    fields: [
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
  
  $("#size_select").on("change", function(){
    $("#table_div").jsGrid("option", "pageSize", $(this).val());
  });
});
