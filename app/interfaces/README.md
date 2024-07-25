# feeDistributionInterface.ts

- **`referral`**:

  - **Type**: `string`
  - **Description**: This property holds the referral identifier. It represents the unique identifier for the referral transaction.

- **`referralFee`**:

  - **Type**: `string`
  - **Description**: This property contains the referral fee amount. It indicates the fee charged for the referral.

- **`referralDiscount`**:

  - **Type**: `string`
  - **Description**: This property stores the referral discount amount. It represents the discount given to the user due to the referral.

- **`sourceAmountIn`**:

  - **Type**: `string`
  - **Description**: This property represents the amount of source currency input. It indicates the amount of currency that is input into the transaction from the source.

- **`sourceAmountOut`**:

  - **Type**: `string`
  - **Description**: This property holds the amount of source currency output. It indicates the amount of currency that is output from the transaction in the source currency.

- **`destinationAmountIn`**:

  - **Type**: `string`
  - **Description**: This property represents the amount of destination currency input. It indicates the amount of currency that is input into the transaction in the destination currency.

- **`destinationAmountOut`**:

  - **Type**: `string`
  - **Description**: This property stores the amount of destination currency output. It indicates the amount of currency that is output from the transaction in the destination currency.

- **`salt`**:

  - **Type**: `string`
  - **Description**: This property is a unique salt value used for cryptographic purposes. It ensures the uniqueness and security of the transaction.

- **`expiry`**:

  - **Type**: `number`
  - **Description**: This property represents the expiry time of the transaction. It indicates the time until which the transaction is valid.

- **`signature`**:

  - **Type**: `string`
  - **Description**: This property holds the digital signature of the transaction. It is used to verify the authenticity and integrity of the transaction.

# fiberEngineInterface.ts

#### `WithdrawSigned`

This interface represents a signed withdrawal request.

**Fields:**

- `targetTokenAddress`: `string` - The address of the target token.
- `destinationWalletAddress`: `string` - The address of the destination wallet.
- `destinationAmountIn`: `string` - The amount to be received in the destination wallet.
- `salt`: `string` - A unique salt value for the signature.
- `signatureExpiry`: `number` - The expiration time of the signature.
- `signature`: `string` - The signature of the request.
- `targetNetwork`: `any` - The network on which the target token resides.
- `targetSigner`: `any` - The signer of the target token.
- `targetChainId`: `string` - The chain ID of the target network.
- `swapTransactionHash`: `string` - The transaction hash of the swap.
- `gasLimit`: `string` - The gas limit for the transaction.
- `isCCTP`: `boolean` - Indicates if the transaction is a Cross-Chain Token Transfer Protocol (CCTP).

#### `WithdrawSignedAndSwapOneInch`

This interface extends `WithdrawSigned` for operations involving 1inch swaps.

**Fields:**

- `destinationWalletAddress`: `string` - The address of the destination wallet.
- `destinationAmountIn`: `string` - The amount to be received in the destination wallet.
- `destinationAmountOut`: `string` - The amount out after the swap.
- `targetFoundryTokenAddress`: `string` - The address of the target foundry token.
- `destinationOneInchData`: `string` - The data for 1inch transaction.
- `oneInchSelector`: `string` - The selector for the 1inch transaction.
- `aggregateRouterContractAddress`: `string` - The address of the aggregate router contract.
- `isCCTP`: `boolean` - Indicates if the transaction is a Cross-Chain Token Transfer Protocol (CCTP).

#### `Swap`

This interface represents a token swap transaction.

**Fields:**

- `sourceTokenAddress`: `string` - The address of the source token.
- `amount`: `string` - The amount to be swapped.
- `targetChainId`: `string` - The chain ID of the target network.
- `targetTokenAddress`: `string` - The address of the target token.
- `destinationWalletAddress`: `string` - The address of the destination wallet.
- `withdrawalData`: `string` - The data for withdrawal.
- `sourceWalletAddress`: `string` - The address of the source wallet.
- `value`: `string` - The value of the swap.
- `isCCTP`: `boolean` - Indicates if the transaction is a Cross-Chain Token Transfer Protocol (CCTP).
- `feeDistribution`: `FeeDistribution` - The fee distribution for the transaction.

