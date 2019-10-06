const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');

const mongoose = require('mongoose');
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track');

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

const Schema = mongoose.Schema;
const exUserSchema = new Schema({
  username: String
});
const exerciseTrackSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
  userId: String
});

const ExerciseUser = mongoose.model('exercise-user', exUserSchema);
const ExerciseTrack = mongoose.model('exercise-track', exerciseTrackSchema);

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (request, response) => {
  const {
    username
  } = request.body;

  const user = new ExerciseUser({
    username
  });

  user.save((error, data) => {
    if (error) {
      response.send('Error');
    }

    response.send(data);
  });

});

app.post('/api/exercise/add', (request, response) => {
  const {
    userId,
    description,
    duration,
    date
  } = request.body;

  ExerciseUser.findById(userId, (error, data) => {
    if (error) {
      response.send('Failed to Find User by that ID');
    }

    const track = new ExerciseTrack({
      username: data.username,
      description,
      duration,
      date,
      userId: data._id
    });

    track.save((error, data) => {
      if (error) {
        response.send('Error');
      }

      response.send(data);
    });

  });
});

app.get('/api/exercise/log', (request, response) => {
  const {
    userId,
    limit
  } = request.query;

  ExerciseTrack.find({
    userId
  }, (error, data) => {
    if (error) {
      response.send('Error');
    }

    response.send(data);
  }).limit(limit);

});

// Not found middleware
app.use((req, res, next) => {
  return next({
    status: 404,
    message: 'not found'
  })
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})