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
      // TODO: REQUIRES THAT THE CONTENT IS NOT EMPTY
      data[page].fields = [];
      for (var field in response[page][0].M) {
        data[page].fields.push(field);
      }
      data[page].fields.sort();
    }
    initContent(data);
    initAdminPanel(data, function() {
      $('.infocolumn').remove();
      initApp();
    });
  });
}