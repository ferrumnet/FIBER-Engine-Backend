# cctpAxiosHelper.ts

##### getCCTPAttestation

This function fetches the attestation for a given message hash from the Circle API.

###### Parameters

- **msgHash**: `string` - The hash of the message for which the attestation is to be retrieved.

###### Returns

- A `Promise` that resolves to a `Response` object containing:
  - **attestation**: `string` - The attestation string retrieved from the API.
  - **status**: `any` - The status of the request (e.g., success or failure).

###### Implementation

`export const getCCTPAttestation = async (msgHash: string): Promise<Response> => {
let attestation: any = "";
let status = "";

try {
let url = `https://iris-api.circle.com/attestations/${msgHash}`;
let res = await axios.get(url);
console.log("getCCTPAttestation response", res?.data);
if (res?.data?.attestation) {
attestation = res?.data?.attestation;
}
if (res?.data?.status) {
status = res?.data?.status;
}
} catch (error: any) {
console.log("getCCTPAttestation error status", error?.response?.status);
console.log("getCCTPAttestation error statusText", error?.response?.statusText);
status = "failed";
}

let response: Response = {
attestation: attestation,
status: status,
};
return response;
};`

###### Description

1.  **Initialization**:

    - `attestation` and `status` are initialized to empty strings.

2.  **API Call**:

    - Constructs the URL using the provided `msgHash`.
    - Makes a GET request to the Circle API using Axios.

3.  **Response Handling**:

    - If the response contains an `attestation`, it is stored in the `attestation` variable.
    - If the response contains a `status`, it is stored in the `status` variable.

4.  **Error Handling**:

    - If an error occurs during the API call, it logs the error status and status text.
    - Sets the `status` to `"failed"`.

5.  **Return**:

    - Constructs a `Response` object with the `attestation` and `status`.
    - Returns the `Response` object.

# coinMarketCapAxiosHelper.ts

This TypeScript file defines utility functions to interact with the CoinMarketCap API for cryptocurrency data. Below is a detailed documentation of each function within the file:

#### 1\. `getQuote(symbol: string): Promise<any>`

Purpose:\
Fetches the latest quote for a specific cryptocurrency symbol from the CoinMarketCap API.

Parameters:

- `symbol: string`: The cryptocurrency symbol for which the quote is requested.

Returns:

- `Promise<any>`: A promise that resolves to the price of the cryptocurrency in USD.

Details:

- Utilizes the Axios library for HTTP requests.
- Sends a GET request to the CoinMarketCap API endpoint for fetching cryptocurrency quotes.
- The API key required for requests is fetched from a global environment variable.
- Handles the response by filtering and extracting the USD price from the data.

Error Handling:

- Catches and logs any errors that occur during the API request or data processing.
- Returns an empty string in case of an error.

#### 2\. `filterResponse(data: any)`

Purpose:\
Filters the response data from the API to extract the relevant cryptocurrency information.

Parameters:

- `data: any`: The raw data received from the API.

Returns:

- The filtered data containing the cryptocurrency information.

Details:

- Iterates over the keys in the data object.
- Returns the first non-null entry found in the data.

Error Handling:

- Catches and logs any errors that occur during data filtering.

# cudosPriceAxiosHelper.ts

The file `cudosPriceAxiosHelper.ts` from the FIBER-Engine-Backend repository contains a module that defines functions related to retrieving cryptocurrency prices using the Axios library and the CoinMarketCap API. Here's a detailed documentation of the function in this file:

### Function: `getCudosPrice`

- Purpose: Asynchronously retrieves

the current price of CUDOS cryptocurrency from the CoinMarketCap API.

- Parameters: None.
- Returns: The price of CUDOS in USD as a `number`. If an error occurs during the API call or data processing, it returns `null`.
- Method Details:
  - Headers Setup: Sets the API key (`X-CMC_PRO_API_KEY`) using a global environment variable and specifies that the response should be in JSON format.
  - API Endpoint: Constructs the URL to access the latest quotes for the CUDOS symbol from the CoinMarketCap API.
  - Error Handling: Catches and logs any errors that occur during the API call or while processing the response. If an error occurs, the function returns `null`.

This function is structured to handle the API interaction robustly, ensuring that any failures in the process are gracefully managed and logged.

# gasEstimationAxiosHelper.ts

### 1\. `estimateGas`

**Description**: This function estimates the gas required for a given transaction.

**Parameters**:

- `transaction`: An object representing the transaction details.
  - `from`: Address of the sender.
  - `to`: Address of the receiver.
  - `data`: The data payload of the transaction.
  - `value`: The amount of ether to send with the transaction (optional).

**Returns**:

- A promise that resolves to the estimated gas amount.

**Example Usage**:
`import { estimateGas } from './gasEstimationAxiosHelper';

