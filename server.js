'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
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

app.get('/location', handleLocation);

function Location(city, coordinates) {
    this.search_query = city;
    this.formatted_query = coordinates[0].display_name;
    this.latitude = coordinates[0].lat;
    this.longitude = coordinates[0].lon;
}

function handleLocation(request, response) {
    try {
        const coordinates = require('./data/location.json');
        const city = request.query.city; 
        const url = `https://us1.locationiq.come/v1/search.php?key=${Location_API_KEY}&q=${city}&format=json&limt=1`
        superagent.get(url)
            .then(data => {
                const coordinates = data.body[0];
                const locationData = new Location(city,coordinates);
                locationData(url) = 
                response.json(locationData)
            })
        
    } catch {
        response.status(500).send('sorry, something broke.');
    }
}

app.get('/weather', handleWeather);

function Weather(day, weatherReport) {
  this.search_query = day;
  this.formatted_query = weatherReport[0].display_name;
  this.latitude = weatherReport[0].lat;
  
}

function handleWeather(request, response) {
  try {
    // try to "resolve" the following (no errors)
    const weatherReport = require('./data/location.json');
    const day = request.query.weatherReport; 
    const weatherData = new Weather(day, weatherReport);
    response.json(weatherData);
  } catch {
    // otherwise, if an error is handed off, handle it here
    response.status(500).send('sorry, something broke.');
  }
}
//404 catch all route
app.get('*', (request, response) => {
  response.status(404).send('not found');
});

app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});