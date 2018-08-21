QUnit.test( "login", function( assert ) {
  var done = assert.async();

  $.get('/logout').done(() => {
    loadPage(() => {
      assert.equal($('.login').length, 1, "Passed!" );
      assert.equal($('#inputUsername').length, 1, "Passed!" );
      assert.equal($('#inputPassword').length, 1, "Passed!" );

      done();
    })
  });
});
