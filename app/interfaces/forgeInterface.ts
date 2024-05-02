export interface Contract {
  rpcUrl: string;
  contractAddress: string;
}

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

export interface Swap {
  sourceTokenAddress: string;
  amount: string;
  targetChainId: string;
  targetTokenAddress: string;
  destinationWalletAddress: string;
  withdrawalData: string;
  sourceWalletAddress: string;
  value: string;
}

export interface SwapRouter {
  amountIn: string;
  minAmountOut: string;
  sourceTokenAddress: string;
  foundryTokenAddress: string;
  sourceAggregatorRouterAddress: string;
  sourceAggregatorRouterCalldata: string;
  targetChainId: string;
  targetTokenAddress: string;
  destinationWalletAddress: string;
  withdrawalData: string;
  cctpType: boolean;
  gasPrice: string;
  sourceWalletAddress: string;
  value: string;
}

export interface SwapSameNetwork {
  amountIn: string;
  amountOut: string;
  sourceTokenAddress: string;
  targetTokenAddress: string;
  destinationWalletAddress: string;
  destinationOneInchData: string;
  sourceWalletAddress: string;
  value: string;
  oneInchSelector: string;
}

export interface DestinationGasEstimationResponse {
  gasPriceInNumber: string;
  gasPriceInMachine: string;
}
