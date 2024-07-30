# forgeContractHelper.ts

1.  **`forgeContract`**

                           - **Purpose**: Initializes a new ethers.Contract instance for a given address using the `forgeAbi`.
                                    - **Parameters**:
                                      - `provider`: Ethereum provider.
                                      - `tokenContractAddress`: Address of the token contract.

2.  **`getSigner`**

                                        - **Purpose**: Retrieves and connects a signer to a provider using a private key from the global environment.
                                        - **Parameters**:
                                          - `provider`: Ethereum provider.

3.  **`fiberRouterContract`**

                                        - **Purpose**: Initializes a new ethers.Contract instance for the Fiber Router contract.
                                        - **Parameters**:
                                          - `provider`: Ethereum provider.
                                          - `tokenContractAddress`: Address of the token contract.

---

#### Gas Estimation Functions

These functions estimate the gas required for different types of transactions.

1.  **`destinationFoundaryGasEstimation`**

        - **Purpose**: Estimates the gas required for a `withdrawSignedForGasEstimation` transaction.
        - **Parameters**:
          - `contract`: Contract instance.
          - `network`: Network details.
          - `obj`: Object of type `WithdrawSigned`.

2.  **`destinationOneInchGasEstimation`**

            - **Purpose**: Estimates the gas required for a `withdrawSignedAndSwapRouterForGasEstimation` transaction.
            - **Parameters**:
              - `contract`: Contract instance.
              - `network`: Network details.
              - `obj`: Object of type `WithdrawSignedAndSwapOneInch`.

3.  **`sourceFoundaryGasEstimation`**

            - **Purpose**: Estimates the gas required for a `swapSigned` transaction.
            - **Parameters**:
              - `contract`: Contract instance.
              - `network`: Network details.
              - `obj`: Object of type `Swap`.

4.  **`sourceOneInchGasEstimation`**

                - **Purpose**: Estimates the gas required for a `swapSignedAndCrossRouter` transaction.
                - **Parameters**:
                  - `contract`: Contract instance.
                  - `network`: Network details.
                  - `obj`: Object of type `SwapOneInch`.

5.  **`sourceSameNetworkGasEstimation`**

                - **Purpose**: Estimates the gas required for a `swapOnSameNetworkETH` transaction.
                - **Parameters**:
                  - `contract`: Contract instance.
                  - `network`: Network details.
                  - `obj`: Object of type `SwapOneInch`.

# forgeSignatureHelper.ts

### 1\. createSignedPayment

#### Description

Creates a signed payment transaction.

#### Parameters

- `chainId` (string): Blockchain network ID.
- `payee` (string): Address of the payee.
- `amount` (string): Payment amount.
- `targetToken` (string): Address of the target token.
- `contractAddress` (string): Address of the contract.
- `salt` (string): Unique identifier for the transaction.
- `destinationAssetType` (string): Type of the asset being transferred.
- `amountIn` (string): Input amount for swapping.
- `amountOut` (string): Output amount for swapping.
- `targetFoundaryToken` (string): Target foundry token address.
- `routerCalldata` (string): Calldata for the router.
- `expiry` (number): Expiry time for the transaction.
- `web3` (Web3): Web3 instance.
- `aggregateRouterContractAddress` (string): Address of the aggregate router contract.

#### Returns

- `signature` (string): The signature of the transaction.
- `hash` (string): The transaction hash.

### 2\. produceFoundaryHash

#### Description

Produces a hash for a Foundary transaction.

#### Parameters

- `web3` (Web3): Web3 instance.
- `chainId` (string): Blockchain network ID.
- `contractAddress` (string): Address of the contract.
- `token` (string): Token address.
- `payee` (string): Payee address.
- `amount` (string): Amount to be paid.
- `salt` (string): Unique identifier for the transaction.
- `expiry` (number): Expiry time for the transaction.

#### Returns

- `hash` (string): The generated hash.

### 3\. produceOneInchHash

#### Description

Produces a hash for a 1Inch transaction.

#### Parameters

- `web3` (Web3): Web3 instance.
- `chainId` (string): Blockchain network ID.
- `contractAddress` (string): Address of the contract.
- `payee` (string): Payee address.
- `amountIn` (string): Input amount.
- `amountOut` (string): Output amount.
- `foundryToken` (string): Foundry token address.
- `targetToken` (string): Target token address.
- `routerCalldata` (string): Router calldata.
- `salt` (string): Unique identifier for the transaction.
- `expiry` (number): Expiry time for the transaction.
- `aggregateRouterContractAddress` (string): Address of the aggregate router contract.

#### Returns

- `hash` (string): The generated hash.

### 4\. domainSeparator

#### Description

Generates a domain separator for EIP-712.

#### Parameters

- `web3` (Web3): Web3 instance.
- `chainId` (string): Blockchain network ID.
- `contractAddress` (string): Address of the contract.

#### Returns

- `hash` (string): The domain separator hash.

### 5\. getPrivateKey

#### Description

Retrieves the private key from the environment.

#### Returns

- `privateKey` (string): The private key.

### 6\. fixSig

#### Description

Fixes the signature format by adjusting the `v` value.

#### Parameters

- `sig` (string): The signature string.

#### Returns

- `fixedSig` (string): The fixed signature.

### 7\. recoverAddress

#### Description

Recovers the address from a given signature and hash.

#### Parameters

- `signature` (string): The signature.
- `hash` (string): The hash.

#### Returns

- `boolean`: `true` if the address is recovered successfully, `false` otherwise.
