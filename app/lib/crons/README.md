# getAllNetworkJob.ts

### Module Exports Function

This unnamed function is exported by the module and checks if the environment supports running the cron job for getting all networks. If supported, it calls the `start` function to initialize the cron job.

Code:

typescript

Copy code

`module.exports = function () {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForGetAllNetwork === 'yes') {
    start();
  }
}`

### `start` Function

The `start` function schedules and starts a cron job that runs every 5 minutes. Within the job, it logs the current UTC time and a message indicating the cron job has been triggered, and then calls the `triggerJobs` function.

Code:

typescript

Copy code

`async function start() {
try {
let task = cron.schedule('1 _/5 _ \* \* \*', async () => {
console.log(moment().utc(),':::')
console.log('getAllNetworkJob cron triggered:::')
triggerJobs()
});

    task.start();

} catch (e) {
console.log(e);
}
}`

### `triggerJobs` Function

The `triggerJobs` function asynchronously calls the `getAllNetworks` method from a helper object on the global object. This method likely fetches network-related data from an API or database.

Code:

typescript

Copy code

`async function triggerJobs() {
  await (global as any).networksAxiosHelper.getAllNetworks();
}`

Each function is designed to work within a cron job environment and collectively ensures that network data is fetched periodically as per the scheduled interval.

# getGasEstimationJob.ts

### Module Initialization

This module sets up a cron job that triggers gas estimation tasks if the environment supports it.

Code:

typescript

Copy code

`module.exports = function () {
  if (
    (global as any).starterEnvironment
      .isCronEnvironmentSupportedForGetGasEstimation === "yes"
  ) {
    start();
  }
};`

### `start()`

This asynchronous function initializes a cron job that runs every minute at the 50-second mark. It logs the current UTC time and the trigger event for gas estimation. It catches and logs any errors that occur during the setup.

Code:

typescript

Copy code

`async function start() {
try {
let task = cron.schedule("50 \* \* \* \* \*", async () => {
console.log(moment().utc(), ":::");
console.log("getGastEstimation cron triggered:::");
triggerJobs();
});

    task.start();

} catch (e) {
console.log(e);
}
}`

### `triggerJobs()`

This asynchronous function iterates through configured networks and triggers gas estimation for each allowed network that is not an EVM (Ethereum Virtual Machine).

Code:

typescript

Copy code

`async function triggerJobs() {
  let networks = (global as any).networks;
  if (networks && networks.length > 0) {
    for (let i = 0; i < networks.length; i++) {
      let network = networks[i];
      if (
        network &&
        network.isAllowedDynamicGasValues == true &&
        network.isNonEVM == false
      ) {
        getGasEstimation(network);
      }
    }
  }
}`

### `getGasEstimation(network: any)`

Fetches gas estimations for a given network by calling a helper function with the network's short name and an API key. It then updates the gas values in the database based on the retrieved estimations.

Code:

typescript

Copy code

`async function getGasEstimation(network: any) {
  let apiKey = getApiKey(network.chainId);
  let gasEstimation = await (
    global as any
  ).gasEstimationAxiosHelper.getGasEstimationByNetworkName(
    network?.networkShortName?.toLowerCase(),
    apiKey
  );
  await updateGas(network, gasEstimation);
}`

### `updateGas(network: any, gasEstimation: any)`

Updates gas parameters in the database for a given network using the values obtained from the `getGasEstimation` function.

Code:

typescript

Copy code

`async function updateGas(network: any, gasEstimation: any) {
let speed: any = getSpeed(gasEstimation);
let body: any = {};
if (network && speed) {
if (network.chainId == 56) {
body = {
dynamicValues: {
maxFeePerGas: speed?.gasPrice ? valueFixed(speed?.gasPrice, 2) : 0,
maxPriorityFeePerGas: speed?.gasPrice
? valueFixed(speed?.gasPrice, 2)
: 0,
},
};
} else {
body = {
dynamicValues: {
maxFeePerGas: speed?.maxFeePerGas
? valueFixed(speed?.maxFeePerGas, 2)
: 0,
maxPriorityFeePerGas: speed?.maxPriorityFeePerGas
? valueFixed(speed?.maxPriorityFeePerGas, 2)
: 0,
},
};
}

    await db.GasFees.findOneAndUpdate({ chainId: network.chainId }, body, {
      new: true,
    });

}
}`

### Utility Functions

`getSpeed(gasEstimation: any)` and `getHighAcceptanceValue(speeds: any)` are utility functions to extract the most relevant gas speed values based on acceptance rates.

`getApiKey(chainId: String)` fetches API keys for different networks based on the chain ID.

`valueFixed(x: any, d: any)` is a utility function that formats numbers to a fixed decimal point, trimming unnecessary zeros.

These documentations cover the purposes and operations of each function in detail. Each function plays a specific role in managing and automating the process of gas fee estimation for blockchain networks.

# removeRandomKeyJob.ts

### Module Exports Function

This unnamed function is exported by the module and serves as an initializer for the cron job, contingent upon certain environment settings.

typescript

Copy code

`module.exports = function () {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForDeleteRandomKey === "yes") {
    start();
  }
};`

Details:

- Global Check: It checks if the environment supports cron jobs specifically for deleting random keys through the `isCronEnvironmentSupportedForDeleteRandomKey` flag.
- Job Initialization: If the condition is met, it calls the `start()` function to initiate the job.

### `start` Function

This function sets up and starts the cron job using the `node-cron` library.

typescript

Copy code

`async function start() {
try {
let task = cron.schedule("10 50 23 \* \* \*", async () => {
triggerJobs();
});

    task.start();

} catch (e) {
console.log(e);
}
}`

Details:

- Scheduling: Schedules a task to run at 23:50:10 every day.
- Task Execution: The scheduled task executes the `triggerJobs()` function.
- Error Handling: Captures and logs any errors that occur during the scheduling or execution of the task.

### `triggerJobs` Function

This function executes the primary logic for removing entries from the `RandomKeys` collection in the database.

typescript

Copy code

`async function triggerJobs() {
  let deleteDate = moment().utc().subtract(1, "days").endOf("day").format();
  let status = await db.RandomKeys.remove({ createdAt: { $lte: deleteDate } });
  console.log("Removed RandomKeys", status.deletedCount);
}`

Details:

- Date Calculation: Calculates the cutoff date for deleting keys, which is set to the end of the day, one day prior to the current UTC date.
- Database Deletion: Performs the deletion of keys from the `RandomKeys` collection where the `createdAt` date is less than or equal to the calculated `deleteDate`.
- Logging: Logs the number of deleted records to the console.

This setup ensures that specific entries are automatically cleaned up from the database, reducing clutter or managing data retention effectively.
