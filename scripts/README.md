# fiberEngine.ts

### 1\. `web3(rpcUrl: any)`

- Purpose: Initializes and returns a Web3 instance with a given RPC URL.
- Parameters: `rpcUrl` - The URL of the RPC provider.
- Returns: A new Web3 instance or null if the RPC URL is not provided.

### 2\. `fiberRouterPool(rpcUrl: any, tokenContractAddress: any)`

- Purpose: Creates and returns a new contract instance for interacting with the Fiber Router using a specified token contract address.
- Parameters:
  - `rpcUrl` - The RPC URL to connect to.
  - `tokenContractAddress` - The contract address of the token.
- Returns: A new contract instance.

### 3\. `getTransactionsCount(rpcUrl: any, walletAddress: any)`

- Purpose: Asynchronously fetches and returns the transaction count (nonce) for a specified wallet address.
- Parameters:
  - `rpcUrl` - The RPC URL to connect to.
  - `walletAddress` - The wallet address whose transaction count is being queried.
- Returns: The transaction count or null if the Web3 instance could not be created.

### 4\. `getDeadLine()`

- Purpose: Calculates and returns a deadline time 20 minutes from the current time, used for transactions to ensure they are mined within a certain timeframe.
- Returns: A timestamp indicating the deadline.

### 5\. `withdraw(...)`

- Purpose: Handles the withdrawal process, including liquidity checks and transaction execution based on asset types and network specifics.
- Parameters: Multiple parameters including token addresses, chain IDs, amounts, and other transaction-related information.
- Returns: An object containing transaction details such as hash, amount, and response codes.

### 6\. `swapForAbi(...)`

- Purpose: Prepares and encodes a swap transaction ABI for different types of assets, including handling specific asset types like Foundry, Refinery, and Ionic assets, based on network capabilities (EVM or non-EVM).
- Parameters: Various parameters defining the source and target assets, amounts, and additional data required for the swap.
- Returns: A detailed object including transaction data, nonce, and estimated gas information.

### 7\. `callEVMWithdrawAndGetReceipt(data: any)`

- Purpose: Executes a withdrawal transaction on an EVM compatible blockchain and fetches the transaction receipt.
- Parameters:
  - `data` - The transaction data previously prepared.
- Returns: The transaction receipt, including status and any response messages.

Each function is designed to interact with blockchain networks and handle transactions securely and efficiently, supporting various types of assets and network conditions.

# fiberNode.ts

### Function: `categoriseSwapAssets`

This asynchronous function categorizes and processes asset swaps between source and target blockchains. It uses various helper functions and contracts to facilitate these operations.

#### Parameters:

- `sourceChainId` (any): Identifier for the source blockchain.
- `sourceTokenAddress` (any): Address of the token on the source blockchain.
- `targetChainId` (any): Identifier for the target blockchain.
- `targetTokenAddress` (any): Address of the token on the target blockchain.
- `inputAmount` (any): Amount of the token to be swapped.
- `destinationWalletAddress` (string): Wallet address where the swapped tokens will be sent.
- `gasEstimationDestinationAmount` (string): Estimated gas for the transaction in the destination blockchain.
- `sourceSlippage` (string): Slippage percentage allowed on the source blockchain.
- `destinationSlippage` (string): Slippage percentage allowed on the target blockchain.

#### Core Operations:

1.  Network Information Retrieval: Extracts network-specific configurations for both source and target chains using the provided chain IDs.
2.  Token Contract Initialization: Initializes contracts for both source and target tokens using their respective addresses and network providers.
3.  Asset Type Determination: Determines the type of asset being swapped (e.g., Foundry, Refinery, Ionic, OneInch) based on network and token properties.
4.  Swap Execution: Executes the swap using `OneInchSwap` if necessary, calculates and adjusts for slippage, and handles the results.
5.  Error Handling: Includes conditions for throwing errors related to liquidity or swap availability.

### Function: `delay`

Utility function to create a delay or pause in execution.

#### Parameter:

- `ms` (any): Number of milliseconds to delay.

#### Operation:

Uses JavaScript's `setTimeout` to delay the execution of subsequent code, which is particularly useful for handling asynchronous operations or simulating delays in processing.

### Imported Modules and Helpers:

- Token ABI: Importing ABI for interacting with tokens.
- Ethers Library: Used for creating and interacting with contracts on Ethereum-based blockchains.
- Various helper functions from different modules (`assetTypeHelper`, `dexContractHelper`, `oneInchAxiosHelper`, `liquidityHelper`, `stringHelper`, `fiberNodeHelper`) assist in retrieving asset types, performing DEX operations, handling API calls, checking liquidity, formatting responses, and specific node operations related to the FIBER network.

This script is central to the functioning of the FIBER Engine's backend, particularly in managing the complexities of cross-chain asset swaps with an emphasis on handling different asset types and ensuring sufficient liquidity for successful transactions.
