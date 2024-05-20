import { getSlippage } from "../../../lib/middlewares/helpers/configurationHelper";
import { getQouteAndTypeForCrossNetworks } from "../../../lib/middlewares/helpers/tokenQuoteAndTypeHelpers/crossNetworkQuoteAndTypeHelper";
import { getQouteAndTypeForSameNetworks } from "./tokenQuoteAndTypeHelpers/sameNetworkQuoteAndTypeHelper";
import { updateTransactionJobStatus } from "../../..//lib/httpCalls/multiSwapAxiosHelper";
let db = require("../../../models/index");

export const getQuoteAndTokenTypeInformation = async function (req: any) {
  let categorizedInfo;
  let sourceNetworkChainId = req.query.sourceNetworkChainId;
  let sourceTokenContractAddress = req.query.sourceTokenContractAddress;
  let destinationNetworkChainId = req.query.destinationNetworkChainId;
  let destinationTokenContractAddress =
    req.query.destinationTokenContractAddress;
  let sourceAmount = req.query.sourceAmount;
  let sourceWalletAddress = req.query.sourceWalletAddress;
  let destinationWalletAddress = req.query.destinationWalletAddress;
  let gasEstimationDestinationAmount = req.query.gasEstimationDestinationAmount;
  let sourceSlippage = req.query.sourceSlippage;
  let destinationSlippage = req.query.destinationSlippage;
  let referralCode = req.query.referralCode;

  if (
    isSameNetworksSwap(
      req.query.sourceNetworkChainId,
      req.query.destinationNetworkChainId
    ) &&
    !req.query.gasEstimationDestinationAmount
  ) {
    console.log("i am same network swap");
    categorizedInfo = await getQouteAndTypeForSameNetworks(
      sourceNetworkChainId,
      sourceTokenContractAddress,
      destinationNetworkChainId,
      destinationTokenContractAddress,
      sourceAmount,
      sourceWalletAddress,
      destinationWalletAddress,
      gasEstimationDestinationAmount,
      sourceSlippage,
      destinationSlippage
    );
  } else {
    console.log("i am not same network swap");
    categorizedInfo = await getQouteAndTypeForCrossNetworks(
      sourceNetworkChainId,
      sourceTokenContractAddress,
      destinationNetworkChainId,
      destinationTokenContractAddress,
      sourceAmount,
      sourceWalletAddress,
      destinationWalletAddress,
      gasEstimationDestinationAmount,
      sourceSlippage,
      destinationSlippage,
      referralCode
    );
  }
  let data: any = await getResponseForQuoteAndTokenTypeInformation(
    req,
    categorizedInfo
  );
  return data;
};

export const getSwapSigned = async function (req: any) {
  let data: any = {};
  data = await (global as any).fiberEngine.swapForAbi(
    req.query.sourceWalletAddress,
    req.query.sourceTokenContractAddress,
    req.query.destinationTokenContractAddress,
    req.query.sourceNetworkChainId,
    req.query.destinationNetworkChainId,
    req.query.sourceAmount,
    req.query.destinationWalletAddress,
    req.query,
    req.body
  );
  return data;
};

export const getWithdrawSigned = async function (req: any) {
  if ((await isAlreadyInTransactionLog(req)) == false) {
    let log = await saveTransactionLog(req);
    let query = req.query;
    doWithdraw(req, query);
  } else {
    throw "Transaction already in processing";
  }
  return null;
};

export const isSameNetworksSwap = function (
  sourceNetworkChainId: string,
  destinationNetworkChainId: string
): boolean {
  if (sourceNetworkChainId == destinationNetworkChainId) {
    return true;
  } else {
    return false;
  }
};

export const saveTransactionLog = async function (req: any) {
  try {
    let body = req.query;
    body.responseCode = 100;
    body.createdAt = new Date();
    body.updatedAt = new Date();
    return await db.TransactionLogs.create(body);
  } catch (e) {}
};

