import { FeeDistribution } from "./feeDistributionInterface";

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
  isCCTP: boolean;
  isStargate: boolean;
}

export interface WithdrawSignedAndSwapOneInch {
  destinationWalletAddress: string;
  destinationAmountIn: string;
  destinationAmountOut: string;
  targetFoundryTokenAddress: string;
  targetTokenAddress: string;
  destinationOneInchData: string;
  salt: string;
  signatureExpiry: number;
  signature: string;
  oneInchSelector: string;
  aggregateRouterContractAddress: string;
  isCCTP: boolean;
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
  isCCTP: boolean;
  feeDistribution: FeeDistribution;
  isStargate: boolean;
}

export interface SwapOneInch {
  amountIn: string;
  amountOut: string;
  targetChainId: string;
  targetTokenAddress: string;
  destinationWalletAddress: string;
  sourceOneInchData: string;
  sourceTokenAddress: string;
  foundryTokenAddress: string;
  withdrawalData: string;
  gasPrice: string;
  sourceWalletAddress: string;
  value: string;
  oneInchSelector: string;
  aggregateRouterContractAddress: string;
  isCCTP: boolean;
  feeDistribution: FeeDistribution;
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
  aggregateRouterContractAddress: string;
}

export interface DestinationGasEstimationResponse {
  gasPriceInNumber: string;
  gasPriceInMachine: string;
}
