import { is } from "bluebird";

var { ethers } = require("ethers");
var tokenAbi = require("../../../../artifacts/contracts/token/Token.sol/Token.json");
const cudosBalance = require("../../../../scripts/cudosBalance");

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
  if (balance && balance.amount && balance.amount >= amount) {
    isValid = true;
  }
  return isValid;
};
