'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const superagent = require('superagent');

const app = express();
const pg = require('pg');
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();
app.use(cors());

const locations = {};

//homepage
app.get('/', (request, response) => {
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
app.get('/add', handleLocalStorage);

function handleLocalStorage(location, response) {
     
    let sql = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)';
    let sqlArr = [location.search_query,location.formatted_query,location.latitude,location.longitude];
    client.query(sql, sqlArr);
    locations[city]=(location);

  };

function handleLocation(request, response) {
    const city = request.query.city;
    const key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`
    const sql = 'SELECT * FROM locations WHERE search_query=$1'
    const sqlArr = [city];
    client.query(sql,sqlArr)
    .then(sqlData => {
        if (sqlData.rows.length){
            console.log(sqlData.rows[0]);
            response.send(sqlData.rows[0]);
        }else{
            superagent.get(url)
            .then(data => {
                const currentCoordinates = data.body[0];
                console.log(currentCoordinates);
                const locationObj = new Location(city, currentCoordinates);
                handleLocalStorage(locationObj, response);
                response.send(locationObj);
            })
            .catch(error => {
                response.status(500).send('sorry, something went wrong with handle location');
            });      
        }
    })
}

function Location(city, coordinates) {
    this.search_query = city;
    this.formatted_query = coordinates.display_name;
    this.latitude = coordinates.lat;
    this.longitude = coordinates.lon;
}


function handleWeather(request, response) {
        const getWeather = request.query.search_query;
        const weatherKey = process.env.WEATHER_API_KEY; 
        const url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${weatherKey}&city=${getWeather}`      
        superagent.get(url)
        .then(results => {
            const weatherArr=[];
            results.body.data.forEach((val)=>{
                let weatherObj = new Weather(val);
                weatherArr.push(weatherObj);
            });
            response.status(200).send(weatherArr);
        })
        .catch(error => {
            response.status(500).send('sorry, something went wrong.');
        });   
};

function Weather(data) {
  this.forecast = data.weather.description;
  this.time = data.datetime;
}

function handleTrails(request, response) {
    const lat = request.query.latitude;
    const lon = request.query.longitude;   
    const key = process.env.TRAIL_API_KEY;
    const trailUrl = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${key}`   
    superagent.get(trailUrl)
    .then(results => {
        const trailArr=[];
        results.body.trails.forEach((trail)=>{
                let trailObj = new Trail(trail);
                trailArr.push(trailObj);
        });
            response.status(200).send(trailArr);            
        })
        .catch(error => {
            response.status(500).send('sorry, getting trails went wrong.');
        });       
}

function Trail(trails) {
    this.name = trails.name;
    this.location = trails.location;
    this.length = trails.length;
    this.stars = trails.stars;
    this.star_votes = trails.star_votes;
    this.summary = trails.summary;
    this.trail_url = trails.url;
    this.conditions = trails.conditionDetails;
    this.condition_date = trails.conditionDate.split(' ')[0];
    this.condition_time = trails.conditionDate.split(' ')[1];
}

//404 catch all route
function notFoundHandler (request, response) {
    response.status(404).send('not found');
};
//let us know the computer is listening to the port
app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});