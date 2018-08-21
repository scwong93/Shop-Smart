(function () {
    function stripScripts(s) {
      var div = document.createElement('div');
      div.innerHTML = s;
      var scripts = div.getElementsByTagName('script');
      var i = scripts.length;
      while (i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
      }

      return div.innerHTML;
    }

    var testModules = [
      'create.js',
      'login.js',
      'signup.js',
      'delete.js'
    ];


    var rand = _.random(10, 99999999999999);
    window.username = `user${rand}`;
    window.password = 'password';

    window.loadPage = function(assert, callback){

      var done = assert;
      if (assert && assert.async) {
        done = assert.async();
      }

      var getPage = function() {
        $.get('../index.html', '.viewport').done((res) => {
          let $content = $(stripScripts(res.toString()));

          $content.remove('script');
          $('#qunit-fixture').html($content);

          $.fn.modal = function() {};
          $.jGrowl = function() {};

          if ($.isFunction(done)) {
            done({success: true});
          }
        });
      };

      if (assert && assert.username && assert.password) {
        $.post('../login', {
          logusername: assert.username,
          logpassword: assert.password
        })
        .done((res) => {
          if (res.success) {
            done = callback;
            getPage();
          }
        });
      } else {
        $.get('/logout').done(getPage);
      }
    };

    QUnit.module('Load Page', {
      after: function() {
        $.get('/logout');
      }
    });

    require(testModules, QUnit.start);
}());
