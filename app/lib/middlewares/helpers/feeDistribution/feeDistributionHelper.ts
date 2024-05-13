var { Big } = require("big.js");
import { FeeDistribution } from "../../../../interfaces/feeDistributionInterface";
import {
  getFeeDistributionSignature,
  getSaltAndExpiryData,
} from "../feeDistribution/feeDistributionSignatureHelper";
import { getFeeDistributionDataByReferralCode } from "../../../httpCalls/multiSwapAxiosHelper";

export async function getFeeDistributionObject(
  feeDistribution: FeeDistribution,
  network: any,
  sourceAmountIn: string,
  sourceAmountOut: string,
  destinationAmountIn: string,
  destinationAmountOut: string
): Promise<FeeDistribution> {
  try {
    const { salt, expiry } = getSaltAndExpiryData();
    console.log({ salt, expiry });
    const signature = await getFeeDistributionSignature(
      network.foundryTokenAddress,
      network,
      network.fiberRouter,
      feeDistribution,
      salt,
      expiry,
      sourceAmountIn,
      sourceAmountOut,
      destinationAmountIn,
      destinationAmountOut
    );
    feeDistribution.salt = salt;
    feeDistribution.expiry = expiry;
    feeDistribution.signature = signature;
  } catch (e) {
    console.error(e);
  }
  console.log("getFeeDistributionObject", feeDistribution);
  return feeDistribution;
}

export async function getDataAfterCutDistributionFee(
  referralCode: string,
  decimalAmount: any
): Promise<any> {
  let amountAfterCut = decimalAmount;
  let totalPlatformFee = "0";
  let feeAllocations: any = [];
  let data: FeeDistribution = {
    feeAllocations: [],
    totalPlatformFee: "",
    sourceAmountIn: "",
    sourceAmountOut: "",
    destinationAmountIn: "",
    destinationAmountOut: "",
    salt: "",
    expiry: 0,
    signature: "",
  };
  try {
    const response = await getFeeDistributionDataByReferralCode(referralCode);
    if (response?.rateInBps && response?.recipient) {
      const rateInBps = response?.rateInBps;
      const rate = Number(rateInBps) / 100;
      console.log("rate", rate);
      amountAfterCut = await (
        global as any
      ).commonFunctions.addSlippageInDecimal(decimalAmount, rate);
      totalPlatformFee = Big(decimalAmount)
        .minus(Big(amountAfterCut))
        .toString();
      feeAllocations.push({
        recipient: response?.recipient,
        platformFee: totalPlatformFee?.toString(),
      });
    }
    data = {
      feeAllocations: feeAllocations,
      totalPlatformFee: totalPlatformFee,
      sourceAmountIn: "",
      sourceAmountOut: "",
      destinationAmountIn: "",
      destinationAmountOut: "",
      salt: "",
      expiry: 0,
      signature: "",
    };
  } catch (e) {
    console.error(e);
  }
  return {
    amountAfterCut: amountAfterCut,
    data: data,
  };
}

export function convertIntoFeeDistributionObject(
  feeDistribution: FeeDistribution,
  sourceAmountIn: string,
  sourceAmountOut: string,
  destinationAmountIn: string,
  destinationAmountOut: string
): FeeDistribution {
  try {
    feeDistribution.sourceAmountIn = sourceAmountIn;
    feeDistribution.sourceAmountOut = sourceAmountOut;
    feeDistribution.destinationAmountIn = destinationAmountIn;
    feeDistribution.destinationAmountOut = destinationAmountOut;
  } catch (e) {
    console.error(e);
  }
  return feeDistribution;
}
