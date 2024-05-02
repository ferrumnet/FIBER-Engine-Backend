var { ethers } = require("ethers");
import {
  Contract,
  WithdrawSigned,
  WithdrawSignedAndSwapRouter,
} from "../../../../interfaces/forgeInterface";
import {
  Swap,
  SwapRouter,
  SwapSameNetwork,
} from "../../../../interfaces/forgeInterface";
const forgeAbi: any = require("../../../../../config/forge.json");
const fiberRouterAbi: any = require("../../../../../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/FiberRouter.json");

const forgeContract = (provider: any, tokenContractAddress: any) => {
  return new ethers.Contract(tokenContractAddress, forgeAbi.abi, provider);
};

const getSigner = (provider: any) => {
  var signer = new ethers.Wallet((global as any).environment.PRI_KEY);
  return signer.connect(provider);
};

const fiberRouterContract = (provider: any, tokenContractAddress: any) => {
  return new ethers.Contract(
    tokenContractAddress,
    fiberRouterAbi.abi,
    provider
  );
};

export const destinationFoundaryGasEstimation = async (
  contract: Contract,
  network: any,
  obj: WithdrawSigned
): Promise<any> => {
  try {
    let forge = forgeContract(network.provider, contract.contractAddress);
    let response = await forge
      .connect(getSigner(network.provider))
      .estimateGas.withdrawSignedForGasEstimation(
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.salt,
        obj.signatureExpiry,
        obj.signature
      );
    return response;
  } catch (e: any) {
    console.log(e);
    if (e?.reason) {
      throw e?.reason;
    }
  }
};

export const destinationOneInchGasEstimation = async (
  contract: Contract,
  network: any,
  obj: WithdrawSignedAndSwapRouter
): Promise<any> => {
  try {
    let forge = forgeContract(network.provider, contract.contractAddress);
    let response = await forge
      .connect(getSigner(network.provider))
      .estimateGas.withdrawSignedAndSwapRouterForGasEstimation(
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.destinationAmountOut,
        obj.targetFoundryTokenAddress,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationAggregatorRouterAddress,
        obj.destinationAggregatorRouterCalldata,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        obj.cctpType
      );
    return response;
  } catch (e: any) {
    console.log(e);
    if (e?.reason) {
      throw e?.reason;
    }
  }
};

export const sourceFoundaryGasEstimation = async (
  contract: Contract,
  network: any,
  obj: Swap
): Promise<any> => {
  try {
    let fiberRouter = fiberRouterContract(
      network.provider,
      contract.contractAddress
    );
    let response = await fiberRouter.estimateGas.swap(
      obj.sourceTokenAddress,
      obj.amount,
      obj.targetChainId,
      obj.targetTokenAddress,
      obj.destinationWalletAddress,
      obj.withdrawalData,
      {
        from: obj.sourceWalletAddress,
        value: obj.value,
      }
    );
    return response;
  } catch (e: any) {
    console.log(e);
    if (e?.reason) {
      throw e?.reason;
    }
  }
};

export const sourceOneInchGasEstimation = async (
  contract: Contract,
  network: any,
  obj: SwapRouter
): Promise<any> => {
  try {
    console.log("obj", obj);
    let response;
    let fiberRouter = fiberRouterContract(
      network.provider,
      contract.contractAddress
    );
    if (
      await (global as any).commonFunctions.isNativeToken(
        obj.sourceTokenAddress
      )
    ) {
      response = await fiberRouter.estimateGas.swapAndCrossRouterETH(
        obj.minAmountOut,
        obj.foundryTokenAddress,
        obj.gasPrice,
        obj.sourceAggregatorRouterAddress,
        obj.sourceAggregatorRouterCalldata,
        obj.targetChainId,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.withdrawalData,
        obj.cctpType,
        {
          from: obj.sourceWalletAddress,
          value: obj.value,
        }
      );
    } else {
      response = await fiberRouter.estimateGas.swapAndCrossRouter(
        obj.amountIn,
        obj.minAmountOut,
        obj.sourceTokenAddress,
        obj.foundryTokenAddress,
        obj.sourceAggregatorRouterAddress,
        obj.sourceAggregatorRouterCalldata,
        obj.targetChainId,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.withdrawalData,
        obj.cctpType,
        {
          from: obj.sourceWalletAddress,
          value: obj.value,
        }
      );
    }
    return response;
  } catch (e: any) {
    console.log(e);
    if (e?.reason) {
      throw e?.reason;
    }
  }
};

export const sourceSameNetworkGasEstimation = async (
  contract: Contract,
  network: any,
  obj: SwapSameNetwork
): Promise<any> => {
  try {
    console.log("obj", obj);
    let response;
    let fiberRouter = fiberRouterContract(
      network.provider,
      contract.contractAddress
    );
    if (
      await (global as any).commonFunctions.isNativeToken(
        obj.sourceTokenAddress
      )
    ) {
      response = await fiberRouter.estimateGas.swapOnSameNetworkETH(
        obj.amountOut,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.destinationOneInchData,
        obj.oneInchSelector,
        {
          from: obj.sourceWalletAddress,
          value: obj.value,
        }
      );
    } else {
      response = await fiberRouter.estimateGas.swapOnSameNetwork(
        obj.amountIn,
        obj.amountOut,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.sourceTokenAddress
        ),
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.destinationOneInchData,
        obj.oneInchSelector,
        {
          from: obj.sourceWalletAddress,
          value: obj.value,
        }
      );
    }
    return response;
  } catch (e: any) {
    console.log(e);
    if (e?.reason) {
      throw e?.reason;
    }
  }
};
