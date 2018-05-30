$(function() {
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
      { name: "in_ip", type: "text", filtering: true, align: 'center' },
      { name: "out_ip", type: "text", filtering: true, align: 'center' },
      { name: "in_country", type: "countryField", filtering: true, autosearch: true, align: 'center' },
      { name: "out_country", type: "countryField", filtering: true, autosearch: true, align: 'center' },
      { name: "is_dest", type: "text", filtering: false, align: 'center' },
      { name: "star", type: "number", filtering: false, align: 'center' },
      { name: "delay", type: "number", filtering: false, align: 'center' },
      { name: "frequency", type: "number", filtering: false, align: 'center' },
      { name: "ttl", type: "number", filtering: false, align: 'center' },
      { name: "monitor", type: "text", filtering: false, align: 'center' },
      { name: "first_seen", type: "number", filtering: false, align: 'center' },
      { name: "last_seen", type: "number", filtering: false, align: 'center' }
     ]
  });
  
});
