# cctpAxiosHelper.ts

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

# kyberSwapAxiosHelper.ts

# multiSwapAxiosHelper.ts

# oneInchAxiosHelper.ts

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
