import { is } from "bluebird";

var { ethers } = require("ethers");
var tokenAbi = require("../../../../artifacts/contracts/token/Token.sol/Token.json");

export const isLiquidityAvailable = async (
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
  if (balance) {
    console.log("result", Number(balance), Number(amount));
  }
  if (balance && Number(balance) >= Number(amount)) {
    isValid = true;
  }
  return isValid;
};
