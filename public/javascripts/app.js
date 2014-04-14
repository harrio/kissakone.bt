angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ui.directives', '$strap.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index',
        controller: IndexCtrl
      }).
      when('/addRun', {
        templateUrl: 'partials/addRun',
        controller: AddRunCtrl
      }).
      when('/editRun/:id', {
        templateUrl: 'partials/editRun',
        controller: EditRunCtrl
      }).
      when('/deleteRun/:id', {
        templateUrl: 'partials/deleteRun',
        controller: DeleteRunCtrl
      }).
      otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  }]);