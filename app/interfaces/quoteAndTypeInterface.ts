export interface SourceCrossNetowrObject {
  sourceAssetType: any;
  sourceAmountInNumber: any;
  sourceCallData: any;
  sourceAmountIn: any;
  sourceAmountOut: any;
  feeDistribution: any;
  sourceSlippageInNumber: "0";
  totalPlatformFee: "0";
  totalPlatformFeeInNumber: any;
  usdcAmount: any;
}

export interface DestinationCrossNetowrObject {
  targetAssetType: any;
  destinationCallData: any;
  destinationAmountOutInNumber: any;
  minDestinationAmountOut: any;
  destinationAmountIn: any;
  destinationAmountOut: any;
  targetFoundryTokenAddress: any;
  isCCTP: boolean;
  isStargate: boolean;
  usdcAmount: any;
}
