# fiberEngineInterface.ts

1.  WithdrawSigned Interface

    - `targetTokenAddress`: String that represents the address of the token to be withdrawn.
    - `destinationWalletAddress`: String indicating the wallet address where the token is to be sent.
    - `destinationAmountIn`: String specifying the amount of the token to be transferred to the destination.
    - `salt`: A string used for hashing to ensure the uniqueness and security of the transaction.
    - `signatureExpiry`: Number representing the timestamp until which the signature remains valid.
    - `signature`: String representing the cryptographic signature verifying the transaction.

2.  WithdrawSignedAndSwapOneInch Interface

    - `destinationWalletAddress`: String indicating the wallet address to receive the output of the swap.
    - `destinationAmountIn`: String specifying the amount to be received at the destination before the swap.
    - `destinationAmountOut`: String specifying the expected amount after the swap is executed.
    - `targetFoundryTokenAddress`: String representing the address of the token being used in the foundry for this transaction.
    - `targetTokenAddress`: String representing the address of the token to be swapped.
    - `destinationOneInchData`: String containing the data required to execute the swap via 1inch.
    - `salt`: A string used for hashing to ensure the uniqueness and security of the transaction.
    - `signatureExpiry`: Number indicating the expiration time of the transaction signature.
    - `signature`: String representing the cryptographic signature to authenticate the transaction.

3.  SwapOneInch Interface

    - `amountIn`: String indicating the amount of token input for the swap.
    - `amountOut`: String indicating the expected amount of token to be received after the swap.
    - `targetChainId`: String representing the blockchain ID where the swap is to be executed.
    - `targetTokenAddress`: String representing the token address intended for the swap.
    - `destinationWalletAddress`: String indicating the destination wallet address for the swap output.
    - `sourceOneInchData`: String containing the data for the swap sourced from 1inch.
    - `sourceTokenAddress`: String representing the address of the token being swapped.
    - `foundryTokenAddress`: String representing the foundry token involved in the transaction.
    - `withdrawalData`: String detailing additional data related to the withdrawal process.
    - `gasPrice`: String specifying the gas price to be used for executing the transaction.

4.  WithdrawOneInchLogs Interface

    - `"2"`: String used to store log data related to withdrawals using 1inch, indexed by `"2"` which likely represents a specific log type or identifier.

These interfaces outline the structures used for handling various cryptocurrency transactions, including withdrawals and swaps through the 1inch service within the FIBER Engine Backend system.

# forgeInterface.ts

### Interface: `Contract`

- rpcUrl: A string specifying the URL of the RPC endpoint to connect to.
- contractAddress: A string that holds the address of the contract.

### Interface: `WithdrawSigned`

- targetTokenAddress: A string representing the address of the token to withdraw.
- destinationWalletAddress: A string indicating the wallet address where the token will be sent.
- destinationAmountIn: A string specifying the amount of the token to be withdrawn.
- salt: A string used for security purposes during the transaction.
- signatureExpiry: An integer representing the expiration time of the signature in milliseconds.
- signature: A string representing the cryptographic signature verifying the transaction.

### Interface: `WithdrawSignedAndSwapOneInch`

- destinationWalletAddress: A string indicating the wallet address where tokens are sent.
- destinationAmountIn: A string specifying the amount of tokens received.
- destinationAmountOut: A string specifying the amount of tokens after swap.
- targetFoundryTokenAddress: A string indicating the address of the Foundry token involved in the swap.
- targetTokenAddress: A string representing the target token's address for swapping.
- destinationOneInchData: A string containing data specific to the One Inch swap service.
- salt: A string used for added security during the transaction.
- signatureExpiry: An integer detailing when the signature becomes invalid.
- signature: A cryptographic string confirming the authenticity of the transaction.

### Interface: `Swap`

- sourceTokenAddress: A string representing the address of the token being swapped.
- amount: A string indicating the amount of the token to swap.
- targetChainId: A string representing the ID of the target blockchain.
- targetTokenAddress: A string indicating the address of the token to receive in the swap.
- destinationWalletAddress: A string indicating where the swapped tokens will be sent.
- withdrawalData: A string containing additional data required for the withdrawal process.
- sourceWalletAddress: A string representing the wallet address from which tokens are being swapped.
- value: A string representing the transaction value in the smallest unit of the token.

### Interface: `SwapOneInch`

- amountIn: A string specifying the amount of the token entering the swap.
- amountOut: A string specifying the amount of the token exiting the swap.
- targetChainId: A string that identifies the blockchain where the swap will occur.
- targetTokenAddress: A string indicating the token to be received from the swap.
- destinationWalletAddress: A string indicating the wallet address receiving the swapped token.
- sourceOneInchData: A string containing data relevant to the One Inch exchange for the swap.
- sourceTokenAddress: A string representing the token address being swapped.
- foundryTokenAddress: A string representing the address of the Foundry token involved in the swap.
- withdrawalData: A string containing additional data required for the withdrawal process.
- gasPrice: A string indicating the price of gas for the transaction.
- sourceWalletAddress: A string representing the wallet from where the swap is initiated.
- value: A string indicating the value of the swap in the smallest unit of the currency.

### Interface: `DestinationGasEstimationResponse`

- gasPriceInNumber: A string indicating the estimated gas price as a number.
- gasPriceInMachine: A string indicating the estimated gas price in machine-readable format.

This documentation provides an overview of each interface's properties, describing their use and the type of data they handle within the FIBER engine backend.
