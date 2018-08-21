const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const User = require('./User.js')
mongoose.connect('mongodb://admin:password1@ds127362.mlab.com:27362/shopsmart', { useNewUrlParser: true });
const db = mongoose.connection;

var Schema = mongoose.Schema;
var checklistSchema = new Schema({
    title: String,
    note: String,
    bought: Boolean
});

const Model = mongoose.model('checklist', checklistSchema);

const PORT = (process.env.PORT || 3000);

var socketUser, socket;
io.on('connection', function(s){
  socket = s;
});

app.use(session({
  secret: 'confidential',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/login', function (req, res, next) {
  if (req.body.username && req.body.password) {
    var userData = {
      username: req.body.username,
      password: req.body.password
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.json({success: true});
      }
    });

  } else if (req.body.logusername && req.body.logpassword) {
    User.authenticate(req.body.logusername, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = 'Wrong email or password.';
        return res.json({success: false, error: err});
      } else {
        req.session.userId = user._id;
        return res.json({success: true});
      }
    });
  } else {
    var err = 'All fields required.';
    return res.json({success: false, error: err})
  }
})

router.route('/checklist')
  .post((req, res) => {
    let model = new Model(req.body);

    model.save(function(err) {
      if (err) {
        return res.send(err);
      }

      Model.find({}, function(err, models) {
        io.emit('data', models);
      });

      res.json({
        success: true
      });
    });
  })
  .get(function(req, res) {
    Model.find({}, function(err, models) {
      if (err) {
        return res.send(err);
      }

      res.json(models);
    });
  })
;

router.route('/checklist/:id')
  .put(function(req, res) {
    Model.findById(req.params.id, function(err, model) {
      model.title = req.body.title;
      model.note = req.body.note;
      model.bought = req.body.bought;

      model.save(function(err) {
        if (err) {
          return res.send(err);
        }

        Model.find({}, function(err, models) {
          io.emit('data', models);
        });

        res.json({
          success: true
        });
      });
    });
  })
  .delete((req, res) => {
    Model.deleteOne({
      '_id': req.params.id
    }, (err) => {
      if (err) {
        return res.send(err);
      }

      Model.find({}, function(err, models) {
        io.emit('data', models);
      });

      res.json({
        success: true
      });
    })
  })
;

app.use('/api', router);

app.get('/logout', function (req, res, next) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        delete req.session;
        return res.redirect('/index.html');
      }
    });
  }
});

app.use('/checklist', function(req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = 'Not authorized!';
          return res.redirect('/index.html?error=' + err);
        } else {
          return res.sendFile(path.join(__dirname + '/client/checklist.html'));
        }
      }
    })
  ;
})

app.use(function(req, res, next) {
  if ((req.session && req.session.userId) && (req.path === '/' || req.path.includes('/index.html'))) {
    return res.redirect('/checklist');
  }
  next();
})

app.use(express.static('client'));

http.listen(PORT, function() {
  console.log('Server running on http://127.0.0.1:' + PORT);
});
