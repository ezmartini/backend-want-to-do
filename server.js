const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const multer = require('multer');

const Users = require('./routes/user');
const app = express();
const User = require('./models/User');

const toDos = require('./models/WantToDos')

app.use(
	cors({
		origin: function (origin, callback) {
			// allow requests with no origin
			// (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
	})
);

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = require('./db');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
app.use('/api/users', Users);

app.get('/profile', (req, res) => {
  res.json({
    profiles: [
      {
        name: 'Charles Leclerc',
        email: 'cleclerc@gmail.com',
        bio: 'Charles Perceval Leclerc is a Monégasque racing driver, currently racing in Formula One for Scuderia Ferrari. He won the GP3 Series championship in 2016 and the FIA Formula 2 Championship in 2017.',
      },
      {
        name: 'Lewis Hamilton',
        email: 'lhamilton@mercedes.com',
        bio: 'In Formula One, Hamilton has won a joint-record seven World Drivers Championship titles, and holds the records for the most wins, pole positions, and podium finishes, among others',
      },
      {
        name: 'Nicolas Latifi',
        email: 'test',
        bio: 'test',
      },
    ],
  });
});


app.post('/api/createtoDos', function(req, res){
  const body = req.body

  if (!body) {
      return res.status(400).json({
          success: false,
          error: 'You must provide a todo',
      })
  }

  const toDo = new toDos(req.body)

  if (!toDo) {
      return res.status(400).json({ success: false, error: err })
  }

  toDo
      .save()
      .then(() => {
          return res.status(201).json({
              success: true,
              id: toDo._id,
              message: 'todo created!',
          })
      })
      .catch(error => {
          return res.status(400).json({
              error,
              message: 'todo not created!',
          })
      })
});

app.get('/api/viewtoDos', async function(req, res){
  await toDos.find({}, (err, alltoDos) => {
    if (err) {
        return res.status(400).json({ success: false, error: err })
    }
    if (!alltoDos.length) {
        return res
            .status(404)
            .json({ success: false, error: `toDo not found` })
    }
    return res.status(200).json({ success: true, data: alltoDos })
}).catch(err => console.log(err))
});
app.delete('/api/deletetoDos', async function(req, res){
  await toDos.findOneAndDelete({ _id: req.params.id }, (err, toDo) => {
    if (err) {
        return res.status(400).json({ success: false, error: err })
    }

    if (!toDo) {
        return res
            .status(404)
            .json({ success: false, error: `toDo not found` })
    }

    return res.status(200).json({ success: true, data: toDo })
}).catch(err => console.log(err))
});


app.get('/api/viewtoDoById', async function(req, res){
  await toDos.findOne({ _id: req.params.id }, (err, toDo) => {
    if (err) {
        return res.status(400).json({ success: false, error: err })
    }

    if (!toDo) {
        return res
            .status(404)
            .json({ success: false, error: `toDo not found` })
    }
    return res.status(200).json({ success: true, data: toDo })
}).catch(err => console.log(err))
});


//maybe add one where you update to show that you did it?


app.get('/api/viewUsers', async function(req, res){
  await User.find({}, (err, allUsers) => {
    if (err) {
        return res.status(400).json({ success: false, error: err })
    }
    if (!allUsers.length) {
        return res
            .status(404)
            .json({ success: false, error: `User not found` })
    }
    return res.status(200).json({ success: true, data: allUsers })
}).catch(err => console.log(err))
});

const port = 5000;
app.listen(5000, () => console.log('Server on port 5000'));
