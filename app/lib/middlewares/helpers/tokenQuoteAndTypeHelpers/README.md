# assetTypeHelper.ts

1.  **getSourceAssetTypes**: Determines the asset type for a source token.

    - **Parameters**: `sourceNetwork`, `sourceTokenAddress`, `amount`
    - **Returns**: `AssetType` object with properties `isFoundryAsset`, `isRefineryAsset`, `isIonicAsset`, `isOneInch`.

2.  **getTargetAssetTypes**: Determines the asset type for a target token.

    - **Parameters**: `targetNetwork`, `targetTokenAddress`, `amount`
    - **Returns**: `AssetType` object.

3.  **convertIntoAssetTypesObjectForSource**: Converts query into an `AssetType` object for the source.

    - **Parameters**: `query`
    - **Returns**: `AssetType` object.

4.  **convertIntoAssetTypesObjectForTarget**: Converts query into an `AssetType` object for the target.

    - **Parameters**: `query`
    - **Returns**: `AssetType` object.

5.  **isTypeFoundryAsset**: Checks if a source token is a Foundry asset.

    - **Parameters**: `sourceNetwork`, `sourceTokenAddress`
    - **Returns**: `boolean`.

6.  **isTypeRefineryAsset**: Checks if a source token is a Refinery asset.

    - **Parameters**: `sourceNetwork`, `sourceTokenAddress`, `amount`
    - **Returns**: `boolean`.

# crossNetworkQuoteAndTypeHelper.ts

#### 1\. `getCrossNetworkQuote`

This function retrieves a cross-network quote for a specified token. It communicates with various network APIs to fetch the latest token prices.

**Parameters:**

- `tokenSymbol` (string): The symbol of the token for which the quote is required.
- `sourceNetwork` (string): The network from which the quote is sourced.
- `destinationNetwork` (string): The network to which the quote is destined.
- `amount` (number): The amount of the token for which the quote is being requested.

**Returns:**

- `Promise<object>`: A promise that resolves to an object containing the quote details, including the rate and any applicable fees.

#### 2\. `getTokenType`

This function determines the type of a given token based on predefined criteria. It helps in categorizing tokens into various types such as native, ERC20, etc.

**Parameters:**

- `tokenSymbol` (string): The symbol of the token whose type is to be determined.

**Returns:**

- `string`: The type of the token (e.g., 'native', 'ERC20').

### Additional Notes

- The functions in this file rely on external network APIs and may require network access to function correctly.
- Error handling is implemented to manage potential issues such as network failures or invalid token symbols.
- Ensure that API keys and network configurations are correctly set up in the environment to avoid authentication errors.

# quoteProvidersHelper.ts

1.  **`chooseProviderAndGetData`**

    - **Description**: Determines the appropriate provider based on the `chainId` and fetches data accordingly.
    - **Parameters**:
      - `chainId` (string): The ID of the blockchain network.
      - `src` (string): The source token.
      - `dst` (string): The destination token.
      - `amount` (any): The amount of tokens to swap.
      - `slippage` (string): The allowed slippage percentage.
      - `from` (string): The address from which the tokens are sent.
      - `to` (string): The address to which the tokens are sent.
      - `isForRefresh` (boolean): Indicates if the request is for refreshing data.
    - **Returns**: Data from the chosen provider (`kyberSwapProvider` or `oneInchProvider`).

2.  **`oneInchProvider`**

    - **Description**: Fetches data from the OneInch provider.
    - **Parameters**:
      - `chainId` (string): The ID of the blockchain network.
      - `src` (string): The source token.
      - `dst` (string): The destination token.
      - `amount` (any): The amount of tokens to swap.
      - `slippage` (string): The allowed slippage percentage.
      - `from` (string): The address from which the tokens are sent.
      - `to` (string): The address to which the tokens are sent.
      - `isForRefresh` (boolean): Indicates if the request is for refreshing data.
    - **Returns**: An object containing `amounts`, `callData`, and `responseMessage`.

