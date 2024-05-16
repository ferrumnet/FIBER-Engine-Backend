var { ethers } = require("ethers");
var tokenAbi = require("../../../../artifacts/contracts/token/Token.sol/Token.json");
const cudosBalance = require("../../../../scripts/cudosBalance");
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

export const isLiquidityAvailableForCudos = async (
  foundryTokenAddress: string,
  fundManagerAddress: string,
  rpc: any,
  privateKey: string,
  amount: number
): Promise<boolean> => {
  let isValid = false;
  let balance: any = await cudosBalance(
    foundryTokenAddress,
    fundManagerAddress,
    rpc,
    privateKey
  );
  if (balance && balance.amount) {
    balance.amount = (global as any).utils.convertFromExponentialToDecimal(
      balance?.amount
    );
  }
  console.log("balance", balance?.amount, "amount", amount);
  if (balance && balance.amount && balance.amount >= amount) {
    isValid = true;
  }
  return isValid;
};

export const checkForCCTP = async (
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
      console.log("i am here 1");
      if (amount.gt(balance) || amount.gte(threshold)) {
        return true;
      }
    } else if (amount.gt(balance)) {
      console.log("i am here 2");
      throw IN_SUFFICIENT_LIQUIDITY_ERROR;
    }
  }
  return false;
};
