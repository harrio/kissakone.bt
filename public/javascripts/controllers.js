function IndexCtrl($scope, $http) {
  $scope.form = {};

  $http.get('/api/runs').
    success(function(data, status, headers, config) {
      $scope.runs = data.runs;
    });
  $http.get('/api/runsDone').
    success(function(data, status, headers, config) {
      $scope.runsDone = data.runsDone;
    });
  $scope.forward = function () {
    $http.post('/forward', $scope.form).
      success(function(data) {
        $location.path('/');
      });
  };
  $scope.reverse = function () {
    $http.post('/reverse', $scope.form).
      success(function(data) {
        $location.path('/');
      });
  };
  $scope.rotateCam = function () {
    $http.post('/rotateCam', $scope.form.angle).
      success(function(data) {
        $location.path('/');
      });
  };
}
 
function AddRunCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.submitRun = function () {
    var timeOfDay = Date.parse($scope.form.time);
    $scope.form.date.setHours(timeOfDay.getHours());
    $scope.form.date.setMinutes(timeOfDay.getMinutes());
    $http.post('/api/run', $scope.form).
      success(function(data) {
        $location.path('/');
      });
  };
}
 
function EditRunCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  $http.get('/api/run/' + $routeParams.id).
    success(function(data) {
      $scope.form = data.run;
      var datetime = new Date(data.run.date);
      $scope.form.date = datetime;
      $scope.form.time = datetime.toString("HH:mm");
    });
    
  $scope.editRun = function () {
    var timeOfDay = Date.parse($scope.form.time);
    $scope.form.date.setHours(timeOfDay.getHours());
    $scope.form.date.setMinutes(timeOfDay.getMinutes());
    $http.put('/api/run/' + $routeParams.id, $scope.form).
      success(function(data) {
        $location.url('/readRun/' + $routeParams.id);
      });
  };
}
 
function DeleteRunCtrl($scope, $http, $location, $routeParams) {
  $http.get('/api/run/' + $routeParams.id).
    success(function(data) {
      $scope.run = data.run;
    });
    
  $scope.deleteRun = function () {
    $http.delete('/api/run/' + $routeParams.id).
      success(function(data) {
        $location.url('/');
      });
  };
  
  $scope.home = function () {
    $location.url('/');
  };
}
