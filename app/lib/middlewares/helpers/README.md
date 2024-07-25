# assetTypeHelper.ts

### 1\. getSourceAssetTypes

- Purpose: Asynchronously determines the asset types for a given source token on a specified network.
- Parameters:
  - `sourceNetwork` (any): The blockchain network of the source token.
  - `sourceTokenAddress` (any): The address of the source token.
  - `amount` (any): The amount of the token.
- Returns: A Promise that resolves to an `AssetType` object indicating whether the source token is a Foundry, Refinery, Ionic, or OneInch asset.
- Functionality:
  - Checks if the token is a Foundry asset using `sourceFACCheck`.
  - If not a Foundry asset, defaults to OneInch.

### 2\. getTargetAssetTypes

- Purpose: Similar to `getSourceAssetTypes`, but for target tokens.
- Parameters:
  - `targetNetwork` (any): The blockchain network of the target token.
  - `targetTokenAddress` (any): The address of the target token.
  - `amount` (any): The amount of the token.
- Returns: A Promise that resolves to an `AssetType` object for the target token.
- Functionality:
  - Determines if the token is a Foundry asset on the target network using `targetFACCheck`.
  - If not a Foundry asset, defaults to OneInch.

### 3\. convertIntoAssetTypesObjectForSource

- Purpose: Converts query parameters into an `AssetType` object based on the source asset type specified in the query.
- Parameters:
  - `query` (any): The query object containing `sourceAssetType`.
- Returns: An `AssetType` object based on the specified `sourceAssetType`.

### 4\. convertIntoAssetTypesObjectForTarget

- Purpose: Converts query parameters into an `AssetType` object based on the target asset type specified in the query.
- Parameters:
  - `query` (any): The query object containing `destinationAssetType`.
- Returns: An `AssetType` object based on the specified `destinationAssetType`.

### 5\. isTypeFoundryAsset

- Purpose: Asynchronously checks if a given source token is a Foundry asset.
- Parameters:
  - `sourceNetwork` (any): The network of the source token.
  - `sourceTokenAddress` (any): The address of the source token.
- Returns: A Promise resolving to a boolean indicating if the token is a Foundry asset.

### 6\. isTypeRefineryAsset

- Purpose: Asynchronously checks if a given source token is a Refinery asset.
- Parameters:
  - `sourceNetwork` (any): The network of the source token.
  - `sourceTokenAddress` (any): The address of the source token.
  - `amount` (any): The amount of the token.
- Returns: A Promise resolving to a boolean indicating if the token is a Refinery asset.

### 7\. sourceFACCheck

- Purpose: Internal helper function to check if a token address is a Foundry asset on the source network.
- Parameters:
  - `sourceNetwork` (any): The network to check.
  - `tokenAddress` (any): The address of the token.
- Returns: A Promise resolving to a boolean.

### 8\. isSourceRefineryAsset

- Purpose: Internal helper function to determine if a source token is a Refinery asset.
- Parameters:
  - `sourceNetwork` (any): The network of the source token.
  - `tokenAddress` (any): The token address.
  - `amount` (any): The token amount.
- Returns: A Promise that evaluates to true if the conditions for a Refinery asset are met.

### 9\. targetFACCheck

- Purpose: Internal helper function to check if a token address is a Foundry asset on the target network.
- Parameters:
  - `targetNetwork` (any): The network to check.
  - `tokenAddress` (any): The address of the token.
  - `amount` (any): The amount of the token for liquidity checks.
- Returns: A Promise resolving to a boolean indicating if the token is a Foundry asset.

### 10\. isTargetRefineryAsset

- Purpose: Internal helper function to determine if a target token is a Refinery asset.
- Parameters:
  - `targetNetwork` (any): The network of the target token.
  - `tokenAddress` (any): The token address.
  - `amount`

# authHelper.ts

### 1\. isTokenValid(token: any): Promise<boolean>

Checks the validity of a given authentication token by decrypting it, parsing it into JSON, and validating its random key, dates, and API key. If any check fails, it returns `false`. If all checks pass, it saves the random key and returns `true`.

### 2\. validateDates(data: any): boolean

Validates the start and end dates in the token data. It checks if the current date is between the start and end dates. Returns `true` if valid, otherwise `false`.

