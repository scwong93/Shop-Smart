QUnit.test( "signup", function( assert ) {
  var done = assert.async();

  loadPage(() => {
    require(['../login.js'], () => {
      $('.signup-link').trigger('click');

      setTimeout(function() {
        var $signup = $('.signup');
        var $form = $signup.find('form');

        assert.equal($signup.length, 1, "Signup found" );

        $signup.find('#inputUsernameSignup').val(window.username);
        $signup.find('#inputPasswordSignup').val(window.password);

        assert.equal($signup.find('#inputUsernameSignup').val(), window.username, "Signup username filled out" );
        assert.equal($signup.find('#inputPasswordSignup').val(), window.password, "Signup password filled out" );

        $form.one('submit', () => {
          var asUser = {
            username: window.username,
            password: window.password
          };

          $.post('/login', asUser).done((res) => {
            assert.ok(res.success, "Signed up successfully" );

            done();
          })
        });

        $form.trigger('submit');
      });
    });
  })
});
