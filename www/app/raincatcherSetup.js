var mediator = require('fh-wfm-mediator/lib/mediator');
var workorderSubscribers = require('fh-wfm-workorder/lib/client');
var raincatcherSync = require('fh-wfm-sync/lib/client');
var config = require('./config.json');

module.exports = function setUpRaincatcher($fh) {

  //Initialising the workorder module.
  //The workorder module will now subscribe to the `wfm:workorders` topics
  workorderSubscribers(mediator);

  //Initialising the raincatcher-sync module
  raincatcherSync.init($fh, config.syncOptions, mediator);

  //Managing the `workorders` data set.
  //This sets up the subscribers for the workorders data set (See https://github.com/feedhenry-raincatcher/raincatcher-sync#dataset-topic-subscriptions)
  return raincatcherSync.manage(config.workordersEntityName, config.syncOptions, {}, {}).then(function(workordersManager) {
    //The `workorders` data set has been initialised.
    return workordersManager.start();
  });
};