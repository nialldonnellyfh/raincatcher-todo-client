var CONSTANTS = require('../constants');
var toDoApp = angular.module(CONSTANTS.TODO_COMPONENT);

toDoApp.directive('todo', function() {
  return {
    scope: {},
    restrict: 'E',
    replace: true,
    controller: 'TODOCtrl',
    templateUrl: 'views/components/todo.html'
  };
});