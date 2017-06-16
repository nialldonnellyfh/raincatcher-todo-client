window.angular = require("angular");
require("angular-route");
require("angular-sanitize");
require("angular-resource");

var raincatcherSetup = require('./raincatcherSetup');

var myApp = angular.module('myApp', ['ngRoute',
    'ngSanitize',
  require('./TODO')
]).constant('$fh', require("fh-js-sdk"))
  .constant("WFM_PREFIX", "wfm")
  .constant("WFM_SYNC_PREFIX", "wfm:sync")
  .constant("WORKORDER_ENTITY_NAME", "workorders")
  .run(raincatcherSetup);

myApp.config(function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'views/example.html'
        });
});