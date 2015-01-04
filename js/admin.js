/*
	js/admin.js
	Includes functions for rendering the admin modal, and adding events
	to admin related elements
*/

function initAdminPanel(content, timer) {
	$('#auth').one('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		renderModal(content, timer);
		clearInterval(timer);
		$('#live, #next').fadeOut(600);
	});
}

// hides main website and launches admin modal
function renderModal(content) {
	authenticateFb('verify', function(response) {
		if (!response || response === null || response.status !== 'success') {
			// authentication failed, exit out of admin modal
			alert('you must be authenticated on facebook');
			destroyModal();
			return;
		}
		$('#container').prepend($('<div id=\"admin\"></div>'));
		$('#admin').hide();
		loadTemplate($('#admin'), '#template-modal', 'admin.html', content, function() {
			for (var page in content) {
				$('#buttons').append($('<span></span>', {id: page}).html(page));
			}
			attachButtonBehavior();
			uploadImage();
			$('#main').slideUp(600, function() {
					$('#admin').slideDown(600);
			});
		});
	});
}

// destroys the admin modal and restores the main website
function destroyModal() {
	$('#admin').slideUp(600, function() {
		$('#main').slideDown(600);
		$('#admin').remove();
		initContent();
	});
}

function adminNavButtonBehavior(ind, element) {
	var formName = $(element).attr('id');
	$(element).mouseenter(function(e) {
		$('#whiteBars #backgroundBar').stop(true).animate({backgroundColor: "#F9F9F9"}, 300);
	});
	$(element).mouseleave(function(e){
		$('#whiteBars #backgroundBar').stop(true).animate({backgroundColor: "#3E3E3E"}, 300);
	});
	$(element).click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('#admin div[id*=-form]:visible').hide();
		$('#' + formName + '-form').show();
		$('#buttonHolder').show();
	});
	$('#' + formName + '-form #addRow').click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var fields = $(this).data('fields').split(" ");
		var $row = $('<tr></tr>');
		var	$removeLink = $('<a></a>', {href: '#'});
		$removeLink.one('click', function(e) {
			e.stopPropagation();
			e.preventDefault();
			$(this).parents('tr').remove();
		})
		$removeLink.html('Remove Row');
		for (var i in fields) {
			if (fields[i] === 'body') {
				$row.append($('<td></td>').html('<textarea class="item" data-type="body"></textarea>'));
			} else {
				$row.append($('<td></td>').html('<input class="item" data-type="' + fields[i] + '" type="text" />'));
			}
		}
		$row.append($('<td></td>').append($removeLink));

		$('#' + formName + '-form').find('#addRow').parents('tr').before($row);
	});
}

// TODO: tell the admin-modal buttons what to do
function attachButtonBehavior() {
	$('#exit').click(function(e) {
		destroyModal();
	});

	$('#buttons').find('span').not('#exit').each(adminNavButtonBehavior);

	$('#adminSubmit').one('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		deliverUpdateObject();
	});
}

// invoked when user submits changes from the admin panel
function deliverUpdateObject() {
	var result = {};
	$('#buttons').find('span').not('#exit').each(function(ind, element) {
		var pagename = $(element).attr('id');
		result[pagename] = [];
		$('#' + pagename + '-form tr').each(function(i, item) {
			var newItem = {};
			if ($(item).find('.del').is(':checked')) {
				return;
			}
			$(item).find('.item').each(function(n, field) {
				newItem[$(field).data('type')] = $(field).val();
			});
			if (!$.isEmptyObject(newItem)) {
				result[pagename].push(newItem);
			}
		});
	});
	console.log(result);
	var resultString = JSON.stringify(result);
	authenticateFb('update&upData=' + resultString, function(response) {
		destroyModal();
	});
}

function uploadImage() {
	$('#ubutt').one('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
    var fd = new FormData();
    fd.append('image', $('#ufile')[0].files[0]);      

    $.ajax({
      url: 'http://localhost:1818/TMP_upload.php',
      data: fd,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data) {
      	uploadImage();
      	if (data['name']) {
      		var image = '<img src="graphics/"' + data['name'] + '" height="200px" />';
      		var hidden = '<input type="hidden" class="item" data-type="filename" value="'
      			+ data['name'] + '" />';
      		var rowHtml = '<tr><td>' + image + hidden + 
      			'</td><td>PRESS SUBMIT TO SAVE CHANGES</td></tr>'
	        $('#ufile').parents('tr').before($(rowHtml));
	      } else {
	      	var $err = $('<p>Error, upload failed</p>');
	      	$err.fadeIn(500).delay(2000).fadeOut(500);
	      	$('#ufile').before($err);
	      }
       }
    });
	})
}

function loadTemplate($destination, selector, filename, data, callback) {
	$destination.load('templates/' + filename + ' ' + selector,
	function(response, status, xhr) {
		$destination.html(Mustache.render($destination.text(), data));
		callback();
	});
}