export interface WithdrawSigned {
  targetTokenAddress: string;
  destinationWalletAddress: string;
  destinationAmountIn: string;
  salt: string;
  signatureExpiry: number;
  signature: string;
}

export interface WithdrawSignedAndSwapOneInch {
  destinationWalletAddress: string;
  destinationAmountIn: string;
  destinationAmountOut: string;
  targetFoundryTokenAddress: string;
  targetTokenAddress;
  destinationOneInchData: string;
  salt: string;
  signatureExpiry: number;
  signature: string;
}