export const isAlreadyInTransactionLog = async function (
  req: any
): Promise<boolean> {
  try {
    let countFilter = {
      swapTransactionHash: req.query.swapTransactionHash,
      $or: [{ responseCode: 100 }, { responseCode: 200 }],
    };
    let count = await db.TransactionLogs.countDocuments(countFilter);
    if (count == 1) {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
};

export const updateTransactionLog = async function (
  data: any,
  swapTransactionHash: any
) {
  try {
    await db.TransactionLogs.updateMany(
      { swapTransactionHash: swapTransactionHash },
      {
        withdrawTransactionHash: data.txHash,
        responseCode: data.responseCode,
        responseMessage: data.responseMessage,
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (e) {
    console.log(e);
  }
};

export const doWithdraw = async function (req: any, query: any) {
  let data = await (global as any).fiberEngine.withdraw(
    query.sourceTokenContractAddress,
    query.destinationTokenContractAddress,
    query.sourceNetworkChainId,
    query.destinationNetworkChainId,
    query.sourceAmount,
    query.destinationWalletAddress,
    req.query.swapTransactionHash,
    req.body
  );
  await updateTransactionLog(data, req.query.swapTransactionHash);
  data = {
    data: data.txHash,
    withdraw: data,
    responseCode: data.responseCode,
    responseMessage: data.responseMessage,
  };
  await await updateTransactionJobStatus(req.query.swapTransactionHash, data);
  return data;
};

export const quotAndTokenValidation = function (req: any) {
  if (
    !req.query.sourceWalletAddress ||
    !req.query.sourceTokenContractAddress ||
    !req.query.sourceNetworkChainId ||
    !req.query.sourceAmount ||
    !req.query.destinationTokenContractAddress ||
    !req.query.destinationNetworkChainId
  ) {
    throw "sourceWalletAddress & sourceTokenContractAddress & sourceNetworkChainId & sourceAmount & destinationTokenContractAddress & destinationNetworkChainId are missing";
  }
};

export const swapSignedValidation = function (req: any) {
  if (
    !req.query.sourceWalletAddress ||
    !req.query.sourceTokenContractAddress ||
    !req.query.sourceNetworkChainId ||
    !req.query.sourceAmount ||
    !req.query.destinationTokenContractAddress ||
    !req.query.destinationNetworkChainId ||
    !req.query.sourceAssetType ||
    !req.query.destinationAssetType
  ) {
    throw "sourceWalletAddress & sourceTokenContractAddress & sourceNetworkChainId & sourceAmount & destinationTokenContractAddress & destinationNetworkChainId & sourceAssetType & destinationAssetType are missing";
  }
  const isSameNetworkSwap = isSameNetworksSwap(
    req.query.sourceNetworkChainId,
    req.query.destinationNetworkChainId
  );
  if (!isSameNetworkSwap && !req.query.gasPrice) {
    throw "gasPrice is missing";
  }
  if (!isSameNetworkSwap && !req.body.feeDistribution) {
    throw "feeDistribution is missing";
  }
};

export const withdrawSignedValidation = function (req: any) {
  if (
    !req.body.sourceWalletAddress ||
    !req.body.sourceTokenContractAddress ||
    !req.body.sourceNetworkChainId ||
    !req.body.sourceAmount ||
    !req.body.destinationTokenContractAddress ||
    !req.body.destinationNetworkChainId ||
    !req.body.salt ||
    !req.body.hash ||
    !req.body.signatures ||
    !req.params.txHash
  ) {
    throw (
      "sourceWalletAddress & sourceTokenContractAddress &" +
      " sourceNetworkChainId & sourceAmount & destinationTokenContractAddress &" +
      " destinationNetworkChainId & salt & hash & signatures &" +
      " swapTransactionHash are missing"
    );
  }

  if (req.body.signatures && req.body.signatures.length == 0) {
    throw "signatures can not be empty";
  }
};

const getResponseForQuoteAndTokenTypeInformation = async function (
  req: any,
  categorizedInfo: any
) {
  let data: any = {};
  if (categorizedInfo) {
    let destinationAmount = 0;
    let minDestinationAmount;
    destinationAmount = categorizedInfo?.destination?.amount;
    minDestinationAmount = categorizedInfo?.destination?.minAmount
      ? categorizedInfo?.destination?.minAmount
      : categorizedInfo?.destination?.amount;
    let sourceCallData = "";
    let destinationCallData = "";
    if (categorizedInfo?.source?.callData) {
      sourceCallData = categorizedInfo?.source?.callData;
    }
    if (categorizedInfo?.destination?.callData) {
      destinationCallData = categorizedInfo?.destination?.callData;
    }

    let sourceTokenCategorizedInfo: any = {};
    sourceTokenCategorizedInfo.type = categorizedInfo.source.type;
    sourceTokenCategorizedInfo.sourceAmount = req.query.sourceAmount;
    sourceTokenCategorizedInfo.sourceAmountIn =
      categorizedInfo?.source?.sourceAmountIn;
    sourceTokenCategorizedInfo.sourceAmountOut =
      categorizedInfo?.source?.sourceAmountOut;
    sourceTokenCategorizedInfo.sourceOneInchData = sourceCallData;

    let destinationTokenCategorizedInfo: any = {};
    destinationTokenCategorizedInfo.type = categorizedInfo.destination.type;
    destinationTokenCategorizedInfo.destinationAmount = destinationAmount;
    destinationTokenCategorizedInfo.minDestinationAmount = minDestinationAmount;
    destinationTokenCategorizedInfo.destinationAmountIn =
      categorizedInfo?.destination?.destinationAmountIn;
    destinationTokenCategorizedInfo.destinationAmountOut =
      categorizedInfo?.destination?.destinationAmountOut;
    destinationTokenCategorizedInfo.destinationOneInchData =
      destinationCallData;
    data.sourceSlippage = await getSlippage(req.query.sourceSlippage);
    data.destinationSlippage = await getSlippage(req.query.destinationSlippage);

    data.sourceTokenCategorizedInfo = sourceTokenCategorizedInfo;
    data.destinationTokenCategorizedInfo = destinationTokenCategorizedInfo;
    data.isCCTP = categorizedInfo?.isCCTP ? categorizedInfo?.isCCTP : false;
    data.feeDistribution = categorizedInfo?.feeDistribution;
  }
  // console.log("getTokenCategorizedInformation response", data);
  return data;
};
