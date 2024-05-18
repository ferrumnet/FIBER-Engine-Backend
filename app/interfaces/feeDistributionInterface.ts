export interface FeeDistribution {
  referral: string;
  referralFee: string;
  referralDiscount: string;
  sourceAmountIn: string;
  sourceAmountOut: string;
  destinationAmountIn: string;
  destinationAmountOut: string;
  salt: string;
  expiry: number;
  signature: string;
}
