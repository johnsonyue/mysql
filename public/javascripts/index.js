$(function() {
  var countries = [
    { Name: "AF" },
    { Name: "IQ" },
    { Name: "IR" },
    { Name: "SY" },
    { Name: "PK" },
    { Name: "HK" },
    { Name: "TW" },
    { Name: "CN" },
    { Name: "JP" },
    { Name: "KR" },
    { Name: "US" }
  ];

  $("#table_div").jsGrid({
    width: null,
    shrinkToFit: false,

    sorting: true,
    filtering: true,
    paging: true,
    pageLoading: true,
    autoload: true,
    pageSize: 3,
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
      { name: "id", type: "number" },
      { name: "country", type: "text" },
      { name: "info", type: "text" },
     ]
  });
  
});
