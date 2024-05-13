export interface FeeDistribution {
  feeAllocations: any[];
  totalPlatformFee: string;
  sourceAmountIn: string;
  sourceAmountOut: string;
  destinationAmountIn: string;
  destinationAmountOut: string;
  salt: string;
  expiry: number;
  signature: string;
}
