app.factory('InputFactory', function($http){
  return {

    fetchData: function(location){

      var queryParams = {
      location : location
      };
      console.log('query params', inputs.location);
     return $http.get('/flight', { params: queryParams })
      .then(function(response){
        console.log('response in factory', response.data)
        return response.data;
      })
    }

  }
});
