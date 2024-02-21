var Web3 = require("web3");
import {
  Contract,
  WithdrawSigned,
  WithdrawSignedAndSwapOneInch,
} from "../../../../interfaces/forgeInterface";
import { Swap, SwapOneInch } from "../../../../interfaces/fiberEngineInterface";
const forgeAbi: any = require("../../../../../config/forge.json");
const fiberRouterAbi: any = require("../../../../../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/FiberRouter.json");

const web3 = (rpcUrl: any) => {
  if (rpcUrl) {
    return new Web3(new Web3.providers.HttpProvider(rpcUrl));
  }
  return null;
};

const forgeContract = (rpcUrl: any, tokenContractAddress: any) => {
  let Web3 = web3(rpcUrl).eth;
  return new Web3.Contract(forgeAbi.abi, tokenContractAddress);
};

const fiberRouterContract = (rpcUrl: any, tokenContractAddress: any) => {
  let Web3 = web3(rpcUrl).eth;
  return new Web3.Contract(fiberRouterAbi.abi, tokenContractAddress);
};

export const destinationFoundaryGasEstimation = async (
  contract: Contract,
  obj: WithdrawSigned
): Promise<any> => {
  try {
    let forge = forgeContract(contract.rpcUrl, contract.contractAddress);
    let response = await forge.methods
      .estimateGasForWithdrawSigned(
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.salt,
        obj.signatureExpiry,
        obj.signature
      )
      .estimateGas();
    return response;
  } catch (e: any) {
    console.log(e);
  }
};

export const destinationOneInchGasEstimation = async (
  contract: Contract,
  obj: WithdrawSignedAndSwapOneInch
): Promise<any> => {
  try {
    let forge = forgeContract(contract.rpcUrl, contract.contractAddress);
    let response = await forge.methods
      .estimateGasForWithdrawSignedAndSwapOneInch(
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.destinationAmountOut,
        obj.targetFoundryTokenAddress,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationOneInchData,
        obj.salt,
        obj.signatureExpiry,
        obj.signature
      )
      .estimateGas();
    return response;
  } catch (e: any) {
    console.log(e);
  }
};

export const sourceFoundaryGasEstimation = async (
  contract: Contract,
  obj: Swap
): Promise<any> => {
  try {
    let fiberRouter = fiberRouterContract(
      contract.rpcUrl,
      contract.contractAddress
    );
    let response = await fiberRouter.methods
      .swap(
        obj.sourceTokenAddress,
        obj.amount,
        obj.targetChainId,
        obj.targetTokenAddress,
        obj.destinationWalletAddress,
        obj.withdrawalData
      )
      .estimateGas({
        from: obj.sourceWalletAddress,
        value: obj.value,
      });
    return response;
  } catch (e: any) {
    console.log(e);
  }
};
