window.App = {};

App.Model = Backbone.Model.extend({
  idAttribute: '_id',
  defaults: {
    title: '',
    note: '',
    bought: false
  }
});

App.Collection = Backbone.Collection.extend({
  model: App.Model,
  url: '/api/checklist'
});

App.collection = new App.Collection;

var $viewport = $('.viewport'),
    $edit = $('.edit'),
    $list = $('.list'),
    $items = $list.find('.todo-items'),
    $modal = $('.modal');

var updateList = function(data){
    var boughtOption = function(item) {
      if (item.bought) {
        return `
          <td class="fit text-center">
            <a data-id="${item._id}" class="fa fa-check-circle mark-bought"></a>
          </td>
        `;
      } else {
        return `
          <td class="fit text-center">
            <a data-id="${item._id}" class="fa fa-check-circle faded mark-bought"></a>
          </td>
        `;
      }
    };

    var items = [];
    data.forEach((item, idx) => {
      let isFaded = (item.bought ? '' : 'faded');

      items.push(`
        <tr>
          <th scope="row" class="fit">${(idx + 1)}</th>
          <td>
            <a href="#" class="edit-item" data-id="${item._id}">
              <p>${item.title}</p>
            </a>
            <small>${item.note}</small>
          </td>
          ${boughtOption(item)}
          <td class="fit text-center"><input type="checkbox" class="remove-item" /></td>
        </tr>
      `);
    });

    var newHTML = $.parseHTML(`<tbody class="todo-items">${items.join()}</tbody>`);
    $items.fadeOut('fast').html(newHTML).fadeIn('fast');

    App.collection.trigger('updated');
  };

App.getItems = (data) => {
  App.collection.fetch().done(updateList);
};

var socket = io();

socket.on('data', updateList);

App.markBought = function(e) {
  e.preventDefault();

  let id = $(e.target).data('id');
  let model = App.collection.findWhere({_id: id});

  let newVal = !model.get('bought');
  model.set('bought', newVal).save({'bought': newVal}).done(() => {
    $.jGrowl("Item updated successfully", { header: 'Success' });
  });
};

App.editItem = function(e) {
  e.preventDefault();

  let id = $(e.target).parents('[data-id]').data('id');
  let model = App.collection.findWhere({_id: id});

  $edit.find('#inputTitle').val(model.get('title'));
  $edit.find('#inputNote').val(model.get('note'));

  $list.fadeOut().addClass('hide');
  $edit.hide().removeClass('hide').fadeIn();

  // remove any listeners
  $edit.find('#editBtn').off();

  $edit.find('#editBtn').one('click', function() {
    let titleInput = $edit.find('#inputTitle').val();
    let noteInput = $edit.find('#inputNote').val();

    if (titleInput.length < 3) {
      return $.jGrowl('Item title should be atleast 3 characters', {
        header: 'Error',
        themeState: 'error'
      });
    }

    model.set({
      title: titleInput,
      note: noteInput
    });

    model.save().done(function(data) {
      $edit.fadeOut().addClass('hide');
      $list.hide().removeClass('hide').fadeIn();

      $.jGrowl("Item updated successfully", { header: 'Success' });
    });
  });
};

App.removeItems = function() {
  var $selectedItems = $('body').find('.remove-item:checked');
  var itemCount = $selectedItems.length;
  $.each($selectedItems, (idx, el) => {
    let id = $(el).parents('tr').find('[data-id]').data('id');

    let model = App.collection.findWhere({_id: id});

    // /api/checklist/item_id
    model.destroy({
      success: function(m, response) {
        App.collection.remove(m);

        --itemCount;

        if (!itemCount) {
          $.jGrowl("Removal completed successfully!", { header: 'Success' });
        }
      }
    });
  });
};

App.getItems();

$('body').on('click', '.edit-item', App.editItem);
$('body').on('click', '.mark-bought', App.markBought);
$('body').on('click', '.btn-remove-items', App.removeItems);
$('body').on('click', '.cancel-edit', () => {
  $edit.fadeOut().addClass('hide');
  $list.hide().removeClass('hide').fadeIn();
});

$modal.find('#createBtn').on('click', function() {
  let titleInput = $modal.find('#inputTitle').val();
  let noteInput = $modal.find('#inputNote').val();

  if (titleInput.length < 3) {
    return $.jGrowl('Item title should be atleast 3 characters', {
      header: 'Error',
      themeState: 'error'
    });
  }

  let model = new App.Model({
    title: titleInput,
    note: noteInput,
    bought: false
  });

  App.collection.add(model).save().done(() => {
    $('#createItemModal').modal('toggle');

    $list.find('#inputTitle').val('');
    $list.find('#inputNote').val('');
    $.jGrowl("Item created successfully", { header: 'Success' });
  });
});
