var { ethers } = require("ethers");
var tokenAbi = require("../../../../artifacts/contracts/token/Token.sol/Token.json");
var { Big } = require("big.js");
import { getCCTPBalanceThreshold, isCCTPNetwork } from "./configurationHelper";
import { IN_SUFFICIENT_LIQUIDITY_ERROR } from "./withdrawResponseHelper";

export const isLiquidityAvailableForEVM = async (
  foundryTokenAddress: string,
  fundManagerAddress: string,
  provider: any,
  amount: number
): Promise<boolean> => {
  let isValid = false;
  const contract = new ethers.Contract(
    foundryTokenAddress,
    tokenAbi.abi,
    provider
  );
  let balance = await contract.balanceOf(fundManagerAddress);
  if (balance && Number(balance) >= amount) {
    isValid = true;
  }
  return isValid;
};

export const checkForCCTPAndStargate = async (
  foundryTokenAddress: string,
  fundManagerAddress: string,
  provider: any,
  amount: any,
  foundaryDecimals: any,
  srcChainId: string,
  desChainId: string,
  srcType: string,
  desType: string
) => {
  let isCCTP = false;
  let isStargate = false;
  if (checkForStargate(srcType, desType)) {
    isStargate = true;
  } else {
    isCCTP = await checkForCCTP(
      foundryTokenAddress,
      fundManagerAddress,
      provider,
      amount,
      foundaryDecimals,
      srcChainId,
      desChainId
    );
  }
  console.log("{isCCTP,isStargate}", {
    isCCTP,
    isStargate,
  });
  return {
    isCCTP,
    isStargate,
  };
};

const checkForCCTP = async (
  foundryTokenAddress: string,
  fundManagerAddress: string,
  provider: any,
  amount: any,
  foundaryDecimals: any,
  srcChainId: string,
  desChainId: string
): Promise<boolean> => {
  const contract = new ethers.Contract(
    foundryTokenAddress,
    tokenAbi.abi,
    provider
  );
  let balance: any = await contract.balanceOf(fundManagerAddress);
  if (balance) {
    balance = Big(balance);
    amount = Big(amount);
    let threshold: any = (global as any).commonFunctions.numberIntoDecimals__(
      await getCCTPBalanceThreshold(),
      foundaryDecimals
    );
    threshold = Big(threshold);
    console.log("fundManager balance:", balance?.toString());
    console.log("amount:", amount?.toString());
    console.log(
      "threshold:",
      threshold?.toString(),
      "foundaryDecimals:",
      foundaryDecimals
    );
    if (
      (await isCCTPNetwork(srcChainId)) &&
      (await isCCTPNetwork(desChainId))
    ) {
      if (amount.gt(balance) || amount.gte(threshold)) {
        return true;
      }
    } else if (amount.gt(balance)) {
      throw IN_SUFFICIENT_LIQUIDITY_ERROR;
    }
  }
  return false;
};

export const checkForStargate = (srcType: string, desType: string): boolean => {
  const FOUNDARY = (global as any).utils.assetType.FOUNDARY;
  if (srcType == FOUNDARY && desType == FOUNDARY) {
    return true;
  }
  return false;
};
