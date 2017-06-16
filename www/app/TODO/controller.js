var CONSTANTS = require('../constants');
var _ = require('lodash');

var toDoApp = angular.module(CONSTANTS.TODO_COMPONENT);
var mediator = require('fh-wfm-mediator/lib/mediator');

var Topic = require('fh-wfm-mediator/lib/topics');

toDoApp.controller('TODOCtrl', function($scope, $timeout, WFM_PREFIX, WFM_SYNC_PREFIX, WORKORDER_ENTITY_NAME) {

  var workorderTopic = new Topic(mediator).prefix(WFM_PREFIX).entity(WORKORDER_ENTITY_NAME);
  var workorderSyncTopic = new Topic(mediator).prefix(WFM_SYNC_PREFIX).entity(WORKORDER_ENTITY_NAME);

  $scope.newWorkorder = {};

  $scope.addTodoItem = function(todoItemToAdd, isValid) {

    if (!isValid) {
      return;
    }
    $scope.newWorkorder = {};
    todoItemToAdd.status = "New";
    JSON.parse(angular.toJson(todoItemToAdd));

    workorderTopic.publish('create', {workorderToCreate: todoItemToAdd}).then(function(createdToDoItem) {
      console.log("Created", createdToDoItem);
    }).catch(function(err) {
      console.log("There was an error creating the TODO item", err);
    });
  };

  $scope.completeTodoItem = function(todoItemToComplete) {
    todoItemToComplete.status = "Complete";
    todoItemToComplete = JSON.parse(angular.toJson(todoItemToComplete));

    workorderTopic.publish('update', {workorderToUpdate: todoItemToComplete}).then(function(updatedTodoItem) {
      console.log("Updated", updatedTodoItem);
    }).catch(function(err) {
      console.log("There was an error upadting the TODO item", err);
    });
  };

  function loadWorkorders() {
    return workorderTopic.publish("list")
      .then(function(todoItems) {
        todoItems = _.groupBy(todoItems, 'status');

        $timeout(function() {
          $scope.completedWorkorders = todoItems.Complete;
          $scope.newWorkorders = todoItems.New;
        }, 0);
      }).catch(function(err) {
        console.log("There was an error listing TODO items", err);
      });;
  }

  workorderSyncTopic.on('record_delta_received', loadWorkorders);
  workorderSyncTopic.on('local_update_applied', loadWorkorders);

  loadWorkorders();
});