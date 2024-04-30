# dynamicGasFeeEstimationHelper.ts

### 1\. `gasEstimationValidation(req: any): any`

Validates the necessary request query parameters for gas estimation. It checks for the presence of parameters related to both the source and destination of a transaction, including network chain IDs, wallet addresses, token contract addresses, amounts, and asset types. If any parameter is missing, an error is thrown.

### 2\. `sourceGasEstimation(req: any, destinationGasPrice: string): Promise<any>`

Estimates the gas price for transactions originating from the source network. It identifies the asset type and calls the respective gas estimation function (either Foundary or One Inch) based on it. The function returns the calculated gas prices and limits.

### 3\. `destinationGasEstimation(req: any): Promise<any>`

Estimates the gas price for transactions destined for the target network. Similar to `sourceGasEstimation`, it calculates based on the asset type involved in the transaction, also considering signature data and expiry times.

### 4\. `doDestinationFoundaryGasEstimation(contract: Contract, network: any, req: any, salt: string, expiry: number, signature: string): Promise<any>`

A helper function to estimate gas for transactions involving the Foundary asset type at the destination. It constructs a transaction object and calls the underlying Foundary gas estimation function.

### 5\. `doDestinationOneInchGasEstimation(contractObj: Contract, network: any, req: any, salt: string, expiry: number, signature: string, targetNetwork: any): Promise<any>`

Similar to the Foundary version, this function estimates the gas for transactions involving the One Inch asset type at the destination. It constructs a different transaction object suitable for One Inch transactions.

### 6\. `doSourceFoundaryGasEstimation(contractObj: Contract, network: any, req: any, provider: any, gasPrice: string): Promise<any>`

Estimates gas costs for transactions involving the Foundary asset type originating from the source network. It constructs the transaction object based on source parameters and invokes the respective gas estimation function.

### 7\. `doSourceOneInchGasEstimation(contractObj: Contract, network: any, req: any, provider: any, gasPrice: string, foundryTokenAddress: string): Promise<any>`

Estimates gas for transactions involving the One Inch asset type originating from the source network. It also considers additional parameters like the foundry token address.

### 8\. `getForgeSignature(req: any, salt: string, expiry: number, targetNetwork: any): Promise<any>`

Generates a cryptographic signature for transactions, which is essential for executing secure blockchain transactions. It utilizes parameters like the destination network, wallet address, and transaction amount for this purpose.

### 9\. `getExpiry(): number`

Returns a timestamp representing the expiry time of a transaction, set to 5 days from the current moment in UTC.

### Helper Functions:

- `getCurrentGasPrice(provider: any): Promise<any>`
- `getSourceGasPrices(chainId: string, rpcUrl: string, gasPrice: any, provider: any): Promise<any>`
- `getDestinationGasPrices(chainId: string, rpcUrl: string, gasPrice: any, provider: any): Promise<any>`
- `convertIntoSourceGasPrices(chainId: string, rpcUrl: string, destinationGasPricesInUsd: any, provider: any): Promise<any>`
- `getSourceAmount(amount: string, address: string, provider: any): Promise<any>`

These functions handle various utilities such as retrieving current gas prices, converting gas prices between different units, and calculating adjusted gas prices based on current market conditions.

# gasEstimationHelper.ts

### Function: `getGasForWithdraw`

- Parameters:
  - `chainId`: A string representing the chain ID.
  - `dynamicGasLimit`: A string indicating whether the gas limit is dynamic.
- Returns: A promise that resolves to an object containing gas fee details.
- Description: This function retrieves the necessary gas parameters for withdrawal operations based on the chain ID provided. It checks if dynamic gas values are allowed and, accordingly, fetches the max fee per gas and max priority fee per gas from the database, adjusting the gas limit based on whether a dynamic value is provided.

### Function: `getGasForSwap`

- Parameters:
  - `chainId`: Represents the chain ID.
  - `from`: The originating address of the swap.
- Returns: A promise resolving to an object with gas fee details.
- Description: Similar to `getGasForWithdraw`, but this function is tailored for swap operations. It retrieves and calculates the necessary gas fees based on the chain ID and whether dynamic gas values are allowed for the given chain.

### Function: `isAllowedDynamicGasValues`

- Parameters:
  - `chainId`: A string that represents the chain ID.
- Returns: A promise that resolves to a boolean indicating if dynamic gas values are allowed for the given chain ID.
- Description: Checks and returns whether dynamic gas limits are permitted for a specific blockchain based on the provided chain ID.

### Function: `getGasBuffer`

- Parameters:
  - `chainId`: A string representing the chain ID.
  - `isFromWithdrawal`: A boolean to determine whether the buffer is for a withdrawal operation.
- Returns: A promise that resolves to an integer representing the gas buffer amount.
- Description: Fetches the gas buffer value from the database. The buffer value differs based on whether the function is called for a withdrawal or other gas estimation purposes.

### Function: `addBuffer`

- Parameters:
  - `amount`: The initial amount of gas.
  - `chainId`: A string representing the chain ID.
  - `isFromWithdrawal`: A boolean indicating if the buffer is for withdrawal.
- Returns: A promise that resolves to the adjusted gas limit amount after applying the buffer.
- Description: Calculates and returns the new gas limit amount after adding a predetermined buffer to the initial amount. This buffer helps accommodate fluctuations in gas requirements.

### Function: `addBuffer_`

- Parameters:
  - `amount`: The initial amount of gas.
  - `chainId`: A string representing the chain ID.
  - `isFromWithdrawal`: A boolean indicating if the buffer is for withdrawal.
- Returns: A promise that resolves to the adjusted gas limit amount after applying the buffer.
- Description: Similar to `addBuffer`, but serves as an alternative or supplementary function for calculating the buffered gas amount. It logs the before and after buffer values for debugging purposes.
