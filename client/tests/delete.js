QUnit.test( "delete item", function(assert) {
  var done = assert.async();

  var asUser = {
    username: 'admin',
    password: 'password'
  };

  loadPage(asUser, () => {
    require(['/app.js'], () => {
      App.collection.once('updated', () => {
        var items = $('#qunit-fixture').find('.remove-item');


        var toDelete = items.get(items.length - 1);
        $(toDelete).find('input').trigger('click');

        var itemId = $(toDelete).parents('tr').find('[data-id]').data('id');
        var model = App.collection.findWhere({_id: itemId});

        var itemCount = items.length;

        App.collection.once('updated', () => {
          assert.equal((items.length - 1), --itemCount, "new item remove from DOM" );

          assert.equal(App.collection.models.length, (itemCount + 1), "new item was removed from collection" );

          done();
        });

        $('.btn-remove-items').trigger('click');
      });

      App.getItems();
    });
  })
});
