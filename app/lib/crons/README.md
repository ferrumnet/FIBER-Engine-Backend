# getAllNetworkJob.ts

### Module Exports Function

This unnamed function is exported by the module and checks if the environment supports running the cron job for getting all networks. If supported, it calls the `start` function to initialize the cron job.

Code:

`module.exports = function () {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForGetAllNetwork === 'yes') {
    start();
  }
}`

### `start` Function

The `start` function schedules and starts a cron job that runs every 5 minutes. Within the job, it logs the current UTC time and a message indicating the cron job has been triggered, and then calls the `triggerJobs` function.

Code:

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

`async function triggerJobs() {
  await (global as any).networksAxiosHelper.getAllNetworks();
}`

Each function is designed to work within a cron job environment and collectively ensures that network data is fetched periodically as per the scheduled interval.

# removeRandomKeyJob.ts

### Module Exports Function

This unnamed function is exported by the module and serves as an initializer for the cron job, contingent upon certain environment settings.

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

# infuraGasJob.ts

1.  **start**
    `async function start() {
    try {
    let task = cron.schedule("40 \* \* \* \* \*", async () => {
    console.log(moment().utc(), "::: infuraGasJob cron triggered :::");
    triggerJobs();
    });

        task.start();

    } catch (e) {
    console.log(e);
    }
    }`

    - Schedules a cron job to run every 40 seconds.
    - When triggered, it logs the event and calls `triggerJobs`.

2.  **triggerJobs**
    `async function triggerJobs() {

    let networks = await getGasNetworks(INFURA_PROVIDER_TAG);
    if (networks && networks.length > 0) {
    for (let i = 0; i < networks.length; i++) {
    let network = networks[i];
    getGasEstimation(network);
    }
    }
    }`

        - Retrieves a list of gas networks.
        - For each network, it calls `getGasEstimation`.

3.  **getGasEstimation**
    `async function getGasEstimation(network: any) {

    let data = await getInfuraGas(network?.chainId);
    data = data?.high;
    if (data) {
    let maxFeePerGas = data?.suggestedMaxFeePerGas;
    let maxPriorityFeePerGas = data?.suggestedMaxPriorityFeePerGas;
    let gasPriceForBsc = data?.gasPrice;
    await updateGasPriceEstimations(network, maxFeePerGas, maxPriorityFeePerGas, gasPriceForBsc);
    }
    }`

        - Fetches gas estimation data from Infura for a given network.
        - Extracts relevant data and updates the gas price estimations using the `updateGasPriceEstimations` function.

# owlracleGasJob.ts

1.  **Module Exports**

        typescript

        Copy code

        `module.exports = function () {

    if ((global as any).starterEnvironment.isCronEnvironmentSupportedForGetGasEstimation === "yes") {
    start();
    }
    };`

        - This module exports a function that checks if the cron environment is supported for gas estimation. If supported, it initiates the `start` function.

2.  **start()**

    typescript

    Copy code

    `async function start() {
    try {
    let task = cron.schedule("50 \* \* \* \* \*", async () => {
    console.log(moment().utc(), ":::");
    console.log("owlracleGasJob cron triggered:::");
    triggerJobs();
    });

        task.start();

    } catch (e) {
    console.log(e);
    }
    }`

    - Schedules a cron job to run every 50 seconds.
    - Logs the current UTC time and a trigger message when the cron job runs.
    - Calls `triggerJobs` to initiate the gas estimation process.

3.  **triggerJobs()**

        typescript

        Copy code

        `async function triggerJobs() {

    let networks = await getGasNetworks(OWLRACLE_PROVIDER_TAG);
    if (networks && networks.length > 0) {
    for (let i = 0; i < networks.length; i++) {
    let network = networks[i];
    getGasEstimation(network);
    }
    }
    }`

        - Fetches a list of networks supported by Owlracle.
        - Iterates over the networks and calls `getGasEstimation` for each network.

4.  **getGasEstimation(network)**

        typescript

        Copy code

        `async function getGasEstimation(network: any) {

    let apiKey = getApiKey(network.chainId);
    let data: any = await getOwlracleGas(network?.shortName?.toLowerCase(), apiKey);
    data = getSpeed(data);
    if (data) {
    let maxFeePerGas = data?.maxFeePerGas;
    let maxPriorityFeePerGas = data?.maxPriorityFeePerGas;
    let gasPriceForBsc = data?.gasPrice;
    await updateGasPriceEstimations(network, maxFeePerGas, maxPriorityFeePerGas, gasPriceForBsc);
    }
    }`

        - Retrieves the API key for the given network.
        - Fetches gas estimation data from the Owlracle API.
        - Extracts speed data from the response.
        - Updates gas price estimations in the system with the retrieved data.

5.  **getSpeed(gasEstimation)**

        typescript

        Copy code

        `function getSpeed(gasEstimation: any) {

    if (gasEstimation && gasEstimation.speeds && gasEstimation.speeds.length > 0) {
    let speed = getHighAcceptanceValue(gasEstimation.speeds);
    return speed ? speed : null;
    }
    return null;
    }`

        - Extracts the most relevant speed data from the gas estimation response.

6.  **getHighAcceptanceValue(speeds)**

        typescript

        Copy code

        `function getHighAcceptanceValue(speeds: any) {

    let value = null;
    const max = Math.max(...speeds.map((item: any) => item.acceptance), 0);
    for (let i = 0; i < speeds.length; i++) {
    let item = speeds[i];
    if ((item.acceptance = max)) {
    value = item;
    }
    }
    return value;
    }`

        - Identifies and returns the speed with the highest acceptance value.

7.  **getApiKey(chainId)**

        typescript

        Copy code

        `function getApiKey(chainId: String) {

    let apiKey = null;
    if (chainId) {
    let apiKeys = (global as any).environment.gasOwlracleApiKeys;
    if (apiKeys) {
    let apiKeysJson = JSON.parse(apiKeys);
    if (apiKeysJson && apiKeysJson.length > 0) {
    for (let i = 0; i < apiKeysJson.length; i++) {
    let item = apiKeysJson[i];
    if ((item.chainId = chainId)) {
    return item.apiKey;
    }
    }
    }
    }
    }
    return apiKey;
    }`

        - Retrieves the API key for a given chain ID from the environment configuration.

# scrollGasJob.ts

#### `start`

The `start` function schedules a task to run every 10 seconds. It logs the current time and a message indicating the job was triggered, and then calls `triggerJobs`.

`async function start() {
try {
let task = cron.schedule("_/10 _ \* \* \* \*", async () => {
console.log(moment().utc(), ":::");
console.log("scrollGasJob cron triggered:::");
triggerJobs();
});

    task.start();

} catch (e) {
console.log(e);
}
}`

#### `triggerJobs`

The `triggerJobs` function retrieves networks using the `getGasNetworks` function and, if networks are found, calls `getGasEstimation` for each network.

`async function triggerJobs() {
  let networks = await getGasNetworks(SCROLL_PROVIDER_TAG);
  if (networks && networks.length > 0) {
    for (let i = 0; i < networks.length; i++) {
      let network = networks[i];
      getGasEstimation(network);
    }
  }
}`

#### `getGasEstimation`

The `getGasEstimation` function gets the network's gas price and updates the gas price estimations using the `updateGasPriceEstimations` function.

`async function getGasEstimation(network: any) {
  const item = (global as any).commonFunctions.getNetworkByChainId(network.chainId).multiswapNetworkFIBERInformation;
  let gasPrice: any = await item.provider.getGasPrice();
  if (gasPrice) {
    await updateGasPriceEstimations(network, "", "", gasPrice);
  }
}`
