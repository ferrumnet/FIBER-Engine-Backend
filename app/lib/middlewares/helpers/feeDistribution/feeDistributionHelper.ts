var { Big } = require("big.js");
import { FeeDistribution } from "../../../../interfaces/feeDistributionInterface";
import {
  getFeeDistributionSignature,
  getSaltAndExpiryData,
} from "../feeDistribution/feeDistributionSignatureHelper";
import { getFeeDistributionDataByReferralCode } from "../../../httpCalls/multiSwapAxiosHelper";
import { getPlatformFee } from "../configurationHelper";
import { invalidPlatformFee } from "../stringHelper";
const common = (global as any).commonFunctions;

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
    const pf = await getPlatformFee();
    if (!pf) {
      return {
        error: invalidPlatformFee,
      };
    }
    amountAfterCut = common.getAmountAfterCut(decimalAmount, pf);
    totalPlatformFee = Big(decimalAmount).minus(Big(amountAfterCut)).toString();
    console.log(
      "amountAfterCut",
      amountAfterCut,
      "totalPlatformFee",
      totalPlatformFee,
      "totalPlatformFee%",
      pf
    );
    const feeAllocations: any = await getFeeAllocations(
      referralCode,
      totalPlatformFee
    );
    data = {
      feeAllocations: feeAllocations ? feeAllocations : [],
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

export async function getFeeAllocations(
  referralCode: string,
  totalPlatformFee: any
) {
  let feeAllocations: any = [];
  try {
    const response = await getFeeDistributionDataByReferralCode(referralCode);
    if (response?.rateInBps && response?.recipient) {
      const rateInBps = response?.rateInBps;
      let rate = Number(rateInBps) / 100;
      console.log("rate", rate);
      if (rate >= 100) {
        rate = 0;
      }
      const award = common.getAmountAfterCut(
        totalPlatformFee?.toString(),
        rate
      );
      console.log("awardForRecipient", award);
      feeAllocations.push({
        recipient: response?.recipient,
        platformFee: award,
      });
    }
  } catch (e) {
    console.log(e);
  }
  return feeAllocations;
}
