/*
  Function to be invoked by anonymous wrapper and contain global
  data structures and information
*/
function initApp() {
  var data = {};
  loadContent(function(response) {
    for (var page in response) {
      data[page] = {};
      data[page].title = page;
      data[page].raw = response[page].content;
      data[page].fields = [];
      for (var i = 0; i < response[page].spec.length; i++) {
        data[page].fields.push(response[page].spec[i].S);
      }
      data[page].content = parseIntoDom(data[page].raw, data[page].fields);
    }
    initContent(data);
    initAdminPanel(data, function() {
      $('.infocolumn').remove();
      initApp();
    });
  });
}