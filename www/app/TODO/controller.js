var CONSTANTS = require('../constants');
var _ = require('lodash');
var mediator = require('fh-wfm-mediator/lib/mediator');
var config = require('../config');

//The topic generator is used to more easily generate topics to use with the mediator
//See https://github.com/feedhenry-raincatcher/raincatcher-mediator#topics-utilities
var TopicUtilGenerator = require('fh-wfm-mediator/lib/topics');

var toDoApp = angular.module(CONSTANTS.TODO_COMPONENT);

toDoApp.controller('TODOCtrl', function($scope, $timeout) {


  //Setting up the topic utilities for the workorders module.
  var workorderTopicUtil = new TopicUtilGenerator(mediator).prefix(CONSTANTS.WFM_PREFIX).entity(config.workordersEntityName);

  //Setting up the topic utilities for the Sync workorders data set.
  var syncWorkordersTopicUtil = new TopicUtilGenerator(mediator).prefix(CONSTANTS.WFM_SYNC_PREFIX).entity(config.workordersEntityName);

  $scope.newWorkorder = {};

  // Here we can set up subscribers for the `done` and `error` topics
  // from the raincatcher-workorder module.
  // This is useful for scenarios where business logic is required
  // when a workorder completes. (e.g. notify a user by SMS etc)


  workorderTopicUtil.onDone('create', function(todoItem) {
    console.log("A TODO item was created", todoItem)
  });

  workorderTopicUtil.onError('create', function(error) {
    console.log("An Error Occurred when creating a todo item", error)
  });

  workorderTopicUtil.onDone('update', function(todoItem) {
    console.log("A TODO item was updated", todoItem)
  });

  workorderTopicUtil.onError('update', function(error) {
    console.log("An Error Occurred when updating a todo item", error)
  });

  /**
   *
   * Adding a new todo item from the UI
   *
   * @param todoItemToAdd
   * @param isValid - passed from the UI form to identify if the form is valid.
   */
  $scope.addTodoItem = function(todoItemToAdd, isValid) {
    if (!isValid) {
      return;
    }

    $scope.newWorkorder = {};
    todoItemToAdd.status = CONSTANTS.STATUS.NEW;

    //removing any angular internal properties (e.g. $$hash)
    JSON.parse(angular.toJson(todoItemToAdd));

    //Publishing the `wfm:workorders:create` topic. This is subscribed to by the raincatcher-workorder module.
    workorderTopicUtil.publish('create', {workorderToCreate: todoItemToAdd}).then(function(createdToDoItem) {
      //All of the subscribers for the create topic have completed.
      console.log("Created a TODO Item", createdToDoItem);
    }).catch(function(err) {
      //One of the subscribers encountered an error when handling the published topic.
      console.log("There was an error creating the TODO item", err);
    });
  };

  /**
   *
   * Marking the todo item as complete.
   *
   * This involves setting the updated status and publishing the `wfm:workorders:update` topic
   *
   * @param todoItemToComplete
   */
  $scope.completeTodoItem = function(todoItemToComplete) {
    todoItemToComplete.status = CONSTANTS.STATUS.COMPLETE;
    todoItemToComplete = JSON.parse(angular.toJson(todoItemToComplete));

    //Publishing the `wfm:workorders:update` topic. This is subscribed to by the raincatcher-workorder module.
    workorderTopicUtil.publish('update', {workorderToUpdate: todoItemToComplete}).then(function(updatedTodoItem) {
      console.log("Updated a TODO Item", updatedTodoItem);
    }).catch(function(err) {
      //One of the subscribers encountered an error when handling the published topic.
      console.log("There was an error updating the TODO item", err);
    });
  };

  /**
   *
   * Utility function to load the latest set of todo items and update the UI
   *
   * @returns {*}
   */
  function loadWorkorders() {
    //Publishing the `wfm:workorders:list` topic.  This is subscribed to by the raincatcher-workorder module.
    return workorderTopicUtil.publish("list")
      .then(function(todoItems) {
        todoItems = _.groupBy(todoItems, 'status');

        $timeout(function() {
          $scope.completedWorkorders = todoItems.Complete;
          $scope.newWorkorders = todoItems.New;
        }, 0);
      }).catch(function(err) {
        console.log("There was an error listing TODO items", err);
      });
  }

  syncWorkordersTopicUtil.on('record_delta_received', loadWorkorders);
  syncWorkordersTopicUtil.on('local_update_applied', loadWorkorders);

  loadWorkorders();
});