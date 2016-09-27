var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var api = require('./api_keys.js');


var airbnbQuery = function(loc, guests){

//https://api.airbnb.com/v2/search_results?client_id=3092nxybyb0otqw18e8nh5nty&locale=en-US&currency=USD&_format=for_search_results_with_minimal_pricing&_limit=10&_offset=0&fetch_facets=true&guests=1&ib=false&ib_add_photo_flow=true&location=Denver&min_bathrooms=0&min_bedrooms=0&min_beds=1&min_num_pic_urls=10&price_max=210&price_min=40&sort=1

var options = {
    uri: 'https://api.airbnb.com/v2/search_results',
    qs: {
        client_id: api.airbnbKey,
        locale: 'en-US',
        currency: 'USD',
        _format: 'for_search_results_with_minimal_pricing',
        _limit: '50',
        _offset: '0',
        fetch_facets: 'true',
        guests: guests,
        ib: 'false',
        ib_add_photo_flow: 'true',
        location: loc,
        min_bathrooms: '1',
        min_bedrooms: '0',
        min_beds: '1',
        min_num_pic_urls: '10',
        price_max: '200',
        price_min: '40',
        sort: 1
         // -> uri + '?access_token=xxxxx%20xxxxx' //d2ps6mjhl0uttgc8vy0uoqd7g //3092nxybyb0otqw18e8nh5nty
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

//console.log('OPTIONSSSS', options);
return rp(options)
    .then(function(repos) {
       //console.log('repos', repos)
        return repos;
    })
    .catch(function(err) {
        console.log(err)
    });


}


// rp(options)
//     .then(function (repos) {
//         ///console.log('User has %d repos', repos.facets);
//         res.send(repos.metadata);
//     })
//     .catch(function (err) {
//         console.log(err)
//     });

// })


module.exports = airbnbQuery;