#### `SwapOneInch`

This interface extends `Swap` for operations involving 1inch.

**Fields:**

- `amountIn`: `string` - The amount of source token.
- `amountOut`: `string` - The amount of target token after the swap.
- `sourceOneInchData`: `string` - The data for 1inch transaction.
- `foundryTokenAddress`: `string` - The address of the foundry token.
- `gasPrice`: `string` - The gas price for the transaction.
- `oneInchSelector`: `string` - The selector for the 1inch transaction.
- `aggregateRouterContractAddress`: `string` - The address of the aggregate router contract.
- `isCCTP`: `boolean` - Indicates if the transaction is a Cross-Chain Token Transfer Protocol (CCTP).

#### `SwapSameNetwork`

This interface represents a swap transaction within the same network.

**Fields:**

- `amountIn`: `string` - The amount of source token.
- `amountOut`: `string` - The amount of target token after the swap.
- `sourceTokenAddress`: `string` - The address of the source token.
- `targetTokenAddress`: `string` - The address of the target token.
- `destinationWalletAddress`: `string` - The address of the destination wallet.
- `destinationOneInchData`: `string` - The data for 1inch transaction.
- `sourceWalletAddress`: `string` - The address of the source wallet.
- `oneInchSelector`: `string` - The selector for the 1inch transaction.
- `aggregateRouterContractAddress`: `string` - The address of the aggregate router contract.

#### `WithdrawOneInchLogs`

This interface represents logs for 1inch withdrawal transactions.

**Fields:**

- `2`: `string` - A placeholder field (possibly for logs indexing or specific log data).

# forgeInterface.ts

### `Contract`

Represents a basic contract configuration.

- **rpcUrl**: `string` - The URL of the RPC endpoint.
- **contractAddress**: `string` - The address of the smart contract.

### `WithdrawSigned`

Represents the data required for a signed withdrawal.

- **targetTokenAddress**: `string` - The address of the token to be withdrawn.
- **destinationWalletAddress**: `string` - The wallet address where the token will be sent.
- **destinationAmountIn**: `string` - The amount to be withdrawn.
- **salt**: `string` - A unique value to prevent replay attacks.
- **signatureExpiry**: `number` - The expiration time of the signature.
- **signature**: `string` - The cryptographic signature.
- **isCCTP**: `boolean` - Indicates if the transaction is a Cross-Chain Token Transfer Protocol.

### `WithdrawSignedAndSwapOneInch`

Represents the data required for a signed withdrawal and a swap via the 1inch protocol.

- **destinationWalletAddress**: `string` - The wallet address where the token will be sent.
- **destinationAmountIn**: `string` - The amount to be withdrawn.
- **destinationAmountOut**: `string` - The amount received after the swap.
- **targetFoundryTokenAddress**: `string` - The address of the foundry token.
- **targetTokenAddress**: `string` - The address of the token to be swapped.
- **destinationOneInchData**: `string` - Data required for the 1inch swap.
- **salt**: `string` - A unique value to prevent replay attacks.
- **signatureExpiry**: `number` - The expiration time of the signature.
- **signature**: `string` - The cryptographic signature.
- **oneInchSelector**: `string` - The selector for the 1inch protocol.
- **aggregateRouterContractAddress**: `string` - The address of the aggregate router contract.
- **isCCTP**: `boolean` - Indicates if the transaction is a Cross-Chain Token Transfer Protocol.

### `Swap`

Represents the data required for a token swap.

- **sourceTokenAddress**: `string` - The address of the source token.
- **amount**: `string` - The amount of the source token to be swapped.
- **targetChainId**: `string` - The ID of the target blockchain.
- **targetTokenAddress**: `string` - The address of the target token.
- **destinationWalletAddress**: `string` - The wallet address where the swapped token will be sent.
- **withdrawalData**: `string` - Data required for the withdrawal.
- **sourceWalletAddress**: `string` - The address of the source wallet.
- **value**: `string` - The value of the transaction.
- **isCCTP**: `boolean` - Indicates if the transaction is a Cross-Chain Token Transfer Protocol.
- **feeDistribution**: `FeeDistribution` - The distribution of fees for the transaction.

