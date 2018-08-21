$('document').ready(function() {
  $('.signup-link').on('click', function(e) {
    e.preventDefault();
    $('.login').fadeOut(function() {
      $('.login').addClass('hide');
      $('.signup').hide().removeClass('hide').fadeIn();
    })
  });

  $('.login-link').on('click', function(e) {
    e.preventDefault();
    $('.signup').fadeOut(function() {
      $('.signup').addClass('hide');
      $('.login').hide().removeClass('hide').fadeIn();
    })
  });

  $('#login').on('submit', function(e) {
    e.preventDefault();
    var params = {
      logusername: $('#inputUsername').val(),
      logpassword: $('#inputPassword').val(),
    };

    $.post('/login', params, (result) => {
      if (result.success && (document.location.pathname === '/' || document.location.pathname === '/index.html')) {
        document.location.href = '/checklist';
      }
      if (result.error) {
        $.jGrowl(result.error, { header: 'Error' });
      }
    })
  });

  $('#signup').on('submit', function(e) {
    e.preventDefault();
    var params = {
      username: $('#inputUsernameSignup').val(),
      password: $('#inputPasswordSignup').val(),
    };

    $.post('/login', params, (result) => {
      if (result.success && (document.location.pathname === '/' || document.location.pathname === '/index.html')) {
        document.location.href = '/checklist';
      }
      if (result.error) {
        $.jGrowl(result.error, { header: 'Error' });
      }
    })
  });

  var urlParams = new URLSearchParams(window.location.search);

  var errorMsg = urlParams.get('error');
  if (errorMsg) {
    $.jGrowl(errorMsg, { header: 'Error', themeState: 'error' });
  }
});
