app.config(function($stateProvider){

 // $stateProvider.state('error', {
 //  url: '/error',
 //  template: `<p>Try Again!</p>`,
 // })


 $stateProvider.state('success', {
  url: '/:location',
  templateUrl: '/js/data.template.html',
  controller: function($scope, InputFactory, $stateParams, theData){
    // InputFactory.fetchData($stateParams.location).then(function(theData){
      $scope.data = theData;
    // })
    console.log('heres the url', theData.airbnb[0].img)
  },
  resolve: {
    theData: function(InputFactory, $stateParams){
      console.log('state params in resolve', $stateParams.location);
      return InputFactory.fetchData($stateParams.location);
    }

  }
})
 });



