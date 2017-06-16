var mediator = require('fh-wfm-mediator/lib/mediator');
var workorderClient = require('fh-wfm-workorder/lib/client');
var synClient = require('fh-wfm-sync/lib/client');
var config = require('./config.json');

module.exports = function setUpRaincatcher($fh) {
  console.log("** Setting Up Raincatcher Components");

  workorderClient(mediator);
  //Using the raincatcher
  synClient.init($fh, config.syncOptions, mediator);

  return synClient.manage('workorders', config.syncOptions, {}, {}).then(function(manager) {
    console.log("Starting");
    return manager.start();
  });
};