# gasEstimationHelper.ts

1.  **`getGasForWithdraw(chainId: string, dynamicGasLimit: string): Promise<any>`**

    - **Description**: Retrieves the gas information for a withdrawal transaction based on the given `chainId` and `dynamicGasLimit`.
    - **Parameters**:
      - `chainId`: The ID of the blockchain network.
      - `dynamicGasLimit`: The dynamic gas limit if applicable.
    - **Returns**: A promise that resolves to an object containing gas price details.

2.  **`isAllowedDynamicGasValues(chainId: string): Promise<any>`**

    - **Description**: Checks if dynamic gas values are allowed for the specified `chainId`.
    - **Parameters**:
      - `chainId`: The ID of the blockchain network.
    - **Returns**: A promise that resolves to a boolean indicating whether dynamic gas values are allowed.

3.  **`getGasBuffer(chainId: string, isFromWithdrawal = true): Promise<any>`**

    - **Description**: Retrieves the gas buffer value for the specified `chainId`.
    - **Parameters**:
      - `chainId`: The ID of the blockchain network.
      - `isFromWithdrawal`: A boolean indicating whether the buffer is for withdrawal (default is true).
    - **Returns**: A promise that resolves to the gas buffer value.

4.  **`addBuffer(amount: any, chainId: string, isFromWithdrawal: boolean, extraBuffer = 0): Promise<any>`**

    - **Description**: Adds a buffer to the specified gas amount.
    - **Parameters**:
      - `amount`: The original gas amount.
      - `chainId`: The ID of the blockchain network.
      - `isFromWithdrawal`: A boolean indicating whether the buffer is for withdrawal.
      - `extraBuffer`: Additional buffer to be added (default is 0).
    - **Returns**: A promise that resolves to the new gas amount after adding the buffer.

5.  **`addBuffer_(amount: any, chainId: string, isFromWithdrawal: boolean): Promise<any>`**

    - **Description**: Adds a buffer to the specified gas amount (simplified version).
    - **Parameters**:
      - `amount`: The original gas amount.
      - `chainId`: The ID of the blockchain network.
      - `isFromWithdrawal`: A boolean indicating whether the buffer is for withdrawal.
    - **Returns**: A promise that resolves to the new gas amount after adding the buffer.

6.  **`updateGasPriceEstimations(network: any, maxFeePerGas: any, maxPriorityFeePerGas: any, gasPrice: any): Promise<any>`**

    - **Description**: Updates the gas price estimations for the specified network.
    - **Parameters**:
      - `network`: The network information.
      - `maxFeePerGas`: The maximum fee per gas.
      - `maxPriorityFeePerGas`: The maximum priority fee per gas.
      - `gasPrice`: The gas price.
    - **Returns**: A promise that resolves when the update is complete.

7.  **`getGasPrice(chainId: string): Promise<any>`**

    - **Description**: Retrieves the gas price for the specified `chainId`.
    - **Parameters**:
      - `chainId`: The ID of the blockchain network.
    - **Returns**: A promise that resolves to the gas price.

8.  **`isAllowedAggressivePriceForDynamicGasEstimation(chainId: any, isSource: boolean): Promise<boolean>`**

    - **Description**: Checks if aggressive price for dynamic gas estimation is allowed for the specified `chainId`.
    - **Parameters**:
      - `chainId`: The ID of the blockchain network.
      - `isSource`: A boolean indicating if the check is for the source.
    - **Returns**: A promise that resolves to a boolean indicating whether aggressive price is allowed.

9.  **`isGasPriceSupportedNetwork(chainId: any): boolean`**

    - **Description**: Checks if the network supports gas price.
    - **Parameters**:
      - `chainId`: The ID of the blockchain network.
    - **Returns**: A boolean indicating whether gas price is supported.

10. **`getCCTPGasPrice(chainId: any): Promise<any>`**

    - **Description**: Retrieves the gas price for CCTP for the specified `chainId`.
    - **Parameters**:
      - `chainId`: The ID of the blockchain network.
    - **Returns**: A promise that resolves to the gas price for CCTP.

11. **`valueFixed(x: any, d: any)`**

    - **Description**: Fixes the value to the specified decimal places.
    - **Parameters**:
      - `x`: The value to be fixed.
      - `d`: The number of decimal places.
    - **Returns**: The fixed value.

