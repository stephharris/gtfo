
var app = angular.module('budget-backpacker', ['ui.router']);

app.controller('FormCtrl', function($scope, InputFactory, $state){

   // $scope.formInvalid = false;

//inputs === {{ location: whateverusertyped }}

    $scope.submit = function(inputs){
        $state.go('success', { location: inputs.location })
    }




});
