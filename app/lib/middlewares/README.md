# common.ts

1.  getHashedPassword(password: any): Generates a SHA-256 hash of the provided password and encodes it in base64 format.

2.  createToken(object: any, expiresIn: any): Creates a JWT (JSON Web Token) using the provided object and expiration settings. It uses a secret from the environment variables.

3.  decodeAPiToken(token: any): Decodes a JWT using a secret from the environment variables.

4.  getValueFromStringsPhrase(queryKey: any): Reads a local JSON file (`stringsPhrase.json`) and retrieves a value based on the provided query key.

5.  encryptApiKey(data: any): Encrypts the provided data using AES encryption with a secret from the environment variables.

6.  decryptApiKey(data: any): Decrypts AES-encrypted data using a secret from the environment variables.

7.  getProvider(rpc: any): Initializes and returns a JSON RPC provider based on the provided RPC URL.

8.  getDexContract(item: any): Creates and returns a smart contract instance for interacting with a decentralized exchange using the ethers library.

9.  getFundManagerContract(item: any): Creates and returns a smart contract instance for a fund manager contract using the ethers library.

10. getFiberRouterContract(item: any): Creates and returns a smart contract instance for a fiber router contract using the ethers library.

11. convertIntoFIBERNetworks(networks: any): Processes a list of networks and enriches them with additional blockchain-related information, including setting up contract instances if applicable.

12. getNetworkByChainId(chainId: any): Retrieves a network configuration from a global list based on the provided chain ID.

13. amountConversion(amount: any): Placeholder function currently implemented without operations.

14. amountToHuman(rpcUrl: any, tokenContractAddress: any, amount: number): Converts a token amount to a human-readable format based on the token's decimal places.

15. decimals(provider: any, tokenContractAddress: any): Retrieves the number of decimals for a token from a smart contract.

16. numberIntoDecimals(amount: any, decimal: any): Converts an amount to its smallest unit based on the token's decimal places using ethers utility functions.

17. numberIntoDecimals\_(amount: any, decimal: any): A variation of the number conversion to decimal units, implementing it manually.

18. numberIntoDecimals\_\_(amount: any, decimal: any): Another variation of the number conversion, using the Big.js library for precision.

19. decimalsIntoNumber(amount: any, decimal: any): Converts a number from its smallest unit based on decimals to a normal readable number using ethers utility functions.

20. addSlippageInDecimal(originalValue: any, slippage: any): Adjusts a numeric value by a specified slippage percentage in decimal form.

21. addSlippageInNumber(originalValue: any): Adjusts a numeric value by a specified slippage percentage in whole numbers.

22. encrypt(data: string, key: string): Encrypts data using AES encryption with a provided key.

23. decrypt(data: string, key: string): Decrypts AES-encrypted data using a provided key.

24. getPrivateKey(): Retrieves a private key from environment variables by decrypting it.

25. setPrivateKey(): Sets a global private key by decrypting and storing it from environment variables.

26. getWrappedNativeTokenAddress(address: string, chainId: string): Retrieves a wrapped token address for a native token based on its chain ID.

27. getOneInchTokenAddress(address: string): Retrieves a token address for interacting with the 1inch protocol.

28. isNativeToken(address: string): Checks if a token is native based on its address.

29. getTokenByChainId(chainId: string): Retrieves a token configuration based on its blockchain chain ID.

This comprehensive set of functions is instrumental for interacting with various blockchain components and managing API tokens securely.

# pagination.ts

### Middleware Function for Pagination

- Location: `app/lib/middlewares/pagination.ts`

`module.exports = function () {
  return function (req: any, res: any, next: any) {
    req.query.limit = parseInt(req.query.limit) || 10;
    req.query.offset = parseInt(req.query.offset) || 0;
    next();
  }
}`

#### Description

This is an exported middleware function that sets up default pagination parameters in the request object.

#### Parameters

- req (any): The HTTP request object. This function expects `req.query.limit` and `req.query.offset` to possibly contain string values that should be converted to integers.
- res (any): The HTTP response object. This function does not directly use the `res` parameter but it's included as middleware often requires it.
- next (any): The callback function to pass control to the next middleware function in the stack.

#### Behavior

1.  Limit Parameter: The function reads `req.query.limit` and tries to convert it to an integer. If `req.query.limit` is not present or is an invalid number, it defaults to `10`.
2.  Offset Parameter: Similar to `limit`, the function attempts to convert `req.query.offset` to an integer. If it's absent or invalid, it defaults to `0`.
3.  Pass Control: After setting these pagination parameters, the function calls `next()` to pass control to the next middleware function in the Express middleware stack.

#### Use Case

This middleware is useful in scenarios where API endpoints need to support pagination to limit the number of records returned, helping to optimize response times and reduce the load on the server.

#### Notes

- The use of `any` type for `req`, `res`, and `next` implies that there is no type safety enforced for these parameters, which could lead to runtime errors if incorrect types are passed. It's typically better to use specific types from the Express type definitions.

# utils.ts

### Declarations and Imports

- Variables (`db`, `asyncMiddleware`, etc.): The file starts with declarations of various utilities and helpers such as database access (`db`), middleware functionalities (`asyncMiddleware`), and several helpers for different purposes like authorization, signature validation, and network communications. These are declared as constants but without specific types or initial values, suggesting they might be imported or configured elsewhere in the application.

### Module Exports

The file defines a module that exports a single function which configures and returns an object named `utils` with various properties and one function:

- `IS_LOCAL_ENV`: A boolean flag, set to `true`, indicating whether the environment is local or not.

- `CONTRACT_NAME`: A string constant `"FUND_MANAGER"`, likely indicating the name of a blockchain contract that the application interacts with.

- `CONTRACT_VERSION`: A string representing the version of the contract, `"000.004"` in this case.

- `cFRMTokenAddress`: Ethereum address for the cFRM token, specified as `"0xe685d3cc0be48bd59082ede30c3b64cbfc0326e2"`.

- `arbitrumChainID`: Specifies the Arbitrum chain ID used by the application, set to `42161`.

- `assetType`: An object mapping different asset types such as `"Foundary"`, `"Refinery"`, `"Ionic"`, and `"1Inch"`. This is likely used to categorize or handle different types of transactions or interactions within the application.

- `convertFromExponentialToDecimal(n: any)`: A utility function that converts numbers from exponential notation to a decimal string format. This function handles negative values, checks if the number is in exponential format, and then performs conversion based on the exponent value. It's useful for displaying numbers stored in formats that may not be user-friendly.

### Return Value

- The function returns the `utils` object populated with the aforementioned properties and utility functions. This object can be used throughout the application wherever these utilities are needed.

This structure suggests that the file is crucial for setting up some basic utilities and constants that are used across the application, especially in dealing with blockchain interactions and network configurations.