12. **`getPriceBuffer(chainId: any): Promise<any>`**

    - **Description**: Retrieves the price buffer for the specified `chainId`.
    - **Parameters**:
      - `chainId`: The ID of the blockchain network.
    - **Returns**: A promise that resolves to the price buffer.

# gasFeeHelper.ts

1.  **gasEstimationValidation(req: any): any**

    - Validates the request parameters to ensure all necessary fields for gas estimation are present.
    - Throws errors if any required fields are missing.

2.  **sourceGasEstimation(req: any, destinationGasPrice: string, isSameNetworks: boolean): Promise<any>**

    - Estimates gas for source transactions.
    - Determines if the transaction is within the same network and calls the appropriate estimation function (e.g., `doSourceFoundaryGasEstimation` or `doSourceOneInchGasEstimation`).

3.  **destinationGasEstimation(req: any): Promise<any>**

    - Estimates gas for destination transactions.
    - Generates a salt and expiry, creates a signature, and calls the appropriate estimation function (e.g., `doDestinationFoundaryGasEstimation` or `doDestinationOneInchGasEstimation`).

4.  **doDestinationFoundaryGasEstimation(contract: Contract, network: any, req: any, salt: string, expiry: number, signature: string): Promise<any>**

    - Estimates gas for destination foundary transactions.
    - Prepares a WithdrawSigned object and calls `destinationFoundaryGasEstimation`.

5.  **doDestinationOneInchGasEstimation(contractObj: Contract, network: any, req: any, salt: string, expiry: number, signature: string, targetNetwork: any): Promise<any>**

    - Estimates gas for destination OneInch transactions.
    - Prepares a WithdrawSignedAndSwapOneInch object and calls `destinationOneInchGasEstimation`.

6.  **doSourceFoundaryGasEstimation(contractObj: Contract, network: any, req: any, provider: any, gasPrice: string): Promise<any>**

    - Estimates gas for source foundary transactions.
    - Prepares a Swap object and calls `sourceFoundaryGasEstimation`.

7.  **doSourceOneInchGasEstimation(contractObj: Contract, network: any, req: any, provider: any, gasPrice: string, foundryTokenAddress: string): Promise<any>**

    - Estimates gas for source OneInch transactions.
    - Prepares a SwapOneInch object and calls `sourceOneInchGasEstimation`.

8.  **doSameNetworkGasEstimation(contractObj: Contract, network: any, req: any, provider: any, gasPrice: string, foundryTokenAddress: string): Promise<any>**

    - Estimates gas for same network transactions.
    - Prepares a SwapSameNetwork object and calls `sourceSameNetworkGasEstimation`.

9.  **getForgeSignature(req: any, salt: string, expiry: number, targetNetwork: any): Promise<any>**

    - Creates a signed payment for the transaction.
    - Uses the `createSignedPayment` function and recovers the address using `recoverAddress`.

10. **getExpiry(): number**

    - Returns the expiry timestamp by adding 5 days to the current UTC time.

11. **convertIntoSourceNative(destinationGasPrice: string): Promise<any>**

    - Placeholder function for converting destination gas prices into source native token.

12. **getCurrentGasPrice(chainId: string, provider: any, isSource: boolean): Promise<any>**

    - Retrieves the current gas price for a given chain ID.
    - Determines if aggressive gas price estimation is allowed and fetches the gas price accordingly.

13. **getSourceGasPrices(chainId: string, rpcUrl: string, gasPrice: any, provider: any): Promise<any>**

    - Calculates the source gas prices in native token and USD.

14. **getDestinationGasPrices(chainId: string, rpcUrl: string, gasPrice: any, provider: any, isCCTP: boolean): Promise<any>**

    - Calculates the destination gas prices in native token and USD.
    - Adds a CCTP fee if applicable.

15. **convertIntoSourceGasPrices(chainId: string, rpcUrl: string, destinationGasPricesInUsd: any, provider: any): Promise<any>**

    - Converts destination gas prices into source gas prices in native token and USD.

16. **getSourceAmount(amount: string, address: string, provider: any): Promise<any>**

    - Retrieves the amount in decimal format based on the token's address and chain ID.

17. **addCCTPFee(fee: any, isCCTP: boolean, chainId: string): Promise<any>**

    - Adds a CCTP fee to the gas price if the transaction is CCTP.
