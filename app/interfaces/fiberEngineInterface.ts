export interface WithdrawSigned {
  targetTokenAddress: string;
  destinationWalletAddress: string;
  destinationAmountIn: string;
  salt: string;
  signatureExpiry: number;
  signature: string;
}

export interface WithdrawSignedAndSwapRouter {
  destinationWalletAddress: string;
  destinationAmountIn: string;
  destinationAmountOut: string;
  targetFoundryTokenAddress: string;
  targetTokenAddress: string;
  destinationAggregatorRouterAddress: string;
  destinationAggregatorRouterCalldata: string;
  salt: string;
  signatureExpiry: number;
  signature: string;
  cctpType: boolean;
}

export interface SwapRouter {
  amountIn: string;
  minAmountOut: string;
  sourceTokenAddress: string;
  foundryTokenAddress: string;
  aggregatorRouterAddress: string;
  aggregatorRouterCalldata: string;
  targetChainId: string;
  targetTokenAddress: string;
  destinationWalletAddress: string;
  withdrawalData: string;
  cctpType: boolean;
  gasPrice: string;
}

export interface SwapSameNetwork {
  amountIn: string;
  amountOut: string;
  sourceTokenAddress: string;
  targetTokenAddress: string;
  destinationWalletAddress: string;
  destinationOneInchData: string;
  sourceWalletAddress: string;
  oneInchSelector: string;
}

export interface WithdrawOneInchLogs {
  "2": string;
}
