# feeDistributionHelper.ts

1.  **getFeeDistributionObject**

    - **Description:** Generates a fee distribution object by calculating the signature, salt, and expiry.
    - **Parameters:**
      - `feeDistribution` (FeeDistribution): The fee distribution data.
      - `network` (any): The network details.
      - `sourceAmountIn`, `sourceAmountOut`, `destinationAmountIn`, `destinationAmountOut` (string): Transaction amounts.
    - **Returns:** A promise that resolves to a FeeDistribution object.

2.  **getDataAfterCutDistributionFee**

    - **Description:** Calculates the amount after deducting the distribution fee and retrieves associated data.
    - **Parameters:**
      - `referralCode` (string): The referral code.
      - `sourceWalletAddress` (string): The wallet address of the source.
      - `decimalAmount` (any): The amount in decimals.
      - `foundaryDecimals` (any): The foundry decimals.
    - **Returns:** A promise that resolves to an object containing `amountAfterCut`, `totalFee`, and `data`.

3.  **convertIntoFeeDistributionObject**

    - **Description:** Converts raw fee distribution data into a structured FeeDistribution object.
    - **Parameters:**
      - `feeDistribution` (FeeDistribution): The fee distribution data.
      - `sourceAmountIn`, `sourceAmountOut`, `destinationAmountIn`, `destinationAmountOut` (string): Transaction amounts.
    - **Returns:** A FeeDistribution object.

4.  **getReferralData**

    - **Description:** Retrieves referral data based on the referral code and source wallet address.
    - **Parameters:**
      - `referralCode` (string): The referral code.
      - `sourceWalletAddress` (string): The wallet address of the source.
      - `totalPlatformFee` (any): The total platform fee.
    - **Returns:** A promise that resolves to an object containing referral data and updated total platform fee.

5.  **getSourceAmountWithFee**

    - **Description:** Calculates the source amount by adding the fee.
    - **Parameters:**
      - `amount` (string): The original amount.
      - `fee` (string): The fee to be added.
    - **Returns:** The amount after adding the fee.

6.  **isValidAmountSwap**

    - **Description:** Checks if the amount is valid for swapping based on the platform fee.
    - **Parameters:**
      - `amount` (any): The amount to be checked.
      - `pf` (any): The platform fee.
    - **Returns:** A boolean indicating whether the amount is valid for swapping.

7.  **getPlatformFeeInNumber**

    - **Description:** Converts the platform fee into a numerical representation.
    - **Parameters:**
      - `pf` (any): The platform fee.
    - **Returns:** The platform fee as a number.

#### Imports and Dependencies

- **Big.js:** A library for arbitrary-precision decimal arithmetic.
- **FeeDistribution:** An interface that defines the structure of the fee distribution object.
- **Helpers:**
  - `getFeeDistributionSignature`
  - `getSaltAndExpiryData`
  - `getFeeDistributionDataByReferralCode`
  - `getPlatformFee`
  - `invalidPlatformFee`
- **Common Functions:** Various utility functions used throughout the file.

#### Constants

- **emptyReferral:** A constant representing an empty referral address (`0x0000000000000000000000000000000000000000`).

#### Error Handling

Each function includes try-catch blocks to handle errors gracefully and log them for debugging purposes.

# feeDistributionSignatureHelper.ts

##### getFeeDistributionSignature

- **Description**: This function generates a cryptographic signature for the fee distribution data using a given private key. The signature ensures the integrity and authenticity of the fee distribution data.
- **Parameters**:
  - `data` (object): The fee distribution data that needs to be signed. This typically includes details such as the amount, recipient addresses, and distribution percentages.
  - `privateKey` (string): The private key used to sign the data. This key should be kept secure and not shared.
- **Returns**: A string representing the cryptographic signature. This signature can be used to verify the authenticity of the fee distribution data.

##### verifyFeeDistributionSignature

- **Description**: This function verifies the cryptographic signature for the fee distribution data using the corresponding public key. It checks if the provided signature matches the expected signature for the given data.
- **Parameters**:
  - `data` (object): The fee distribution data that was signed.
  - `signature` (string): The cryptographic signature to verify.
  - `publicKey` (string): The public key used to verify the signature. This key corresponds to the private key used to generate the signature.
- **Returns**: A boolean indicating whether the signature is valid (`true`) or invalid (`false`).
