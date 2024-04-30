# gasFees.ts

This TypeScript file is part of the API controllers and handles routes associated with gas fee estimations on different blockchain networks. Below are the detailed descriptions of the functions defined in this file:

#### Function: `asyncMiddleware()`

- Description: Wrapper function that handles asynchronous operations within Express routes. It captures any exceptions thrown during the execution of the asynchronous code and forwards them to the Express error handling middleware.
- Parameters:
  - `req (any)`: The HTTP request object.
  - `res (any)`: The HTTP response object.
- Returns: Sends a HTTP 200 response with gas price data for both source and destination chains.

#### Route: `GET /estimation`

- Purpose: Fetches gas fee estimations for both the source and destination blockchain networks based on the request parameters.
- Process:
  1.  Validates the request parameters using `gasEstimationValidation`.
  2.  Retrieves destination gas prices using `destinationGasEstimation`.
  3.  Calculates source gas prices using `sourceGasEstimation` based on the destination gas prices.
  4.  Returns both source and destination gas prices in the response.

#### Route: `GET /:chainId`

- Purpose: Fetches gas fees for a specific blockchain identified by the `chainId` parameter in the request URL.
- Process:
  1.  Checks if the `chainId` parameter is provided and constructs a filter object.
  2.  Fetches the gas fee data from the database using the constructed filter.
  3.  Returns the fetched data in the HTTP response.

### Imported Modules:

- `gasEstimationValidation, destinationGasEstimation, sourceGasEstimation`: Functions imported from `../../../lib/middlewares/helpers/gasFeeHelpers/dynamicGasFeeEstimationHelper` which assist in calculating dynamic gas fees based on network conditions and input parameters.

The implementation of routes within this file heavily relies on asynchronous operations to fetch data, validating and processing it before sending a response back to the client.

# multiswap.ts

### 1\. API Endpoint: `/token/categorized/quote/info`

- Type: GET
- Description: This endpoint retrieves categorized token quote information based on various query parameters.
- Parameters:
  - `sourceWalletAddress`: The wallet address from which the tokens will be sourced.
  - `sourceTokenContractAddress`: The contract address of the source token.
  - `sourceNetworkChainId`: The blockchain network chain ID of the source token.
  - `sourceAmount`: The amount of the source token to be used.
  - `destinationTokenContractAddress`: The contract address of the destination token.
  - `destinationNetworkChainId`: The blockchain network chain ID of the destination token.
- Response: If any required parameters are missing, it returns an HTTP 401 error with a detailed message. If all parameters are provided and valid, it returns a 200 HTTP status with the token information obtained through the `multiSwapHelper.getTokenCategorizedInformation()` function.

### 2\. API Endpoint: `/swap/signed`

- Type: GET
- Description: Fetches signed swap transaction data.
- Parameters:
  - Includes all parameters from the `/token/categorized/quote/info` endpoint.
  - `sourceAssetType`: The asset type of the source token.
  - `destinationAssetType`: The asset type of the destination token.
  - `gasPrice`: The gas price to be used for the transaction.
- Response: Returns an HTTP 401 error with a detailed message if required parameters are missing. If all parameters are provided and valid, it returns a 200 HTTP status with the signed swap transaction data from the `multiSwapHelper.getSwapSigned()` function.

### 3\. API Endpoint: `/withdraw/signed/:txHash`

- Type: POST
- Description: Processes a signed withdrawal based on a provided transaction hash and other transaction parameters.
- Parameters:
  - `txHash`: Transaction hash as part of the URL path.
  - `sourceWalletAddress`: Wallet address from which the tokens will be withdrawn.
  - `sourceTokenContractAddress`: Contract address of the source token.
  - `sourceNetworkChainId`: Blockchain network chain ID of the source token.
  - `sourceAmount`: Amount of the source token to be withdrawn.
  - `destinationTokenContractAddress`: Contract address of the destination token.
  - `destinationNetworkChainId`: Blockchain network chain ID of the destination token.
  - `salt`: A salt for the transaction, enhancing security.
  - `hash`: Hash of the transaction.
  - `signatures`: Signatures required to authorize the transaction.
- Response: Returns an HTTP 401 error with a detailed message if required parameters or signatures are missing or empty. If all parameters are provided and valid, it returns a 200 HTTP status with the signed withdrawal data from the `multiSwapHelper.getWithdrawSigned()` function.

Each function ensures the parameters are validated before processing and handles errors by returning appropriate HTTP status codes. The helper functions (`multiSwapHelper`) are utilized to process the specific business logic related to multiswaps.
