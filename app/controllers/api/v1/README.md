# gasFees.ts

1.  **Get Token Categorized Quote Info**

    - **Route**: `/token/categorized/quote/info`
    - **Method**: `GET`
    - **Description**: This endpoint retrieves quote and token type information based on the provided request parameters.
    - **Validation**: `quotAndTokenValidation(req)`
    - **Request Parameters**:
      - `sourceWalletAddress`: The wallet address initiating the request.
      - `destinationWalletAddress` (optional): The destination wallet address. Defaults to `sourceWalletAddress` if not provided.
    - **Response**:
      - `data`: Quote and token type information.

2.  **Post Swap Signed**

    - **Route**: `/swap/signed`
    - **Method**: `POST`
    - **Description**: This endpoint handles the signing of swap transactions.
    - **Validation**: `swapSignedValidation(req)`
    - **Request Parameters**:
      - `sourceNetworkChainId`: Chain ID of the source network.
      - `destinationNetworkChainId`: Chain ID of the destination network.
      - `sourceWalletAddress`: The wallet address initiating the request.
      - `destinationWalletAddress` (optional): The destination wallet address. Defaults to `sourceWalletAddress` if not provided.
      - Other relevant parameters related to the swap transaction.
    - **Response**:
      - `data`: Signed swap transaction data.

3.  **Post Withdraw Signed**

    - **Route**: `/withdraw/signed/:txHash`
    - **Method**: `POST`
    - **Description**: This endpoint handles the signing of withdrawal transactions.
    - **Validation**: `withdrawSignedValidation(req)`
    - **Request Parameters**:
      - `txHash`: The transaction hash for the swap transaction.
      - `sourceWalletAddress`: The wallet address initiating the request.
      - `destinationWalletAddress` (optional): The destination wallet address. Defaults to `sourceWalletAddress` if not provided.
      - Other relevant parameters related to the withdrawal transaction.
    - **Response**:
      - `data`: Signed withdrawal transaction data.

#### POST `/estimation`

- **Purpose**: Estimate gas fees for a transaction.
- **Middleware**:
  - `asyncMiddleware`: Handles the asynchronous processing of the request.
  - **Handler Function**:
    - Validates the gas estimation request using `gasEstimationValidation`.
    - Checks if the source and destination networks are the same using `isSameNetworksSwap`.
    - If the networks are different:
      - Converts the fee distribution using `convertIntoFeeDistributionObject`.
      - Estimates the destination gas prices using `destinationGasEstimation`.
    - Estimates the source gas prices using `sourceGasEstimation`.
    - Responds with the source and destination gas prices.

#### GET `/:chainId`

- **Purpose**: Retrieve gas fees for a specific chain ID.
- **Handler Function**:
  - Constructs a filter object based on the `chainId` parameter.
  - Queries the database for gas fees matching the filter.
  - Responds with the retrieved gas fees.

# multiswap.ts