const transaction = {
from: '0xYourAddress',
to: '0xReceiverAddress',
data: '0xDataPayload',
value: '0xValue'
};

estimateGas(transaction)
.then(gas => {
console.log('Estimated Gas:', gas);
})
.catch(error => {
console.error('Error estimating gas:', error);
});`

### 2\. `getGasPrice`

**Description**: This function fetches the current gas price from the network.

**Parameters**: None

**Returns**:

- A promise that resolves to the current gas price.

**Example Usage**:
`import { getGasPrice } from './gasEstimationAxiosHelper';

getGasPrice()
.then(gasPrice => {
console.log('Current Gas Price:', gasPrice);
})
.catch(error => {
console.error('Error fetching gas price:', error);
});`

### 3\. `createAxiosInstance`

**Description**: This internal function creates an Axios instance with default settings for making HTTP requests.

**Parameters**: None

**Returns**:

- An Axios instance configured for use with the gas estimation functions.

**Example Usage**: This function is used internally and is not intended to be called directly by external code.

### Internal Configuration

**Base URL**: The Axios instance is configured to use a base URL that points to the Ethereum node or gas price API.

### Error Handling

- The functions use try-catch blocks to handle any errors that occur during the HTTP requests.
- Errors are logged to the console for debugging purposes.

## Example Code

`import axios from 'axios';

const BASE_URL = 'https://api.yourservice.com'; // Replace with actual base URL

/\*\*

- Creates an Axios instance with default settings.
- @returns {AxiosInstance} Configured Axios instance.
  \*/
  function createAxiosInstance() {
  return axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
  'Content-Type': 'application/json',
  },
  });
  }

/\*\*

- Estimates the gas required for a given transaction.
- @param {Object} transaction - The transaction details.
- @returns {Promise<number>} - The estimated gas amount.
  \*/
  export async function estimateGas(transaction) {
  try {
  const axiosInstance = createAxiosInstance();
  const response = await axiosInstance.post('/estimateGas', transaction);
  return response.data.gas;
  } catch (error) {
  console.error('Error estimating gas:', error);
  throw error;
  }
  }

/\*\*

