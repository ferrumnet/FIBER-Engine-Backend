var { ethers } = require("ethers");
import {
  Contract,
  WithdrawSigned,
  WithdrawSignedAndSwapOneInch,
} from "../../../../interfaces/forgeInterface";
import {
  Swap,
  SwapOneInch,
  SwapSameNetwork,
} from "../../../../interfaces/forgeInterface";
const forgeAbi: any = require("../../../../../config/forge.json");
const fiberRouterAbi: any = require("../../../../../artifacts/contracts/fiber/FiberRouter.sol/FiberRouter.json");
const fundManagerAbi: any = require("../../../../../artifacts/contracts/fiber/FundManager.sol/FundManager.json");

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

const fundManagerContract = (provider: any, tokenContractAddress: any) => {
  return new ethers.Contract(
    tokenContractAddress,
    fundManagerAbi.abi,
    provider
  );
};

export const destinationFoundaryGasEstimation = async (
  contract: Contract,
  srcNetwork: any,
  desNetwork: any,
  obj: WithdrawSigned
): Promise<any> => {
  let response;
  try {
    let forge = forgeContract(desNetwork.provider, contract.contractAddress);
    if (obj.isStargate) {
      console.log("i am here stargate");
      response = await prepareTakeTaxiGasEstimation(
        srcNetwork,
        30110, // desNetwork.stargateEndpointID
        1000000,
        desNetwork.fundManager,
        obj.destinationWalletAddress,
        obj
      );
    } else {
      console.log("i am here without stargate");
      response = await forge
        .connect(getSigner(desNetwork.provider))
        .estimateGas.withdrawSignedForGasEstimation(
          await (global as any).commonFunctions.getNativeTokenAddress(
            obj.targetTokenAddress
          ),
          obj.destinationWalletAddress,
          obj.destinationAmountIn,
          obj.salt,
          obj.signatureExpiry,
          obj.signature,
          obj.isCCTP
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

export const destinationOneInchGasEstimation = async (
  contract: Contract,
  network: any,
  obj: WithdrawSignedAndSwapOneInch
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
        await (global as any).commonFunctions.getNativeTokenAddress(
          obj.targetTokenAddress
        ),
        obj.aggregateRouterContractAddress,
        obj.destinationOneInchData,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        obj.isCCTP
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
  srcNetwork: any,
  obj: Swap
): Promise<any> => {
  try {
    let fiberRouter = fiberRouterContract(
      srcNetwork.provider,
      contract.contractAddress
    );
    let response = await fiberRouter.estimateGas.swapSigned(
      obj.sourceTokenAddress,
      obj.amount,
      {
        targetNetwork: obj.targetChainId,
        targetToken: await (
          global as any
        ).commonFunctions.getNativeTokenAddress(obj.targetTokenAddress),
        targetAddress: obj.destinationWalletAddress,
      },
      obj.withdrawalData,
      obj.isCCTP,
      obj.isStargate,
      obj.feeDistribution,
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
  obj: SwapOneInch
): Promise<any> => {
  try {
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
      response = await fiberRouter.estimateGas.swapSignedAndCrossRouterETH(
        obj.amountOut,
        obj.foundryTokenAddress,
        obj.gasPrice,
        obj.aggregateRouterContractAddress,
        obj.sourceOneInchData,
        {
          targetNetwork: obj.targetChainId,
          targetToken: await (
            global as any
          ).commonFunctions.getNativeTokenAddress(obj.targetTokenAddress),
          targetAddress: obj.destinationWalletAddress,
        },
        obj.withdrawalData,
        obj.isCCTP,
        obj.feeDistribution,
        {
          from: obj.sourceWalletAddress,
          value: obj.value,
        }
      );
    } else {
      response = await fiberRouter.estimateGas.swapSignedAndCrossRouter(
        obj.amountIn,
        obj.amountOut,
        obj.sourceTokenAddress,
        obj.foundryTokenAddress,
        obj.aggregateRouterContractAddress,
        obj.sourceOneInchData,
        {
          targetNetwork: obj.targetChainId,
          targetToken: await (
            global as any
          ).commonFunctions.getNativeTokenAddress(obj.targetTokenAddress),
          targetAddress: obj.destinationWalletAddress,
        },
        obj.withdrawalData,
        obj.isCCTP,
        obj.feeDistribution,
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
        await (global as any).commonFunctions.getNativeTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.aggregateRouterContractAddress,
        obj.destinationOneInchData,
        {
          from: obj.sourceWalletAddress,
          value: obj.value,
        }
      );
    } else {
      response = await fiberRouter.estimateGas.swapOnSameNetwork(
        obj.amountIn,
        obj.amountOut,
        await (global as any).commonFunctions.getNativeTokenAddress(
          obj.sourceTokenAddress
        ),
        await (global as any).commonFunctions.getNativeTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.aggregateRouterContractAddress,
        obj.destinationOneInchData,
        {
          from: obj.sourceWalletAddress,
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

export const prepareTakeTaxiGasEstimation = async (
  network: any,
  dstEid: any,
  amount: any,
  composer: any,
  targetAddress: string,
  obj: any
): Promise<any> => {
  try {
    let response;
    let fundManager = fundManagerContract(
      network.provider,
      network.fundManager
    );
    const targetAddressBuffer = Buffer.from(targetAddress.slice(2), "hex");
    const amountInBuffer = Buffer.alloc(32);
    amountInBuffer.writeBigInt64BE(BigInt(amount), 0);
    const encodedData = Buffer.concat([targetAddressBuffer, amountInBuffer]);
    const composeMsg = "0x" + encodedData.toString("hex");
    const result = await fundManager.prepareTakeTaxi(
      dstEid,
      amount,
      composer,
      composeMsg
    );
    if (result && result.length > 2 && result[2].length > 0) {
      response = result[2][0];
      console.log("messagingFee:", response.toString());
    }
    return response;
  } catch (e: any) {
    console.log(e);
    if (e?.reason) {
      throw e?.reason;
    }
  }
};
