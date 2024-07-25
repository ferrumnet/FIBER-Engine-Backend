# configurations.ts

1.  **slippage**: A number indicating the slippage value, defaulting to 0.
2.  **cctpBalanceThreshold**: A number indicating the CCTP balance threshold, defaulting to 0.
3.  **cctpAttestationApiThreshold**: A number indicating the CCTP attestation API threshold, defaulting to 0.
4.  **providerApiThreshold**: A number indicating the provider API threshold, defaulting to 0.
5.  **platformFee**: A number indicating the platform fee, defaulting to 0.
6.  **nativeTokens**: An array of objects, each containing:
    - `chainId`: A string representing the chain ID, defaulting to an empty string.
    - `symbol`: A string representing the symbol, defaulting to an empty string.
    - `address`: A string representing the address, defaulting to an empty string.
    - `wrappedAddress`: A string representing the wrapped address, defaulting to an empty string.
    - `nativeAddress`: A string representing the native address, defaulting to an empty string.
7.  **oneInchSelector**: An array of objects, each containing:
    - `type`: A string representing the type, defaulting to "0".
    - `hash`: A string representing the hash, defaulting to an empty string.
8.  **gasNetworks**: An array of objects, each containing:
    - `name`: A string representing the network name, defaulting to an empty string.
    - `chainId`: A string representing the chain ID, defaulting to an empty string.
    - `shortName`: A string representing the short name, defaulting to an empty string.
    - `provider`: A string representing the provider, defaulting to "owlracle".
9.  **allowedNetworksForCCTP**: An array of objects, each containing:
    - `name`: A string representing the network name, defaulting to an empty string.
    - `chainId`: A string representing the chain ID, defaulting to an empty string.
10. **allowedNetworksForKyberSwap**: An array of objects, each containing:
    - `name`: A string representing the network name, defaulting to an empty string.
    - `chainId`: A string representing the chain ID, defaulting to an empty string.
11. **oneInchExcludedProtocols**: An empty array for excluded protocols.
12. **isActive**: A boolean indicating if the configuration is active, defaulting to `true`.
13. **createdAt**: A date indicating when the configuration was created, defaulting to the current date.
14. **updatedAt**: A date indicating when the configuration was last updated, defaulting to the current date.

# gasFees.ts

1.  **maxFeePerGas**

    - **Type**: String
    - **Default**: ""
    - **Description**: The maximum fee per gas unit allowed for transactions.

2.  **maxPriorityFeePerGas**

    - **Type**: String
    - **Default**: ""
    - **Description**: The maximum priority fee per gas unit, used to expedite transactions.

3.  **gasLimit**

    - **Type**: String
    - **Default**: ""
    - **Description**: The maximum amount of gas that can be used for a transaction.

4.  **gasPrice**

    - **Type**: String
    - **Default**: ""
    - **Description**: The price of gas per unit.

5.  **bufferForGasEstimation**

    - **Type**: Number
    - **Default**: 0
    - **Description**: A buffer value to be used during gas estimation to prevent underestimation.

6.  **bufferForWithdrawal**

    - **Type**: Number
    - **Default**: 0
    - **Description**: A buffer value to be used for withdrawal transactions.

7.  **aggressivePriceBuffer**

    - **Type**: Number
    - **Default**: 0
    - **Description**: An additional buffer for aggressive gas pricing strategies.

8.  **gasPriceForCCTP**

    - **Type**: Number
    - **Default**: 0
    - **Description**: Specific gas price configuration for Cross-Chain Transfer Protocol (CCTP) operations.

9.  **isAllowedDynamicGasLimit**

    - **Type**: Boolean
    - **Default**: false
    - **Description**: Flag to allow or disallow dynamic gas limit settings.

10. **isAllowedSourceAggressivePriceForDynamicGas**

    - **Type**: Boolean
    - **Default**: false
    - **Description**: Flag to allow or disallow aggressive pricing for dynamic gas on the source side of transactions.

11. **isAllowedDestinationAggressivePriceForDynamicGas**

    - **Type**: Boolean
    - **Default**: false
    - **Description**: Flag to allow or disallow aggressive pricing for dynamic gas on the destination side of transactions.

12. **chainId**

    - **Type**: String
    - **Default**: ""
    - **Description**: Identifier for the blockchain network this configuration applies to.

13. **dynamicValues**

    - **Type**: Object
    - **Description**: Contains dynamic values for gas fee settings.
      - **maxFeePerGas**
        - **Type**: String
        - **Default**: ""
      - **maxPriorityFeePerGas**
        - **Type**: String
        - **Default**: ""
      - **gasPrice**
        - **Type**: String
        - **Default**: ""

14. **isActive**

    - **Type**: Boolean
    - **Default**: true
    - **Description**: Flag to mark the configuration as active or inactive.

15. **createdAt**

    - **Type**: Date
    - **Default**: new Date()
    - **Description**: Timestamp of when the configuration was created.

16. **updatedAt**

    - **Type**: Date
    - **Default**: new Date()
    - **Description**: Timestamp of when the configuration was last updated.

### Schema Options

- **collection**: The name of the MongoDB collection where this schema will be stored is `gasFees`.

