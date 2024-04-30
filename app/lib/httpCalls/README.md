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

### Function: `getGasEstimationByNetworkName`

- Purpose: This function fetches the current gas estimation for transactions on a specific blockchain network by utilizing an external API.

- Parameters:

  - `name`: Any type (expected to be a string). This parameter represents the name of the network for which gas estimation is requested.
  - `apiKey`: String. This is the API key required to authenticate requests to the external API.

- Implementation Details:

  - The function constructs a URL using the network name and API key to request gas estimation data from the OwlRacle API (`https://api.owlracle.info`).
  - It makes an HTTP GET request using axios to this URL.
  - On successful retrieval of data, the response's `data` field is returned.
  - If the HTTP request fails due to any error, it logs the error to the console and returns `null`.

- Return Value:

  - Returns the gas estimation data as an object if the request is successful.
  - Returns `null` if there is an error during the HTTP request.

- Error Handling:

  - The function includes a try-catch block to handle any errors that occur during the HTTP request. Errors are logged to the console.

This function is particularly useful for applications that need real-time gas cost information for executing transactions efficiently on blockchain networks.

# networksAxiosHelper.ts

### 1\. `getNetworkByChainId(chainId: any)`

This asynchronous function retrieves network data based on a given chain ID. It constructs a URL using the base URL stored in the global environment (`baseUrlGatewayBackend`) and appends the chain ID to form the complete endpoint. An Axios GET request is then made to this URL. If the request is successful, it returns the network data found in the response's body. If an error occurs during the request, it logs the error and returns `null`.

Code:

typescript

Copy code

`async getNetworkByChainId(chainId: any) {
    try {
        let baseUrl = (global as any).environment.baseUrlGatewayBackend;
        let url = `${baseUrl}/networks/${chainId}`;
        let res = await axios.get(url);
        return res.data.body.network;
    } catch (error) {
        console.log(error);
        return null;
    }
}`

### 2\. `getAllNetworks()`

This asynchronous function fetches a list of all networks. It similarly constructs a URL using the base URL from the global environment. However, this URL includes several query parameters such as `isNonEVM`, `isAllowedOnMultiSwap`, `allowFIBERData`, and `isPagination` to filter and control the returned data. It makes an Axios GET request to this constructed URL and if successful, converts the retrieved networks into FIBER networks using a function specified in the global environment, then logs and returns them. If an error occurs, it logs the error and returns `null`.

Code:

typescript

Copy code

`async getAllNetworks() {
    try {
        let baseUrl = (global as any).environment.baseUrlGatewayBackend;
        if ((global as any).utils.IS_LOCAL_ENV) {
            baseUrl = "http://localhost:8080/api/v1";
        }
        let url = `${baseUrl}/networks/list?isNonEVM=&isAllowedOnMultiSwap=true&allowFIBERData=${(global as any).environment.apiKeyForGateway}&isPagination=false`;
        let res = await axios.get(url);
        if (res.data.body && res.data.body.networks && res.data.body.networks.length) {
            (global as any).networks = await (global as any).commonFunctions.convertIntoFIBERNetworks(res.data.body.networks);
            console.log("Refresh networks", (global as any).networks.length);
        }
        return res.data.body.networks;
    } catch (error) {
        console.log(error);
        return null;
    }
}`

These functions are integral for interfacing with the backend API, providing necessary network data for other parts of the FIBER Engine Backend system.

# oneInchAxiosHelper.ts

### `OneInchSwap` Function

Purpose:\
Performs a cryptocurrency swap using the 1inch API. It constructs a request to the 1inch API to perform a swap between two specified tokens and handles the response.

Parameters:

- `chainId` (string): The blockchain chain ID where the transaction will occur.
- `src` (string): The source token's contract address.
- `dst` (string): The destination token's contract address.
- `amount` (string): The amount of the source token to swap.
- `from` (string): The address of the wallet initiating the swap.
- `receiver` (string): The address where the destination tokens should be sent.
- `slippage` (string): The maximum permissible slippage for the swap.

Returns:\
A `Promise` resolving to a `Response` object with the following properties:

- `responseMessage` (string): A message describing the outcome of the API call.
- `amounts` (any): The amount received from the swap (if successful).
- `data` (any): The transaction data required to execute the swap.

Methodology:

1.  Constructs a configuration object containing the API key for authorization.
2.  Builds the API URL using the provided parameters and slippage value (calculated via the `getSlippage` function).
3.  Sends a GET request to the constructed URL.
4.  On successful response from the API, extracts and assigns the `toAmount` from the response data to `amounts`.
5.  Extracts and assigns the transaction data from the response to `data`.
6.  Handles any errors by logging them and setting the `responseMessage` to a generic error message obtained from the `genericOneInchError` function.

Usage Example:

typescript

Copy code

`const swapResponse = await OneInchSwap(
  '1', // Ethereum Mainnet Chain ID
  '0x000...', // Source token contract address
  '0x111...', // Destination token contract address
  '1000000000000000000', // Amount in Wei
  '0x222...', // From address
  '0x333...', // Receiver address
  '1' // Slippage percentage
);
console.log(swapResponse);`

This function leverages axios for HTTP requests and requires proper error handling to manage different types of failures effectively, including API key issues or network errors.

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

typescript

Copy code

`const alertMessage = {
  text: "This is a test alert message!"
};
postAlertIntoChannel(alertMessage).then(response => {
  console.log('Alert sent successfully:', response);
}).catch(error => {
  console.error('Failed to send alert:', error);
});`

This function is integral in notifying team members of critical events or alerts via Slack in a programmatically controlled manner.

# transactionUpdateAxiosHelper.ts

### Function: `updateTransactionJobStatus`

- Purpose: Updates the status of a blockchain transaction.
- Parameters:
  - `txHash` (string): The hash of the transaction to be updated.
  - `body` (any): The new status details to be applied to the transaction.
- Process:
  - Initializes headers with an authorization token obtained from `getGatewayBackendToken()`.
  - Determines the base URL based on whether the local environment is active.
  - Constructs a URL for the transaction update endpoint.
  - Sends a PUT request to the constructed URL with the provided body and headers.
  - Returns the response from the server or `null` if an exception occurs.
- Error Handling: Logs any errors that occur during the process.

### Function: `getGatewayBackendToken`

- Purpose: Generates a bearer token for authenticating requests to the gateway backend.
- Returns: A string formatted as a bearer token containing encrypted session information.

### Function: `doEncryption`

- Purpose: Creates encrypted session data for token generation.
- Process:
  - Generates a time window around the current time (1 minute before and after).
  - Creates a random key for encryption.
  - Compiles session data including start and end times and the random key.
  - Encrypts the session data string using an API key from the environment variables.
  - Returns the encrypted token.
- Error Handling: Logs any errors and returns an empty string if encryption fails.

### Function: `encrypt`

- Purpose: Encrypts data using AES encryption provided by the CryptoJS library.
- Parameters:
  - `data` (string): The plaintext data to encrypt.
  - `key` (string): The encryption key (presumably the API key).
- Returns: The encrypted text or an empty string if encryption fails.
- Error Handling: Logs any exceptions encountered during encryption.

This module effectively handles tasks related to secure communication with a backend service, emphasizing the importance of secure data handling practices in web-based applications.
