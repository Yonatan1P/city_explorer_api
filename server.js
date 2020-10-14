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
    console.log('homepage works');
  response.send('my homepage');
});
//unauthorized error
app.get('/unauthorized', (request, response) => {
  throw new Error('not authorized to access this route');
});

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('*', notFoundHandler);


function handleLocation(request, response) {
    const city = request.query.city;
    const key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`
    
        superagent.get(url)
        .then(data => {
            const currentCoordinates = data.body[0];
            const locationObj = new Location(city, currentCoordinates);
            response.send(locationObj);
        })
        .catch(error => {
            response.status(500).send('sorry, something went wrong.');
        });
      
}

function Location(city, coordinates) {
    this.search_query = city;
    this.formatted_query = coordinates.display_name;
    this.latitude = coordinates.lat;
    this.longitude = coordinates.lon;
}


function handleWeather(request, response) {
        const getWeather = request.query.search_query;
        const weatherKey = WEATHER_API_KEY; 
        console.log(weatherKey);
        const url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${weatherKey}&city=${getWeather}`
       
        superagent.get(url)
        .then(results => {
            const getWeatherArr = [];
            const weatherReport = results.body.data.forcast[0];
            const weatherObj = new Weather (day, weatherReport);
            locations[url] = weatherObj;
            response.json(weatherObj);
        })
        .catch(error => {
            response.status(500).send('sorry, something went wrong.');
        });
    // otherwise, if an error is handed off, handle it here
    response.status(500).send('sorry, something broke.');

}

function Weather(data) {
  this.forcast = data.weather.description;
  this.time = data.datetime;
}

function handleTrails(request, response) {
    const city = request.query.city;
    const key = process.env.TRAIL_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`

        superagent.get(url)
        .then(data => {
            const currentCoordinates = data.body[0];
            const trailObj = new Trail(city, currentCoordinates);
           
            response.send(trailObj);
        })
        .catch(error => {
            response.status(500).send('sorry, something went wrong.');
        });  
}

function Trail(data) {
    this.name = data.name;
    this.type = data.type;
    this.summary = data.summary;
    this.location = data.location;
    this.length = data.length;
    this.stars = data.star;
    this.star_votes = data.star_votes;
    this.trail_url = data.url;
    this.conditions = data.conditionDetails;
    this.conditionDate = data.conditionDate;
    this.conditionTime = data.conditionTime
}

//404 catch all route
function notFoundHandler (request, response) {
    response.status(404).send('not found');
};
//let us know the computer is listening to the port
app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});