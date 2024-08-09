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
const emptyReferral = "0x0000000000000000000000000000000000000000";

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
  sourceWalletAddress: string,
  decimalAmount: any,
  foundaryDecimals: any
): Promise<any> {
  let amountAfterCut = decimalAmount;
  let totalFee: any = "0";
  let data: FeeDistribution = {
    referral: "",
    referralFee: "",
    referralDiscount: "",
    sourceAmountIn: "",
    sourceAmountOut: "",
    destinationAmountIn: "",
    destinationAmountOut: "",
    salt: "",
    expiry: 0,
    signature: "",
  };
  try {
    let pf = await getPlatformFee();
    let pfInNumber = pf;
    if (!pf) {
      return {
        error: invalidPlatformFee,
      };
    }
    pf = common.numberIntoDecimals__(pf, foundaryDecimals);
    if (!isValidAmountSwap(decimalAmount, pf)) {
      return {
        error: `Swap amount should be more than ${getPlatformFeeInNumber(
          pfInNumber
        )} USDC`,
      };
    }
    totalFee = pf;
    amountAfterCut = common.getAmountAfterAbsoluteCut(decimalAmount, pf);
    console.log(
      "amountAfterCut",
      amountAfterCut,
      "totalPlatformFee",
      totalFee,
      "totalPlatformFee%",
      pf
    );
    const refData: any = await getReferralData(
      referralCode,
      sourceWalletAddress,
      totalFee
    );
    totalFee = refData?.totalPlatformFee;
    if (refData?.referralDiscountAmount) {
      amountAfterCut = Big(amountAfterCut).add(
        Big(refData?.referralDiscountAmount)
      );
    }
    console.log("totalPlatformFee", totalFee?.toString(), refData);
    console.log("amountAfterCut", amountAfterCut?.toString());
    data = {
      referral: refData?.recipient ? refData?.recipient : emptyReferral,
      referralFee: refData?.referralFee ? refData?.referralFee : "0",
      referralDiscount: refData?.referralDiscount
        ? refData?.referralDiscount
        : "0",
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
    totalFee: totalFee?.toString(),
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

export async function getReferralData(
  referralCode: string,
  sourceWalletAddress: string,
  totalPlatformFee: any
) {
  let referral;
  try {
    const res = await getFeeDistributionDataByReferralCode(
      sourceWalletAddress,
      referralCode
    );
    if (res?.recipient && res?.fee && res?.discount) {
      let fee = Number(res?.fee);
      let discount = Number(res?.discount);
      fee = fee >= 100 ? 100 : fee;
      discount = discount >= 100 ? 100 : discount;
      const refDiscount = common.getAmountAfterPercentageCut(
        totalPlatformFee?.toString(),
        discount
      );
      totalPlatformFee = Big(totalPlatformFee).minus(Big(refDiscount));
      console.log(
        "feeAfterDiscount",
        totalPlatformFee?.toString(),
        "refDiscount",
        refDiscount.toString()
      );
      return {
        totalPlatformFee: totalPlatformFee?.toString(),
        recipient: res?.recipient,
        referralFee: fee,
        referralDiscount: discount,
        referralDiscountAmount: refDiscount,
      };
    }
  } catch (e) {
    console.log(e);
  }
  return {
    totalPlatformFee: totalPlatformFee,
  };
}

export function getSourceAmountWithFee(amount: string, fee: string) {
  try {
    if (amount) {
      console.log(
        "sourceAmountBefore",
        amount?.toString(),
        "fee",
        fee?.toString()
      );
      amount = Big(amount).add(Big(fee));
      console.log("after", amount.toString());
      amount = (global as any).utils.convertFromExponentialToDecimal(
        amount.toString()
      );
    }
  } catch (e) {
    console.log(e);
  }
  return amount ? amount : "";
}

function isValidAmountSwap(amount: any, pf: any): boolean {
  try {
    if (amount) {
      amount = Big(amount);
      pf = Big(pf).mul(Big(2));
      console.log("amount", amount?.toString(), "pf", pf?.toString());
      if (amount.gte(pf)) {
        return true;
      }
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

function getPlatformFeeInNumber(pf: any) {
  try {
    return Big(pf).mul(Big(2));
  } catch (e) {
    console.log(e);
  }
}