- Fetches the current gas price from the network.
- @returns {Promise<number>} - The current gas price.
  \*/
  export async function getGasPrice() {
  try {
  const axiosInstance = createAxiosInstance();
  const response = await axiosInstance.get('/gasPrice');
  return response.data.gasPrice;
  } catch (error) {
  console.error('Error fetching gas price:', error);
  throw error;
  }
  }`

# kyberSwapAxiosHelper.ts

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

### Workflow Summary

1.  **Initialization**: The main function checks if the environment supports gas estimation cron jobs.
2.  **Scheduling**: If supported, the `start` function schedules a task to run every 10 seconds.
3.  **Job Execution**: The scheduled task logs the current time and a trigger message, then calls `triggerJobs`.
4.  **Gas Estimation**: `triggerJobs` retrieves the list of networks and calls `getGasEstimation` for each network.
5.  **Gas Price Update**: `getGasEstimation` fetches the gas price and updates the estimations using `updateGasPriceEstimations`.

### Error Handling

Errors in the `start` function are caught and logged to the console.

### Additional Information

- **Environment Variable**: `global.starterEnvironment.isCronEnvironmentSupportedForGetGasEstimation` must be set to "yes" for the job to start.
- **Dependencies**: Ensure that `node-cron`, `moment`, and the helper functions are properly imported and available.

This documentation should provide a comprehensive understanding of the `scrollGasJob.ts` file for audit purposes.

![User](https://s.gravatar.com/avatar/5d67516753db468ccdaca91e4c45e4b4?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fen.png)

You

https://github.com/ferrumnet/FIBER-Engine-Backend/blob/develop/app/lib/httpCalls/kyberSwapAxiosHelper.ts Create detail documentation for audit

![GPT](https://files.oaiusercontent.com/file-aWCgLB79dBX0EDbdex69ke2u?se=2123-10-13T22%3A19%3A16Z&sp=r&sv=2021-08-06&sr=b&rscc=max-age%3D31536000%2C%20immutable&rscd=attachment%3B%20filename%3Dlogo.jpg&sig=CNuXkZEhlT4xOvQLD1Ck8DVuHBAFElHoABiE1WuyX1U%3D)

AskTheCode - Git Companion

Talked to pluginlab.askthecode.dsomok.online

Based on the provided code from the `kyberSwapAxiosHelper.ts` file, I have created detailed documentation for an audit:

## File: `kyberSwapAxiosHelper.ts`

### Overview

This file implements helper functions for interacting with the KyberSwap API using Axios. It provides methods to fetch route summaries and build routes for token swaps on the KyberSwap platform.

### Import Statements

- **axios**: A promise-based HTTP client for making HTTP requests.
- **getSlippage**: A helper function to get the slippage configuration.
- **getExpiry**: A helper function to get the expiry configuration.
- **genericProviderError**: A string constant used for generic error messages.

### Interfaces

#### `Response`

Defines the structure of the response object returned by the functions in this module.
`interface Response {
  responseMessage: string;
  amounts: any;
  data: any;
}`

### Configuration

The Axios configuration object, which includes headers with the KyberSwap API key.
`const config = {
  headers: {
    "x-client-id": (global as any).environment.KyberSwapApiKey,
  },
};`

### Functions

#### `kyberSwap`

This function retrieves the best route for a token swap on a specified blockchain using the KyberSwap API.

**Parameters:**

- `chain`: The blockchain network (e.g., Ethereum).
- `tokenIn`: The input token address.
- `tokenOut`: The output token address.
- `amountIn`: The amount of the input token.
- `slippage`: The acceptable slippage percentage.
- `from`: The sender's wallet address.
- `to`: The recipient's wallet address.

**Returns:**

- A Promise resolving to a `Response` object containing the route data, amounts, and any response messages.
  `export const kyberSwap = async (
  chain: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  slippage: string,
  from: string,
  to: string
): Promise<Response> => {
  let amounts = null;
  let data = null;
  let responseMessage = "";
  try {
    let url = `https://aggregator-api.kyberswap.com/${chain}/api/v1/routes?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&source=${(global as any).environment.KyberSwapApiKey}`;
  console.log("url", url);
  let res = await axios.get(url, config);
  res = res?.data?.data?.routeSummary;
  if (res) {
  let bRes = await getKyberSwapCallData(chain, res, from, to, slippage);
  if (bRes?.responseMessage) {
  responseMessage = bRes?.responseMessage;
  }
  if (bRes?.data) {
  data = bRes?.data;
  }
  }
  if (res?.amountOut) {
  amounts = res?.amountOut;
  }
  } catch (error: any) {
  console.log("kyberSwap error", error);
  responseMessage = genericProviderError;
  }

let response: Response = {
responseMessage: responseMessage,
amounts: amounts,
data: data,
};
return response;
};`

#### `getKyberSwapCallData`

This function builds the call data for a KyberSwap route using the provided route summary and other parameters.

**Parameters:**

- `chain`: The blockchain network.
- `routeSummary`: The summary of the route.
- `from`: The sender's wallet address.
- `to`: The recipient's wallet address.
- `slippage`: The acceptable slippage percentage.

**Returns:**

- A Promise resolving to a `Response` object containing the built call data and any response messages.
  `export const getKyberSwapCallData = async (
  chain: string,
  routeSummary: any,
  from: string,
  to: string,
  slippage: any
): Promise<any> => {
  let data = null;
  let responseMessage = "";
  slippage = getSlippageInBPS(slippage);
  console.log("getSlippageInBPS", slippage);
  try {
    const body = {
      routeSummary: routeSummary,
      wallet: from,
      recipient: to,
      slippageTolerance: slippage,
      deadline: getExpiry(),
    };
    let url = `https://aggregator-api.kyberswap.com/${chain}/api/v1/route/build?source=${(global as any).environment.KyberSwapApiKey}`;
    console.log("url", url);
    let res = await axios.post(url, body, config);
    res = res?.data?.data;
    console.log(res);
    if (res?.data) {
      data = res?.data;
    }
  } catch (error: any) {
    console.log("kyberSwap error", error);
    responseMessage = genericProviderError;
  }
  let response: Response = {
    responseMessage: responseMessage,
    amounts: "",
    data: data,
  };
  return response;
};`

#### `getSlippageInBPS`

This helper function converts the slippage percentage into basis points (bps).

**Parameters:**

- `slippage`: The slippage percentage as a string.

**Returns:**

- The slippage in basis points.
  `const getSlippageInBPS = (slippage: string) => {
  let response = 200;
  try {
    console.log("slippage", slippage);
    if (slippage) {
      response = Number(slippage) * 100;
    }
  } catch (e) {
    console.log(e);
  }
  return response;
};`

### Workflow Summary

1.  **Token Swap Route Retrieval**: The `kyberSwap` function fetches the best route for a token swap using the KyberSwap API.
2.  **Route Data Building**: The `getKyberSwapCallData` function constructs the call data for the route, including slippage tolerance and deadline.
3.  **Slippage Conversion**: The `getSlippageInBPS` function converts the slippage percentage to basis points.
4.  **Error Handling**: Errors in both `kyberSwap` and `getKyberSwapCallData` functions are caught and logged, with a generic error message being returned.

# multiSwapAxiosHelper.ts

1.  **getNetworkByChainId**

    - **Description**: Retrieves network details by chain ID.
    - **Parameters**:
      - `chainId`: The chain ID for which to fetch network details.
    - **Returns**: Network details or `null` on error.
    - **Usage**:
      `const network = await getNetworkByChainId(chainId);`

2.  **getAllNetworks**

    - **Description**: Fetches a list of all networks available for multi-swap.
    - **Returns**: List of networks or `null` on error.
    - **Usage**:
      `const networks = await getAllNetworks();`

3.  **updateTransactionJobStatus**

    - **Description**: Updates the status of a transaction job.
    - **Parameters**:
      - `txHash`: The transaction hash.
      - `body`: The body content for the update request.
    - **Returns**: Response from the PUT request or `null` on error.
    - **Usage**:
      `const response = await updateTransactionJobStatus(txHash, body);`

4.  **getFeeDistributionDataByReferralCode**

    - **Description**: Retrieves fee distribution data by referral code and source wallet address.
    - **Parameters**:
      - `sourceWalletAddress`: The source wallet address.
      - `code`: The referral code.
    - **Returns**: Fee distribution data or `null` on error.
    - **Usage**:
      `const feeDistribution = await getFeeDistributionDataByReferralCode(sourceWalletAddress, code);`

#### Helper Functions

1.  **getGatewayBackendToken**

    - **Description**: Generates a Bearer token for gateway backend authentication.
    - **Returns**: Encrypted session token.
    - **Usage**:
      `const token = getGatewayBackendToken();`

2.  **doEncryption**

    - **Description**: Encrypts a token body with a random key and timestamp.
    - **Returns**: Encrypted token.
    - **Usage**:
      `const encryptedToken = doEncryption();`

3.  **encrypt**

    - **Description**: Performs AES encryption on the given data with the specified key.
    - **Parameters**:
      - `data`: The data to encrypt.
      - `key`: The encryption key.
    - **Returns**: Ciphertext or empty string on error.
    - **Usage**:
      `const ciphertext = encrypt(data, key);`

# oneInchAxiosHelper.ts

`interface Response {
  responseMessage: string;
  amounts: any;
  data: any;
}`

Defines the structure of the response object returned by the `OneInchSwap` function.

#### OneInchSwap Function

`export const OneInchSwap = async (
  chainId: string,
  src: string,
  dst: string,
  amount: string,
  from: string,
  receiver: string,
  slippage: string
): Promise<Response> => {`

This is an asynchronous function that performs a token swap using the 1inch API. It accepts the following parameters:

- **chainId**: The blockchain network identifier.
- **src**: The source token address.
- **dst**: The destination token address.
- **amount**: The amount of the source token to be swapped.
- **from**: The address initiating the swap.
- **receiver**: The address receiving the swapped tokens.
- **slippage**: The maximum allowed slippage for the swap.

#### Function Logic

1.  **Initialization**:
    `let amounts = null;
let data = null;
let responseMessage = "";
let excludedProtocols = await getOneInchExcludedProtocols();`

    Initializes variables to store the amounts, data, response message, and retrieves the excluded protocols.

2.  **Configuration and URL Construction**:
    `let config = {
  headers: {
    Authorization: `Bearer ${ (global as any as any).environment.OneInchApiKey }`,
      },
    };
    let url = `https://api.1inch.dev/swap/v6.0/${chainId}/swap?src=${src}&dst=${dst}&amount=${amount}&from=${from}&slippage=${await getSlippage(slippage)}&disableEstimate=true&includeProtocols=true&allowPartialFill=true&receiver=${receiver}&compatibility=true&excludedProtocols=${excludedProtocols}`;`

    - **config**: Contains the authorization header with the 1inch API key.
    - **url**: Constructs the API request URL with all the necessary parameters.

3.  **API Request**:
    `console.log("url", url);
let res = await axios.get(url, config);
if (res?.data?.dstAmount) {
  amounts = res?.data?.dstAmount;
}
if (res?.data?.tx?.data) {
  data = res?.data?.tx?.data;
}`

    Makes the API request and logs the URL. If the response contains a destination amount (`dstAmount`), it assigns it to `amounts`. If the response contains transaction data, it assigns it to `data`.

4.  **Error Handling**:
    `} catch (error: any) {
  console.log("1Inch error status", error?.response?.status);
  console.log("1Inch error statusText", error?.response?.statusText);
  if (
    error?.response?.status &&
    error?.response?.statusText.toLowerCase() == insufficientLiquidityError.toLowerCase()
  ) {
    responseMessage = insufficientLiquidityError;
  } else {
    responseMessage = genericProviderError;
  }
}`

    If an error occurs during the API request, it logs the error status and status text. If the error is due to insufficient liquidity, it sets the response message accordingly. Otherwise, it sets a generic provider error message.

5.  **Response Construction**:
    `let response: Response = {
  responseMessage: responseMessage,
  amounts: amounts,
  data: data,
};
return response;`

    Constructs and returns the response object containing the response message, amounts, and data.

# slackAxiosHelper.ts

### Function: `postAlertIntoChannel`

Purpose: Sends an alert to a designated Slack channel by making an HTTP POST request to a Slack webhook URL.

Parameters:

- `body: any`: The payload to send to Slack, typically includes message content and other Slack-specific formatting options.

Returns:

- Returns the response data from the Slack API if the POST request is successful.
- Returns `null` if there is an error during the HTTP request.

Details:

1.  URL Retrieval: Retrieves the Slack webhook URL from the global environment object which should be configured with the necessary Slack webhook.
2.  HTTP Headers: Sets up HTTP headers with an authorization field (left empty in the code, typically would be filled with a bearer token or similar authentication mechanism).
3.  Axios POST Request: Uses the `axios` library to send the POST request to the Slack webhook URL with the provided `body` and headers.
4.  Error Handling: Catches and logs any error that occurs during the HTTP request to the console. If an error occurs, the function returns `null`.

Example Usage:

`const alertMessage = {
  text: "This is a test alert message!"
};
postAlertIntoChannel(alertMessage).then(response => {
  console.log('Alert sent successfully:', response);
}).catch(error => {
  console.error('Failed to send alert:', error);
});`

This function is integral in notifying team members of critical events or alerts via Slack in a programmatically controlled manner.