## Model Definition

The schema is then used to create a Mongoose model:

`var gasFeesModel = mongoose.model(collectionName, schema);
module.exports = gasFeesModel;`

- **Model Name**: `gasFees`
- **Module Export**: The model is exported for use in other parts of the application.

# index.ts

### Function Documentation

- Purpose: Automatically import all files (except 'plugins' and 'index.js') in the current directory as modules and export them with their file names transformed into a capitalized module name format.

- Method: Uses Node.js's `fs` (file system) module to read all files in the directory of the script.

- Code Breakdown:
  `var fs = require('fs');
fs.readdirSync(__dirname).forEach(function (file: any) {
  if (file !== 'plugins' && file !== 'index.js') {
    let moduleName = file.split('.')[0];
    exports[moduleName[0].toUpperCase() + moduleName.slice(1)] = require('./' + moduleName);
  }
});`

  - `var fs = require('fs')`: Includes the Node.js file system module to interact with the file system.
  - `fs.readdirSync(__dirname)`: Synchronously reads the directory contents where the script resides.
  - `.forEach(function (file: any))`: Iterates over each file in the directory.
  - `if (file !== 'plugins' && file !== 'index.js')`: Filters out the 'plugins' directory and 'index.js' file to avoid unnecessary imports or recursion.
  - `let moduleName = file.split('.')[0]`: Extracts the file name without the extension to use as the module name.
  - `exports[moduleName[0].toUpperCase() + moduleName.slice(1)] = require('./' + moduleName)`: Capitalizes the first letter of the module name, retains the rest as is, and assigns the imported module to the exports object. This makes the module accessible from outside using a named import corresponding to the file name.

### Usage

- This setup allows any JavaScript file in the `app/models` directory (with exceptions noted) to be automatically imported and ready to use elsewhere in the project without manually importing each model file.

# randomKeys.ts

### Imports and Setup

- `mongoose`: The file imports `mongoose`, a package that provides a straightforward way to model your application data. It is used here to define schemas and create models.
- `collectionName`: A variable set to the string `'randomKeys'`, which specifies the name of the MongoDB collection that this model will interact with.

### Schema Definition

- `schema`: This variable holds a schema defined using `mongoose.Schema`. The schema defines the structure of documents within the `randomKeys` collection. Here's a breakdown of the schema properties:
  - `key`: A string with a default value of an empty string. This field is likely used to store a key or identifier.
  - `isActive`: A boolean that tracks whether the key is active, with a default value of `true`.
  - `createdAt`: A date field that records when the document was created, with a default value set to the current date and time at the moment of creation.
  - `updatedAt`: A date field that indicates the last update time of the document, also defaulting to the current date and time.

### Model Creation

- `randomKeysModel`: This variable creates a model from the defined schema. The model uses the `collectionName` ('randomKeys') and allows for interacting with the collection according to the defined schema.

### Module Exports

- The model `randomKeysModel` is exported from the module, making it available for use in other parts of the application where interacting with the `randomKeys` collection is necessary.

# transactionLogs.ts

### Module Imports and Setup

- Mongoose: The module uses Mongoose to interact with MongoDB. Mongoose provides a straightforward schema-based solution to model application data.
- Collection Name: The data will be stored in the MongoDB collection named `"transactionLogs"`.

### Schema Definition

A Mongoose schema defines the structure of the document, default values, validators, etc. Here is the schema used in this module:

- `swapTransactionHash`: A string that defaults to an empty string. This likely represents the hash of a swap transaction in the blockchain.
- `sourceWalletAddress`: A string representing the wallet address from where the transaction originated, defaults to an empty string.
- `sourceTokenContractAddress`: A string indicating the contract address of the token being transferred, defaults to an empty string.
- `sourceNetworkChainId`: A string representing the chain ID of the source network, defaults to an empty string.
- `sourceAmount`: A string representing the amount of tokens transferred from the source, defaults to an empty string.
- `destinationTokenContractAddress`: A string representing the contract address of the token at the destination, defaults to an empty string.
- `destinationNetworkChainId`: A string representing the chain ID of the destination network, defaults to an empty string.
- `destinationWalletAddress`: A string for the wallet address at the destination, defaults to an empty string.
- `withdrawTransactionHash`: A string that defaults to an empty string, potentially representing the hash of a transaction withdrawing tokens at the destination.
- `isActive`: A boolean indicating whether the log is active, defaulted to true.
- `responseCode`: A number that can store a response code related to the transaction, defaulted to an empty string.
- `responseMessage`: This field is defined without a type, allowing any data structure as per Mongoose's flexibility.

### Timestamps

- `createdAt` and `updatedAt`: Both fields are of type `Date`, defaulting to the current date. These fields automatically track when a document is created and last updated.

### Model Compilation

- The schema is compiled into a model with the name `transactionLogsModel` using the specified collection. This model is then exported for use elsewhere in the application to interact with the `transactionLogs` collection.

This detailed explanation covers the purpose and functionality of each part of the schema and model setup in the `transactionLogs.ts` file, providing a clear understanding of how transaction logs are structured and stored in the database.
