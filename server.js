'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT;
app.use(cors());

//homepage
app.get('/', (request, response) => {
  response.send('my homepage');
});
//unauthorized error
app.get('/unauthorized', (request, response) => {
  throw new Error('not authorized to access this route');
});


app.get('/test/route', (request, response) => {
  response.json({ location: 'seattle', temp: '58 deg' });
});


app.get('/location', handleLocation);

function Location(city, coordinates) {
  this.search_query = city;
  this.formatted_query = coordinates[0].display_name;
  this.latitude = coordinates[0].lat;
  this.longitude = coordinates[0].lon;
}

function handleLocation(request, response) {
  try {
    // try to "resolve" the following (no errors)
    const coordinates = require('./data/location.json');
    const city = request.query.city; // "seattle" -> localhost:3000/location?city=seattle
    const locationData = new Location(city, coordinates);
    response.json(locationData);
  } catch {
    // otherwise, if an error is handed off, handle it here
    response.status(500).send('sorry, something broke.');
  }
}

app.get('*', (request, response) => {
  response.status(404).send('not found');
});

app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});