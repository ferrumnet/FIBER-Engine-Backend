# cctpContractHelper.ts

1.  **cctpContract(provider: any, tokenContractAddress: any)**

        - **Description**: Creates an instance of the CCTP contract.
        - **Parameters**:
          - `provider`: The provider to interact with the Ethereum network.
          - `tokenContractAddress`: The address of the token contract.
        - **Returns**: An instance of `ethers.Contract`.
        `const cctpContract = (provider: any, tokenContractAddress: any) => {

    return new ethers.Contract(
    tokenContractAddress,
    cctpMessageTransmitter.abi,
    provider
    );
    };`

2.  **getSigner(provider: any)**

        - **Description**: Retrieves a signer using the private key from the global environment and connects it to the provider.
        - **Parameters**:
          - `provider`: The provider to connect the signer to.
        - **Returns**: A signer connected to the provider.
        `const getSigner = (provider: any) => {

    var signer = new ethers.Wallet((global as any).environment.PRI_KEY);
    return signer.connect(provider);
    };`

3.  **messageTransmitter(contract: Contract, network: any, messageBytes: string, attestationSignature: string): Promise<boolean>**

        - **Description**: Transmits a message using the CCTP message transmitter contract.
        - **Parameters**:
          - `contract`: The contract interface.
          - `network`: The network configuration.
          - `messageBytes`: The message in bytes to be transmitted.
          - `attestationSignature`: The attestation signature for the message.
        - **Returns**: A promise that resolves to `true` if the message transmission is successful, and `false` otherwise.

### Usage

1.  **Instantiating a CCTP Contract**:
    `const contractInstance = cctpContract(provider, tokenContractAddress);`

2.  **Getting a Signer**:
    `const signer = getSigner(provider);`

3.  **Transmitting a Message**:
    `const success = await messageTransmitter(contract, network, messageBytes, attestationSignature);
if (success) {
  console.log("Message transmitted successfully.");
} else {
  console.log("Message transmission failed.");
}`

# cctpHelper.ts

### `getIsCCTP`

**Description:** This function checks if the provided `isCCTPType` parameter indicates a CCTP type. It considers both boolean `true` and string `"true"` as valid CCTP types.

**Parameters:**

- `isCCTPType`: A value indicating whether it is a CCTP type. It can be of any type.

**Returns:**

- `boolean`: Returns `true` if `isCCTPType` is `true` or `"true"`, otherwise returns `false`.

### `getForgeFundManager`

**Description:** This function retrieves the appropriate fund manager based on whether CCTP is enabled.

**Parameters:**

- `isCCTP`: A boolean indicating if CCTP is enabled.
- `network`: An object containing network configurations.

**Returns:**

- `string`: Returns the `forgeCCTPFundManager` if `isCCTP` is `true`, otherwise returns `forgeFundManager`.

### `getAttestation`

**Description:** This asynchronous function retrieves an attestation for a given message hash by making repeated API calls until a complete status is received or the threshold count is reached.

**Parameters:**

- `mesgHash`: A string representing the message hash for which the attestation is to be retrieved.

**Returns:**

- `Promise<string>`: Returns a promise that resolves to the attestation string if found, otherwise an empty string.

### `delay`

**Description:** This helper function creates a delay of 10 seconds. It is used to pause execution between repeated API calls in the `getAttestation` function.

**Parameters:**

- None

**Returns:**

- `Promise<void>`: Returns a promise that resolves after 10 seconds.
