import { FeeDistribution } from "../../../../interfaces/feeDistributionInterface";
import {
  getFeeDistributionSignature,
  getSaltAndExpiryData,
} from "../feeDistribution/feeDistributionSignatureHelper";
import { getFeeDistributionDataByReferralCode } from "../../../httpCalls/multiSwapAxiosHelper";

export async function getFeeDistributionData(
  referralCode: string,
  network: any
): Promise<FeeDistribution> {
  let data: FeeDistribution = {
    feeAllocations: [],
    salt: "",
    expiry: 0,
    signature: "",
  };
  try {
    const feeDistribution = await getFeeDistributionDataByReferralCode(
      referralCode
    );
    const feeAllocations = feeDistribution ? [feeDistribution] : [];
    const { salt, expiry } = await getSaltAndExpiryData();
    console.log({ salt, expiry });
    const signature = await getFeeDistributionSignature(
      network.foundryTokenAddress,
      network,
      network.fiberRouter,
      feeAllocations,
      salt,
      expiry
    );
    console.log("feeDistribution signature", signature);
    data = {
      feeAllocations: feeAllocations,
      salt: salt,
      expiry: expiry,
      signature: signature,
    };
  } catch (e) {
    console.error(e);
  }
  console.log("getFeeDistributionData", data);
  return data;
}
