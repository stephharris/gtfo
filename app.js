var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var flightRoutes = require('./server/flight.routes.js');
var airbnbRoutes = require('./server/airbnb.routes.js');
var path = require('path');
var volleyball = require('volleyball');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname + '/node_modules')));
app.use(express.static(path.join(__dirname + '/public')));



app.use(volleyball);

//app.use('/airbnb', airbnbRoutes);
app.use('/flight', flightRoutes)

app.get('/*', function(req, res, next){
  console.log('this is hitting the star thing', req.query)
  res.sendFile(path.join(__dirname + '/public/index.html'));
})

app.use(function(err, req, res, next){
  console.log(err);
  res.sendStatus( err.status || 500)
})

app.listen(8000, function(){
  console.log('Server up & running on port 8000!')
})
