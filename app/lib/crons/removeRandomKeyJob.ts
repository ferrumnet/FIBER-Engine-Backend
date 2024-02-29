export {};
var cron = require("node-cron");
import moment from "moment";

module.exports = function () {
  if (
    (global as any).starterEnvironment
      .isCronEnvironmentSupportedForDeleteRandomKey === "yes"
  ) {
    start();
  }
};

async function start() {
  try {
    let task = cron.schedule("10 50 23 * * *", async () => {
      triggerJobs();
    });

    task.start();
  } catch (e) {
    console.log(e);
  }
}

async function triggerJobs() {
  let deleteDate = moment().utc().subtract(1, "days").endOf("day").format();
  let status = await db.RandomKeys.remove({ createdAt: { $lte: deleteDate } });
  console.log("Removed RandomKeys", status.deletedCount);
}
