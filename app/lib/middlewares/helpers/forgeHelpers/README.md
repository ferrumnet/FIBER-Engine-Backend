# forgeContractHelper.ts

1.  forgeContract

    - Purpose: Creates an Ethereum contract instance using ethers.js.
    - Parameters:
      - `provider`: An Ethereum provider.
      - `tokenContractAddress`: Address of the token contract.
    - Returns: An instance of an Ethereum contract with the provided ABI and contract address.

2.  getSigner

    - Purpose: Retrieves a signer (wallet) that is connected to the provided provider.
    - Parameters:
      - `provider`: An Ethereum provider.
    - Returns: A wallet instance that is connected to the provided Ethereum provider.

3.  fiberRouterContract

    - Purpose: Creates an instance of the FiberRouter contract.
    - Parameters:
      - `provider`: An Ethereum provider.
      - `tokenContractAddress`: Address of the FiberRouter contract.
    - Returns: An instance of the FiberRouter contract using the provided ABI and contract address.

4.  destinationFoundaryGasEstimation

    - Purpose: Estimates the gas required for a `withdrawSignedForGasEstimation` operation.
    - Parameters:
      - `contract`: A contract object with necessary details.
      - `network`: Network details including the provider.
      - `obj`: An object containing withdrawal details.
    - Returns: A Promise that resolves to the estimated gas amount.
    - Error Handling: Logs and throws any errors encountered during the operation.

5.  destinationOneInchGasEstimation

    - Purpose: Estimates the gas required for a `withdrawSignedAndSwapOneInchForGasEstimation` operation.
    - Parameters:
      - `contract`: A contract object with necessary details.
      - `network`: Network details including the provider.
      - `obj`: An object containing withdrawal and swap details.
    - Returns: A Promise that resolves to the estimated gas amount.
    - Error Handling: Logs and throws any errors encountered during the operation.

6.  sourceFoundaryGasEstimation

    - Purpose: Estimates the gas required for a `swap` operation on the source foundry.
    - Parameters:
      - `contract`: A contract object with necessary details.
      - `network`: Network details including the provider.
      - `obj`: An object containing swap details.
    - Returns: A Promise that resolves to the estimated gas amount.
    - Error Handling: Logs and throws any errors encountered during the operation.

7.  sourceOneInchGasEstimation

    - Purpose: Estimates the gas required for a `swapAndCrossOneInch` operation including swaps involving Ethereum (ETH).
    - Parameters:
      - `contract`: A contract object with necessary details.
      - `network`: Network details including the provider.
      - `obj`: An object containing swap and cross-chain operation details.
    - Returns: A Promise that resolves to the estimated gas amount.
    - Error Handling: Logs and throws any errors encountered during the operation.

Each function in this file interacts with smart contracts on the Ethereum blockchain using the ethers.js library, and most are designed to estimate gas costs for various operations related to token swaps and withdrawals.