### `SwapOneInch`

Represents the data required for a token swap via the 1inch protocol.

- **amountIn**: `string` - The amount of the source token to be swapped.
- **amountOut**: `string` - The amount received after the swap.
- **targetChainId**: `string` - The ID of the target blockchain.
- **targetTokenAddress**: `string` - The address of the target token.
- **destinationWalletAddress**: `string` - The wallet address where the swapped token will be sent.
- **sourceOneInchData**: `string` - Data required for the 1inch swap.
- **sourceTokenAddress**: `string` - The address of the source token.
- **foundryTokenAddress**: `string` - The address of the foundry token.
- **withdrawalData**: `string` - Data required for the withdrawal.
- **gasPrice**: `string` - The gas price for the transaction.
- **sourceWalletAddress**: `string` - The address of the source wallet.
- **value**: `string` - The value of the transaction.
- **oneInchSelector**: `string` - The selector for the 1inch protocol.
- **aggregateRouterContractAddress**: `string` - The address of the aggregate router contract.
- **isCCTP**: `boolean` - Indicates if the transaction is a Cross-Chain Token Transfer Protocol.
- **feeDistribution**: `FeeDistribution` - The distribution of fees for the transaction.

### `SwapSameNetwork`

Represents the data required for a token swap within the same network.

- **amountIn**: `string` - The amount of the source token to be swapped.
- **amountOut**: `string` - The amount received after the swap.
- **sourceTokenAddress**: `string` - The address of the source token.
- **targetTokenAddress**: `string` - The address of the target token.
- **destinationWalletAddress**: `string` - The wallet address where the swapped token will be sent.
- **destinationOneInchData**: `string` - Data required for the 1inch swap.
- **sourceWalletAddress**: `string` - The address of the source wallet.
- **value**: `string` - The value of the transaction.
- **oneInchSelector**: `string` - The selector for the 1inch protocol.
- **aggregateRouterContractAddress**: `string` - The address of the aggregate router contract.

### `DestinationGasEstimationResponse`

Represents the response for a gas estimation request.

- **gasPriceInNumber**: `string` - The gas price in numeric format.
- **gasPriceInMachine**: `string` - The gas price in machine-readable format.

# quoteAndTypeInterface.ts

#### 1\. Interface: `SourceCrossNetworkObject`

This interface describes the structure of objects that contain information about the source of a cross-network transaction. Below are the properties defined in this interface:

- **`sourceAssetType: any`**: The type of asset being used in the source transaction.
- **`sourceAmountInNumber: any`**: The amount of the source asset, represented as a number.
- **`sourceCallData: any`**: Call data associated with the source transaction.
- **`sourceAmountIn: any`**: The amount of the source asset.
- **`sourceAmountOut: any`**: The amount of the source asset after processing.
- **`feeDistribution: any`**: Information about how the fees are distributed.
- **`sourceSlippageInNumber: "0"`**: The slippage amount in the source transaction, defaulted to "0".
- **`totalPlatformFee: "0"`**: The total platform fee, defaulted to "0".
- **`totalPlatformFeeInNumber: any`**: The total platform fee, represented as a number.

#### 2\. Interface: `DestinationCrossNetworkObject`

This interface describes the structure of objects that contain information about the destination of a cross-network transaction. Below are the properties defined in this interface:

- **`targetAssetType: any`**: The type of asset being used in the destination transaction.
- **`destinationCallData: any`**: Call data associated with the destination transaction.
- **`destinationAmountOutInNumber: any`**: The amount of the destination asset, represented as a number.
- **`minDestinationAmountOut: any`**: The minimum amount expected for the destination asset.
- **`destinationAmountIn: any`**: The amount of the destination asset.
- **`destinationAmountOut: any`**: The amount of the destination asset after processing.
- **`targetFoundryTokenAddress: any`**: The token address for the target foundry.
- **`isCCTP: boolean`**: A boolean indicating if the transaction is a Cross-Chain Transfer Protocol (CCTP).
