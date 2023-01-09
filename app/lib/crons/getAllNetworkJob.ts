export {}
var cron = require('node-cron');
import moment from 'moment';

module.exports = function () {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForGetAllNetwork === 'yes') {
    start();
  }
}

async function start() {

  try {

    let task = cron.schedule('1 */1 * * * *', async () => {
      console.log(moment().utc(),':::')
      console.log('getAllNetworkJob cron triggered:::')
      triggerJobs()
    });

    task.start();


  } catch (e) {
    console.log(e);
  }

}

async function triggerJobs() {
  await (global as any).networksHelper.getAllNetworks();
}