3.  **`kyberSwapProvider`**

    - **Description**: Fetches data from the KyberSwap provider.
    - **Parameters**:
      - `chainId` (string): The ID of the blockchain network.
      - `src` (string): The source token.
      - `dst` (string): The destination token.
      - `amount` (any): The amount of tokens to swap.
      - `slippage` (string): The allowed slippage percentage.
      - `from` (string): The address from which the tokens are sent.
      - `to` (string): The address to which the tokens are sent.
      - `isForRefresh` (boolean): Indicates if the request is for refreshing data.
    - **Returns**: An object containing `amounts`, `callData`, and `responseMessage`.

4.  **`delay`**

    - **Description**: Introduces a delay for a specified amount of milliseconds.
    - **Parameters**:
      - `ms` (any): The number of milliseconds to delay.
    - **Returns**: A Promise that resolves after the specified delay.

# sameNetworkQuoteAndTypeHelper.ts

### 1\. getQouteAndTypeForSameNetworks

#### Description

- Retrieves the quote and asset type for token transfers within the same network.

#### Parameters

- `sourceChainId`: The chain ID of the source network.
- `sourceTokenAddress`: The token address in the source network.
- `destinationChainId`: The chain ID of the destination network (same as source in this context).
- `destinationTokenAddress`: The token address in the destination network.
- `inputAmount`: The amount of token to be transferred.
- `sourceWallet`: The wallet address of the sender.
- `destinationWallet`: The wallet address of the receiver.
- `gasEstimationDestinationAmount`: The estimated gas amount for the destination.
- `sourceSlippage`: The slippage tolerance for the source.
- `destinationSlippage`: The slippage tolerance for the destination.

#### Returns

- A response containing the quote and asset type for both the source and destination.

### 2\. handleSource

#### Description

- Handles the source part of the quote and asset type retrieval.

#### Parameters

- Same as `getQouteAndTypeForSameNetworks` with additional `sourceNetwork`, `sourceTokenDecimals`, and `destinationTokenDecimals`.

#### Returns

- A response containing details about the source asset type and amounts.

### 3\. handleDestination

#### Description

- Handles the destination part of the quote and asset type retrieval.

#### Parameters

- Similar to `handleSource` with additional `sourceAmountOutIntoNumber` and `gasEstimationDestinationAmount`.

#### Returns

- A response containing details about the destination asset type and amounts.

### 4\. handleFoundary

#### Description

- Handles foundry asset types.

#### Parameters

- `inputAmount`: The amount of token.
- `tokenDecimals`: The decimals of the token.

#### Returns

- An object with `amountOutIntoNumber` and `amountOutIntoDecimals`.

### 5\. getNetworkByChainID

#### Description

- Retrieves network information by chain ID.

#### Parameters

- `chainId`: The chain ID to lookup.

#### Returns

- Network information for the given chain ID.

### 6\. getDecimals

#### Description

- Retrieves the decimal places for a given token.

#### Parameters

- `tokenAddress`: The address of the token.
- `chainId`: The chain ID of the token.
- `provider`: The provider for the network.

#### Returns

- The number of decimals for the token.

### 7\. getTokenType

#### Description

- Retrieves the type of token (e.g., Foundry, One Inch).

#### Parameters

- `network`: The network information.
- `sourceTokenAddress`: The address of the source token.
- `chainId`: The chain ID.
- `amountIntoDecimal`: The amount converted into decimals.

#### Returns

- The type of token as a string.

### 8\. convertResponseForSameNetworksIntoDesire

#### Description

- Converts the response data for same network transactions into a desired format.

#### Parameters

- `sData`: Source data.
- `dData`: Destination data.

#### Returns

- A formatted response string.

### 9\. getHighestSlippage

#### Description

- Determines the highest slippage between source and destination.

#### Parameters

- `sSlippage`: Source slippage.
- `dSlippage`: Destination slippage.

#### Returns

- The highest slippage value.
