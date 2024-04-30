# web3ConfigurationHelper.ts

1.  web3 (rpcUrl: string)

    - Purpose: This function initializes a Web3 instance using a provided RPC URL.
    - Parameters:
      - `rpcUrl`: A string that specifies the RPC URL to connect to the Ethereum network.
    - Returns: Returns a new Web3 instance configured with the provided RPC URL if the URL is provided; otherwise, it returns null.
    - Usage: Typically used to establish a connection to a specific Ethereum node.

2.  erc20 (rpcUrl: string, tokenContractAddress: string)

    - Purpose: Configures a Web3 contract instance for interacting with an ERC20 token contract.
    - Parameters:
      - `rpcUrl`: A string indicating the RPC URL to connect to the Ethereum network.
      - `tokenContractAddress`: A string representing the address of the ERC20 token contract on the blockchain.
    - Returns: Returns a Web3 contract instance configured to interact with the specified ERC20 token using the given RPC URL.
    - Usage: Useful for performing operations like transfers, balance checks, and allowance checks on ERC20 tokens.

3.  getfiberAbi()

    - Purpose: Retrieves the ABI (Application Binary Interface) of the Fiber Router smart contract.
    - Returns: Returns the ABI of the Fiber Router contract as defined in the project's artifacts.
    - Usage: This ABI is necessary for interacting with the Fiber Router contract, allowing for operations like contract deployments and function calls.

4.  getfiberSwapInputs()

    - Purpose: Extracts and returns the ABI inputs for the 'Withdrawal' event from the Fiber Router contract.
    - Returns: Returns the ABI inputs specific to the 'Withdrawal' event, which can be used to listen to or decode this event from the blockchain.
    - Usage: Important for applications that need to respond to or handle withdrawals initiated through the Fiber Router.

These functions are essential for setting up and interacting with smart contracts in Ethereum-based applications, particularly within the context of the FIBER Engine Backend infrastructure.

# web3Helper.ts

### 1\. `getTransactionReceipt(txId: string, rpcUrl: string): Promise<any>`

This function asynchronously retrieves the transaction receipt for a given transaction ID (`txId`) from a specified RPC URL (`rpcUrl`). It uses Web3.js to interact with the Ethereum blockchain. The function logs the transaction status and ID to the console and returns the transaction object.

Parameters:

- `txId`: The transaction ID as a string.
- `rpcUrl`: The RPC URL string to connect to an Ethereum node.

Returns:

- A promise that resolves to the transaction receipt object.

Example Usage:

typescript

Copy code

`getTransactionReceipt('transaction_id_here', 'https://mainnet.infura.io/v3/your_project_id');`

### 2\. `getLogsFromTransactionReceipt(tx: any, rcpUrl: string, isOneInch: boolean): any`

This function processes the logs from a transaction receipt to potentially extract and decode event data related to a "WithdrawOneInch" event. It iterates through the logs to find an event that matches the "WithdrawOneInch" event signature and decodes it using the ABI from the contract.

Parameters:

- `tx`: The transaction receipt object.
- `rcpUrl`: The RPC URL string to connect to an Ethereum node.
- `isOneInch`: A boolean indicating whether to look for the "WithdrawOneInch" event.

Returns:

- The decoded log data if a "WithdrawOneInch" event is found; otherwise undefined.

Example Usage:

typescript

Copy code

`const receipt = await getTransactionReceipt('transaction_id_here', 'https://mainnet.infura.io/v3/your_project_id');
const logData = getLogsFromTransactionReceipt(receipt, 'https://mainnet.infura.io/v3/your_project_id', true);`

### 3\. `findSwapEvent(topics: any[], isOneInch: boolean)`

This helper function searches an array of topics to find the index of a "WithdrawOneInch" event topic hash. It generates the SHA3 hash of the event signature and checks if it exists in the provided topics array.

Parameters:

- `topics`: An array of topic strings from the log.
- `isOneInch`: A boolean indicating whether to generate a hash for the "WithdrawOneInch" event.

Returns:

- The index of the "WithdrawOneInch" event topic in the topics array if found; otherwise undefined.

Example Usage:

typescript

Copy code

`const topics = transactionReceipt.logs[0].topics;
const eventIndex = findSwapEvent(topics, true);`

These functions are crucial for interacting with blockchain data, specifically for handling and decoding event logs related to the "WithdrawOneInch" transactions in the FIBER router smart contract.
