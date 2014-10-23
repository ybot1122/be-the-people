// launches the admin modal and disables the link to launch itself
function renderModal($active) {
  authenticateFb('verify', function(response) {
    if (!response || response === null || response.status !== 'success') {
      alert('you must be authenticated on facebook');
      destroyModal();
      return;
    }
    // make admin modal visible
    $('#container').prepend($('<div id=\"admin\"></div>'))
    $('#admin').load('templates/admin.html #template-modal', function() {
      $('#admin').html(Mustache.render($('#admin').text(), {}));
      attachButtonBehavior();
      $('#admin').fadeTo(500, 1.0);
    });
  });
}

function destroyModal() {
  $('#admin').fadeTo(500, 0.0, function() {
    $('#admin').remove();
  });
  $('#menu').fadeTo(500, 1.0);
}

function attachButtonBehavior() {
  $('#exit').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    restrictPage();
    destroyModal();
    $active.click();
  }); 

  $('#admin #contact').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    restrictPage();
    loadContent('contact', function(data) {
      loadTemplate($('#admin div'), '#template-contact', 'admin.html', data,
      function() {
        queryServer('contact');
        unrestrictPage();
        $('#admin').css({
          'background': '-webkit-linear-gradient(#D938D9, #CCC)',
          'background': '-o-linear-gradient(#D938D9, #CCC)',
          'background': '-moz-linear-gradient(#D938D9, #CCC)',
          'background': 'linear-gradient(#D938D9, #CCC)'
        });
      });
    });
  });

  $('#admin #chapters').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    restrictPage();
    loadContent('chapters', function(data) {
      loadTemplate($('#admin div'), '#template-chapters', 'admin.html', data,
      function() {
        queryServer('chapters');
        unrestrictPage();
        $('#admin').css({
          'background': '-webkit-linear-gradient(#41E838, #CCC)',
          'background': '-o-linear-gradient(#41E838, #CCC)',
          'background': '-moz-linear-gradient(#41E838, #CCC)',
          'background': 'linear-gradient(#41E838, #CCC)'
        });
      });
    });
  });

  $('#admin #about').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    restrictPage();
    loadContent('about', function(data) {
      loadTemplate($('#admin div'), '#template-about', 'admin.html', data,
      function() {
        queryServer('about');
        unrestrictPage();
        $('textarea').autosize(); 
        $('#admin').css({
          'background': '-webkit-linear-gradient(#768CEE, #CCC)',
          'background': '-o-linear-gradient(#768CEE, #CCC)',
          'background': '-moz-linear-gradient(#768CEE, #CCC)',
          'background': 'linear-gradient(#768CEE, #CCC)'
        });
      });
    });
  });
}

function queryServer(pagename) {
  $('#admin input[type=\"submit\"]').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    restrictPage();
    var obj = {};
    var action;
    if ($(this).val() === 'Update') {
      console.log("Update");
      obj._id = $(this).parent().parent().parent().attr('data-id');
      $(this).parent().parent().first().find('input, textarea').each(function(ind, elm) {
        var status = $(elm).attr('data-name');
        if (typeof status !== typeof undefined && status !== false) {
          obj[$(elm).attr('data-name')] = $(elm).val();
        }
      });
      action = 'update'
    } else if ($(this).val() === 'Add') {
      $(this).parent().parent().first().find('input, textarea').each(function(ind, elm) {
        var status = $(elm).attr('data-name');
        if (typeof status !== typeof undefined && status !== false) {
          obj[$(elm).attr('data-name')] = $(elm).val();
        }
      });
      action = 'add'
    } else if ($(this).val() === 'Remove') {
      obj._id = $(this).parent().parent().parent().attr('data-id');
      action = 'remove'
    } else {
      return;
    }
    obj = JSON.stringify(obj);
    authenticateFb(action + '&page=' + pagename + '&obj=' + obj, function(data) {
      $('#admin-message').html(data.status);
      setTimeout(function() {
        $('#admin-message').html('');
      }, 5000);
      loadContent(pagename, function(data) {
        loadTemplate($('#admin div'), '#template-' + pagename, 'admin.html', data,
        function() {
          queryServer(pagename);
          unrestrictPage();
          $('#admin #' + pagename).click();
        });
      });
    });
  });
}

function restrictPage() {
  $('#admin input, #admin button, #admin textarea').prop('disabled', true);
  $('#admin-load').show();
}

function unrestrictPage() {
  $('#admin input, #admin button, #admin textarea').prop('disabled', false);
  $('#admin-load').hide();
}