### 3\. validateAPIKey(data: any): boolean

Validates the API key present in the token data against a predefined global API key. Returns `true` if they match, otherwise `false`.

### 4\. validateRandomKey(data: any): Promise<boolean>

Checks the presence of a random key in the token data and verifies it against the database. Returns `true` if the key is not already in the database (indicating it's unique), otherwise `false`.

### 5\. saveRandomKey(data: any): Promise<void>

Saves a new random key into the database. This function assumes the presence of a valid random key in the token data and saves it along with the current timestamps.

### 6\. createAuthToken(): Promise<string>

Generates a new authentication token with a time validity of 5 minutes from its creation time. It constructs a token body with start and end date times, a new random key, and an API key, then encrypts this information to produce the token string.

Each function handles specific parts of token management, including validation of time constraints, API key, and random key uniqueness, as well as token creation and encryption.

# awsHelper.ts

### `awsSecretsManagerInit`

- Purpose: Initializes the AWS Secrets Manager client and retrieves secret values stored in AWS Secrets Manager.
- Parameters: None.
- Returns: A Promise that resolves when the secrets are successfully retrieved and set in the environment variables, or rejects in case of an error.
- Details:
  - Initializes a new AWS Secrets Manager client using the `region`, `accessKeyId`, and `secretAccessKey` retrieved from global environment settings.
  - Calls the `getSecretValue` method of the AWS Secrets Manager client, passing the secret name to retrieve.
  - Handles the response inside a callback:
    - If there's an error (e.g., secret not found or AWS API error), it logs the error and rejects the promise with an empty string.
    - If the secret is retrieved successfully, it checks if the secret is in string format. If so, it parses the secret and merges it into the global environment variables.
    - If the secret is in binary format, it decodes the binary data to ASCII and sets the `decodedBinarySecret` variable.
  - The promise is resolved after updating the environment variables or after handling any errors.

### Code snippet:

`async awsSecretsManagerInit() {
  return new Promise(async (resolve, reject) => {
    var client = new AWS.SecretsManager({
      region: region,
      accessKeyId: (global as any).environment.accessKeyId,
      secretAccessKey: (global as any).environment.secretAccessKey,
    });
    client.getSecretValue(
      { SecretId: secretName },
      function (err: any, data: any) {
        if (err) {
          console.log("aws error: " + err);
          reject("");
        } else {
          if ("SecretString" in data) {
            secret = data.SecretString;
            var secretJson = JSON.parse(secret);
            (global as any).environment = {
              ...secretJson,
              ...(global as any).environment,
            };
          } else {
            let buff = new Buffer(data.SecretBinary, "base64");
            decodedBinarySecret = buff.toString("ascii");
          }
          resolve("");
        }
      }
    );
  });
}`

This function is critical for the secure handling of sensitive configuration data within the AWS cloud environment, ensuring that secret keys and other credentials are properly managed and injected into the application runtime without hard-coding them into the source code.

# configurationHelper.ts

### Function: `getSlippage`

- Signature: `async getSlippage(slippage: string = ""): Promise<any>`
- Description: This function asynchronously retrieves the slippage configuration from the database.
- Parameters:
  - `slippage` (string, optional): A default value can be provided which, if present, will be returned directly.
- Returns: A Promise resolving to the slippage value as a string. If a slippage argument is provided, it returns that argument. Otherwise, it queries the database for the configuration settings, specifically looking for a slippage value. If found, it returns the slippage value converted to a string; if not found, it defaults to returning "2".
- Database Interaction:
  - It queries the `Configurations` collection/table in the database using `db.Configurations.findOne()` to fetch the current configuration.
- Error Handling: There's no explicit error handling in this function. If the database query fails or if the `Configurations` document is not set up correctly (e.g., missing the `slippage` field), this function might return `undefined` or an error might occur.

### Function: `getNativeTokens`

- Signature: `async getNativeTokens(): Promise<any>`
- Description: This function asynchronously fetches the list of native tokens from the database settings.
- Returns: A Promise that resolves to an array of native tokens. If the native tokens are found in the database, it returns this array; if not, it returns an empty array.
- Database Interaction:
  - Similar to `getSlippage`, it performs a database lookup using `db.Configurations.findOne()` to retrieve the `nativeTokens` from the current configuration.
- Error Handling: As with `getSlippage`, there's no explicit error handling. Any issues with the database access or document structure may lead to an unhandled exception or a returned value of `undefined`.

These functions rely heavily on the structure of the `Configurations` document in the database and assume successful database queries without handling potential exceptions or errors that could arise from the database operations.

# dexContractHelper.ts

### TypeScript Interface: `Response`

- Purpose: Defines the structure for the response object used in DEX operations.
- Properties:
  - `responseMessage`: A `string` that holds messages related to the DEX operation, primarily error messages.
  - `amounts`: Holds any amount-related data returned by the DEX operation, type is not strictly defined (`any`).

### Function: `getAmountOut`

- Signature: `async getAmountOut(network: any, path: any, amount: any): Promise<Response>`
- Purpose: Asynchronously retrieves the output amount for a given input amount on a DEX, based on specified conditions like the conversion path.
- Parameters:
  - `network`: Represents the DEX network and includes the `dexContract`. This is passed as an `any` type, implying flexibility in the parameter's structure.
  - `path`: Used to define the token conversion path for which amounts out are calculated. Its type is not strictly defined (`any`).
  - `amount`: The input amount for which the output needs to be calculated. Also typed as `any`.
- Returns: A promise that resolves to a `Response` object containing either the result of the DEX operation or an error message.
- Behavior:
  - The function attempts to call `getAmountsOut` method of the `dexContract` object, passing the `amount` (converted to string) and `path`.
  - If the operation is successful, the `amounts` data from the DEX operation is stored.
  - If an error occurs (e.g., a liquidity issue or other operational fault), it catches the error, logs it, and stores the error message in `responseMessage`.
- Error Handling: Errors are logged and incorporated into the response message for clarity on the operation's outcome.

This documentation summarizes the contents and functionality provided by the file. The focus is on handling DEX operations with error management and flexible parameter usage to accommodate various network and contract structures.

# fiberEngineHelper.ts

#### 1\. `getWithdrawSignedObject`

Creates an object of type `WithdrawSigned`.

**Parameters:**

- `targetTokenAddress` (string): Address of the target token.
- `destinationWalletAddress` (string): Address of the destination wallet.
- `destinationAmountIn` (string): Amount to be transferred.
- `salt` (string): Salt for the signature.
- `signatureExpiry` (number): Expiry time of the signature.
- `signature` (string): The signature itself.
- `targetNetwork` (any): Target network information.
- `targetSigner` (any): Target signer information.
- `targetChainId` (string): ID of the target chain.
- `swapTransactionHash` (string): Transaction hash of the swap.
- `gasLimit` (string): Gas limit for the transaction.
- `isCCTP` (boolean): Flag indicating if the operation is CCTP.

**Returns:** `WithdrawSigned` object.

#### 2\. `getWithdrawSignedAndSwapOneInchObject`

Creates an object of type `WithdrawSignedAndSwapOneInch`.

**Parameters:**

- `destinationWalletAddress` (string): Address of the destination wallet.
- `destinationAmountIn` (string): Input amount for the destination.
- `destinationAmountOut` (string): Output amount for the destination.
- `targetFoundryTokenAddress` (string): Address of the foundry token.
- `targetTokenAddress` (string): Address of the target token.
- `destinationOneInchData` (string): Data for 1inch swap.
- `salt` (string): Salt for the signature.
- `signatureExpiry` (number): Expiry time of the signature.
- `signature` (string): The signature itself.
- `destinationOneInchSelector` (string): Selector for 1inch.
- `targetNetwork` (any): Target network information.
- `targetSigner` (any): Target signer information.
- `targetChainId` (string): ID of the target chain.
- `swapTransactionHash` (string): Transaction hash of the swap.
- `gasLimit` (string): Gas limit for the transaction.
- `isCCTP` (boolean): Flag indicating if the operation is CCTP.

**Returns:** `WithdrawSignedAndSwapOneInch` object.

#### 3\. `doFoundaryWithdraw`

Executes a foundry withdrawal.

**Parameters:**

- `obj` (WithdrawSigned): Object containing withdrawal details.
- `extraBuffer` (number): Extra buffer for gas estimation.
- `count` (number, default=0): Retry count.

**Returns:** Promise resolving to the result of the withdrawal.

#### 4\. `doOneInchWithdraw`

Executes a 1inch withdrawal.

**Parameters:**

- `obj` (WithdrawSignedAndSwapOneInch): Object containing withdrawal details.
- `extraBuffer` (number): Extra buffer for gas estimation.
- `count` (number, default=0): Retry count.

**Returns:** Promise resolving to the result of the withdrawal.

#### 5\. `doSwap`

Executes a swap.

**Parameters:**

- `obj` (Swap): Object containing swap details.
- `fiberRouter` (any): Fiber router instance.

**Returns:** Promise resolving to the result of the swap.

#### 6\. `doOneInchSwap`

Executes a 1inch swap.

**Parameters:**

- `obj` (SwapOneInch): Object containing swap details.
- `fiberRouter` (any): Fiber router instance.

**Returns:** Promise resolving to the result of the swap.

#### 7\. `doSameNetworkSwap`

Executes a swap on the same network.

**Parameters:**

- `obj` (SwapSameNetwork): Object containing swap details.
- `fiberRouter` (any): Fiber router instance.

**Returns:** Promise resolving to the result of the swap.

#### 8\. `getDestinationAmountFromLogs`

Extracts the destination amount from logs.

**Parameters:**

- `recipet` (any): Transaction receipt.
- `rpcUrl` (string): RPC URL.
- `destinationAmount` (string): Initial destination amount.
- `isOneInch` (boolean): Flag indicating if it's a 1inch swap.

**Returns:** Decoded log or the initial destination amount.

#### 9\. `sendSlackNotification`

Sends a notification to Slack.

**Parameters:**

- `swapHash` (string): Swap transaction hash.
- `mesg` (any): Message content.
- `gasLimitTag` (any): Gas limit tag.

**Returns:** Promise resolving when the notification is sent.

#### 10\. `getValueForSwap`

Calculates the value for a swap.

**Parameters:**

- `amount` (any): Swap amount.
- `gasPrice` (any): Gas price.
- `isNative` (boolean): Flag indicating if the token is native.
- `isSameNetwork` (boolean, default=false): Flag indicating if it's the same network.

**Returns:** Calculated value for the swap.

#### 11\. `isOutOfGasError`

Checks if the error is an out-of-gas error.

**Parameters:**

- `error` (any): Error object.
- `totalGas` (any): Total gas used.

**Returns:** Boolean indicating if it's an out-of-gas error.

#### 12\. `doCCTPFlow`

Executes the CCTP flow.

**Parameters:**

- `network` (any): Network information.
- `messageBytes` (string): Message bytes.
- `messageHash` (string): Message hash.
- `isCCTP` (boolean): Flag indicating if it's a CCTP flow.

**Returns:** Promise resolving to the result of the CCTP flow.

#### 13\. `getLatestCallData`

Fetches the latest call data.

**Parameters:**

- `chainId` (string): Chain ID.
- `src` (any): Source details.
- `dst` (string): Destination details.
- `amount` (string): Amount for the call.
- `slippage` (string): Slippage for the call.
- `from` (string): From address.
- `to` (string): To address.
- `recursionCount` (number, default=0): Recursion count.

**Returns:** Latest call data or an empty string.

#### 14\. `handleWithdrawalErrors`

Handles errors during withdrawal.

**Parameters:**

- `swapTransactionHash` (string): Swap transaction hash.
- `error` (string): Error message.
- `code` (any): Error code.

**Returns:** Object containing response code and message.

#### 15\. `getGasLimitTagForSlackNotification`

Generates a gas limit tag for Slack notifications.

**Parameters:**

- `dynamicGasPrice` (any): Dynamic gas price.
- `gasLimit` (any): Gas limit.

**Returns:** Generated gas limit tag.

#### 16\. `delay`

Creates a delay.

**Returns:** Promise that resolves after a delay.

# fiberNodeHelper.ts

#### Function: getSourceAmountOut

Signature:

`getSourceAmountOut(destinationAmount: string, actualAmount: any): any`

Parameters:

- `destinationAmount`: A string representing the amount that is expected or calculated at the destination.
- `actualAmount`: The actual amount received, which can be of any type.

Returns:

- This function returns a value of type `any`. The value returned depends on whether the `destinationAmount` is provided or not.

Description:

- This function determines the output amount based on whether the `destinationAmount` is provided. If `destinationAmount` is present, the function returns a hardcoded value `"0.5"`, stored in `fakeAmount`. If `destinationAmount` is not provided, it returns the `actualAmount` passed to the function.

Usage:

- This function is likely used to simulate or test behavior in environments where the exact output amount needs to be controlled or is predictable for testing purposes.

This summarizes the function available in the `fiberNodeHelper.ts` file, which seems to be designed primarily for testing or simulation purposes in the middleware of the FIBER Engine Backend.

# liquidityHelper.ts

1.  **isLiquidityAvailableForEVM**

    - **Description**: Checks if sufficient liquidity is available for an EVM-compatible token.
    - **Parameters**:
      - `foundryTokenAddress` (string): The address of the token contract.
      - `fundManagerAddress` (string): The address of the fund manager.
      - `provider` (any): The provider to interact with the Ethereum network.
      - `amount` (number): The required amount of tokens.
    - **Returns**: `Promise<boolean>` - `true` if sufficient liquidity is available, otherwise `false`.

2.  **isLiquidityAvailableForCudos**

    - **Description**: Checks if sufficient liquidity is available for a Cudos token.
    - **Parameters**:
      - `foundryTokenAddress` (string): The address of the token contract.
      - `fundManagerAddress` (string): The address of the fund manager.
      - `rpc` (any): RPC endpoint for the Cudos network.
      - `privateKey` (string): Private key for authentication.
      - `amount` (number): The required amount of tokens.
    - **Returns**: `Promise<boolean>` - `true` if sufficient liquidity is available, otherwise `false`.

3.  **checkForCCTP**

    - **Description**: Validates conditions for Cross-Chain Token Protocol (CCTP).
    - **Parameters**:
      - `foundryTokenAddress` (string): The address of the token contract.
      - `fundManagerAddress` (string): The address of the fund manager.
      - `provider` (any): The provider to interact with the Ethereum network.
      - `amount` (any): The required amount of tokens.
      - `foundaryDecimals` (any): The decimal precision for the token.
      - `srcChainId` (string): The source chain ID.
      - `desChainId` (string): The destination chain ID.
    - **Returns**: `Promise<boolean>` - `true` if CCTP conditions are met, otherwise `false`.

# multiSwapHelper.ts

1.  **getQuoteAndTokenTypeInformation**

    - This function retrieves quote and token type information based on the request parameters.
    - It differentiates between same network swaps and cross-network swaps.
    - Depending on the network type, it calls either `getQouteAndTypeForSameNetworks` or `getQouteAndTypeForCrossNetworks`.

2.  **getSwapSigned**

    - This function signs the swap transaction using the `fiberEngine.swapForAbi` method.

3.  **getWithdrawSigned**

    - This function handles the withdrawal process.
    - It checks if the transaction is already in the log and if not, logs the transaction and processes the withdrawal.

4.  **isSameNetworksSwap**

    - This helper function checks if the source and destination networks are the same.

5.  **saveTransactionLog**

    - This function saves a transaction log to the database.

6.  **isAlreadyInTransactionLog**

    - This function checks if a transaction is already present in the transaction log.

7.  **updateTransactionLog**

    - This function updates a transaction log with the provided data.

8.  **doWithdraw**

    - This function handles the withdrawal process by calling the `fiberEngine.withdraw` method and updating the transaction log.

9.  **quotAndTokenValidation**

    - This function validates the required fields for quoting and token information.

10. **swapSignedValidation**

    - This function validates the required fields for signing a swap.

11. **withdrawSignedValidation**

- This function validates the required fields for signing a withdraw.

# signatureHelper.ts

### Interface: `SignatureResponse`

This interface defines the structure for the response object used in signature operations within the application. It includes the following fields:

- `hash`: A string representing a cryptographic hash.
- `salt`: A string representing a cryptographic salt.
- `signature`: A string representing a cryptographic signature.
- `amount`: A string representing an amount, typically used in financial transactions.

### Function: `getSignature`

- Purpose: This function generates a signature response based on provided parameters.
- Parameters:
  - `paramsBody`: An object containing necessary parameters to generate the signature. Expected fields include:
    - `salt`: A cryptographic salt string.
    - `hash`: A cryptographic hash string.
    - `signatures`: An array of signature objects.
- Returns: An instance of `SignatureResponse`.
- Description: The function initializes an empty `SignatureResponse` object. It checks for necessary properties in `paramsBody`. If these are present, it populates the `SignatureResponse` object with values from `paramsBody`, including selecting the first signature from the `signatures` array if available.

### Function: `getWithdrawalDataHashForSwap`

- Purpose: Computes a hash string for swap withdrawal data.
- Parameters:
  - `sourceOneInchData`: A string representing source data for the swap.
  - `destinationOneInchData`: A string representing destination data for the swap.
  - `amountIn`: A string representing the input amount for the swap.
  - `amountOut`: A string representing the output amount for the swap.
  - `sourceAssetType`: A string indicating the type of the source asset.
  - `destinationAssetType`: A string indicating the type of the destination asset.
- Returns: A string representing the computed hash.
- Description: This function concatenates the input parameters and computes a keccak256 hash using the Web3 library. This hash is intended to represent the withdrawal data for a swap operation securely.

These components are crucial for managing cryptographic operations related to transactions within the application, ensuring data integrity and security during transactions.

# startHelper.ts

### `startHelperInit(process: any): object`

This function initializes the helper with default configuration values for various environment settings. It is designed to set up and return an object that encapsulates environment-related flags based on the provided process arguments.

#### Parameters:

- process (any): This is expected to be the Node.js process object, which allows the function to access command-line arguments.

#### Returns:

- object: Returns an object with environment configurations.

#### Behavior:

- The function initializes an object `starterObject` with default environment settings:
  - `environmentTag`: Default set to "dev". This can be overwritten by the second command-line argument which specifies the environment (e.g., dev, uat, qa, staging, prod).
  - `environmentType`: Not explicitly set initially but can be defined by the third command-line argument which specifies the type (e.g., api, cron).
  - Flags to indicate if the cron environment supports specific operations (`isCronEnvironmentSupportedForDeleteRandomKey`, `isCronEnvironmentSupportedForGetAllNetwork`, `isCronEnvironmentSupportedForGetGasEstimation`): All set to "no" by default and can be changed to "yes" if the `environmentType` is "cron".

#### Example of use:

`const process = {
  argv: ['node', 'script.js', 'prod', 'cron']
};
const config = startHelperInit(process);
console.log(config);
// Output might include: { environmentTag: 'prod', isCronEnvironmentSupportedForDeleteRandomKey: 'yes', ... }`

This function primarily aids in configuring the environment based on command-line inputs when initializing parts of an application, particularly useful for handling different deployment stages and types dynamically.

# stringHelper.ts

1.  **`swapIsNotAvailable`**

    - **Description**: This constant holds the error message indicating that the swap functionality is not available.
    - **Value**: `"Swap is not available"`

2.  **`genericProviderError`**

    - **Description**: This constant holds a generic error message used when a provider is not responding.
    - **Value**: `"Provider is not responding. please try again"`

3.  **`insufficientLiquidityError`**

    - **Description**: This constant is used when there is insufficient liquidity available for a transaction.
    - **Value**: `"Insufficient Liquidity"`

4.  **`sameNetworkSwapError`**

    - **Description**: This constant holds the error message for scenarios where swaps on the same network are not available.
    - **Value**: `"Same network swaps are currently not available"`

5.  **`invalidPlatformFee`**

    - **Description**: This constant is used when an invalid platform fee is detected.
    - **Value**: `"Invalid platform fee"`

6.  **`attestationSignatureError`**

    - **Description**: This constant holds the error message for attestation signature errors.
    - **Value**: `"Attestation signature error"`

# withdrawResponseHelper.ts

1.  **createCudosResponse**

    Creates a response object for Cudos transactions.

    - **Parameters**: `tx` (any) - Transaction object.
    - **Returns**: `Response` - Formatted response object.

2.  **createEVMResponse**

    Creates a response object for EVM transactions.

    - **Parameters**: `tx` (any) - Transaction object.
    - **Returns**: `Response` - Formatted response object.

3.  **filterEVMResponseMessage**

    A function to filter EVM response messages.

    - **Parameters**: `tx` (any) - Transaction object.
    - **Returns**: `Response` - Filtered response object with default values.
