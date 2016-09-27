var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var _ = require('lodash');
var airports = require('./airports.json');
var airbnb = require('./airbnb.routes.js');
var filteredResult = {};
var api = require('./api_keys.js');



/////////////////////////////////////////
//////////// HELPER FUNCTIONS ///////////
/////////////////////////////////////////


function qsFormattingAirbnb(str) {
    var mutable = str.toLowerCase().split(" ");
    var result = mutable[0][0].toUpperCase() + mutable[0].slice(1);
    console.log(result)
    if (mutable.length === 1) {
        return str;
    } else {

        for (var i = 1; i < mutable.length; i++) {
            result += '%20' + mutable[i][0].toUpperCase() + mutable[i].slice(1);
        }
        return result;
    }
}


function qsFormattingSkyScanner(str) {
    var mutable = str.toLowerCase().split(" ");
    var result = mutable[0][0].toUpperCase() + mutable[0].slice(1);
    if (mutable.length === 1) {
        return str[0].toUpperCase() + str.slice(1, str.length);
    } else {
        for (var i = 1; i < mutable.length; i++) {
            result += ' ' + mutable[i][0].toUpperCase() + mutable[i].slice(1);
        }
        return result;
    }
}


//if the array contains less than 40 listings, keep as is
//else, splice it in half & take the last half (sorted low to high in order of review count)
// function listingsSample(listingArray){
//   if(listingArray.length < 40){
//     return listingArray;
//   }else{
//     return listingArray.splice(listingArray.length/2, listingArray.length - 1);
//   }
// }

//console.log('IATA of City Name:', findTheIATA('Denpasar'));
function findTheIATA(cityName) {
    var primaryCheck = cityName.toUpperCase();
    if (airports[primaryCheck]) {
        return primaryCheck;
    } else {
        var a = _.filter(airports, ['city', cityName]);
        var iataList = a.map(function(e) {
            return e.iata;
        })
        if (iataList) {
            if (iataList.length > 1) {
                //iataList.length - 1
                return iataList[1];
            } else {
                return iataList[0];
            }
        } else {
            return null;
        }
    }
}


function parseDate(date) {
    var month = date.month.toString();
    var year = date.year.toString();
    if(month.length < 2){ month = '0' + month; }
    return year + '-' + month;
}

/////////////////////////////////////////


function makeRequest(restOfUri){

  var options = {
    uri: 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0',
    qs: {
        apiKey: api.skyscanner
       // -> uri + '?access_token=xxxxx%20xxxxx'
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

options.uri += restOfUri;  //'/GB/GBP/en-GB/LON/anywhere/anytime/anytime'

return rp(options)

}

//User inputs a city name & a month (with year)


router.get('/', function(req, res, next){

//SKY-SCANNER: city to anywhere route
/* URI PATTERN: {market}/{currency}/{locale}/{originPlace}/{destinationPlace}/{outboundPartialDate}/{inboundPartialDate}? */
//example --->  http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/US/USD/en-US/NYC/anywhere/anytime/anytime?apiKey=fu415822976026339773031714947539


var loca = qsFormattingSkyScanner(req.query.location);
var iata = findTheIATA(loca);


console.log('got the location from the qs', iata);

var dynamicUri = '/US/USD/en-US/' + iata + '/anywhere/' + parseDate({ month: 10, year: 2016 }) + '/' + parseDate({ month: 10, year: 2016 });

makeRequest(dynamicUri)
    .then(function (result) {

      var cheapest = _.sortBy(result.Quotes, function(el) { return el.MinPrice })[0];

      var price = cheapest.MinPrice;
      var carrier = cheapest.OutboundLeg.CarrierIds[0];
      var outboundDate = cheapest.OutboundLeg.DepartureDate;
      var inboundDate = cheapest.InboundLeg.DepartureDate;
      var destId = cheapest.OutboundLeg.DestinationId;
      var placeObj = _.filter(result.Places, { PlaceId: destId });
      var carrierObj = _.filter(result.Carriers, { CarrierId: carrier });



var newPlaceObj = placeObj[0];
//console.log('new place obj', newPlaceObj)
      filteredResult.cost = price;
      filteredResult.iata = placeObj[0].IataCode;
      filteredResult.depart = outboundDate.substring(0,10);
      filteredResult.return = inboundDate.substring(0,10);
      filteredResult.aircraft = carrierObj;

     if(newPlaceObj.CityName) {
      filteredResult.city = newPlaceObj.CityName;
     }else{
      filteredResult.city = newPlaceObj.Name;
     }

     if(newPlaceObj.type === 'Country'){
      filteredResult.country = newPlaceObj.Name;
     }else{
      filteredResult.country = newPlaceObj.CountryName;
     }



       var airbnbLocation = qsFormattingAirbnb(filteredResult.city);
       //1 === number of guests
        //res.send([filteredResult])
        //res.send(result);
         console.log('CITYYY', airbnbLocation);

        //AIRBNB QUERIES
        return airbnb(airbnbLocation, '1')
              .then(function(result){

                var allListings = result.search_results;
                console.log('result of total airbnb query', result.search_results.length);

                var airbnbListings = [];

                var listingsByStarRating = _.filter(allListings, function(listing){
                  return listing.listing.star_rating >= 4;
                });

                 var listingsByReviewCount =  _.sortBy(listingsByStarRating, function(listing){
                  return listing.listing.reviews_count;
                  });


                var finalFour = listingsByReviewCount.splice(listingsByReviewCount.length - 4, listingsByReviewCount.length); //topThreelistingsByPrice();
                console.log('final four', finalFour.length);

                finalFour.forEach(function(listing){
                  airbnbListings.push({
                    img: listing.listing.picture_url,
                    price: listing.pricing_quote.rate.amount,
                    neighborhood: listing.listing.neighborhood,
                    type: listing.listing.room_type,
                    reviewCount: listing.listing.reviews_count,
                    starRating: listing.listing.star_rating,
                    url: 'https://www.airbnb.com/rooms/' + listing.listing.id
                  })
                });

                //attaching airbnb data to the filtered result from above
                filteredResult.airbnb = airbnbListings;

                console.log('Airbnb Listing Custom Info', airbnbListings);
                console.log("GOT HERE TO WHERE I AM ABOUT TO SEND")
                res.json(filteredResult)

        })

    })
    // .then(function())
    .catch(function (err) {
        console.log(err)
    });

})


module.exports = router;
