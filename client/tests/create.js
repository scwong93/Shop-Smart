QUnit.test( "create new item", function(assert) {
  var done = assert.async();

  var asUser = {
    username: 'admin',
    password: 'password'
  };

  loadPage(asUser, () => {
    require(['../app.js'], () => {
      var $form = $('#createItemModal').find('form');

      $form.find('#inputTitle').val('test item');
      $form.find('#inputNote').val('test note...');

      var next = () => {
        var itemCount = App.collection.toJSON().length;

        App.collection.once('updated', () => {
          $form.parents('.modal').find('#createBtn').trigger('click');

          setTimeout(() => {
            assert.equal(App.collection.toJSON().length, (itemCount + 1), "new item was created" );

            done();
          }, 1000);
        })
      };

      App.collection.once('sync', next);
    });
  })
});
