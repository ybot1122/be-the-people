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
      data[page].raw = response[page];
      data[page].content = parseIntoDom(response[page]);
    }
    initContent(data);
    initAdminPanel(data, function() {
      $('.infocolumn').remove();
      initApp();
    });
  });
}