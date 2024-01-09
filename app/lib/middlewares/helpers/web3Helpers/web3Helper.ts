import Web3 from "web3";
import { abi as contractABI } from "../../../../../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/FiberRouter.json";

export const getTransactionReceipt = async (
  txId: string,
  rpcUrl: string
): Promise<any> => {
  const web3 = new Web3(rpcUrl);
  const transaction: any = await web3.eth.getTransactionReceipt(txId);
  console.log("transaction", transaction?.status, txId);
  return transaction;
};

export const getLogsFromTransactionReceipt = (
  tx: any,
  rcpUrl: string,
  isOneInch: boolean
): any => {
  let logDataAndTopic = undefined;

  if (tx?.logs?.length) {
    for (const log of tx?.logs) {
      if (log?.topics?.length) {
        const topicIndex = findSwapEvent(log.topics, isOneInch);
        if (topicIndex !== undefined && topicIndex >= 0) {
          logDataAndTopic = {
            data: log.data,
            topics: log.topics,
          };
          break;
        }
      }
    }

    let swapEventInputs = contractABI.find(
      (abi) => abi.name === "WithdrawOneInch" && abi.type === "event"
    )?.inputs;

    if (logDataAndTopic?.data && logDataAndTopic.topics) {
      const web3 = new Web3(rcpUrl);
      const decodedLog = web3.eth.abi.decodeLog(
        swapEventInputs as any,
        logDataAndTopic.data,
        logDataAndTopic.topics.slice(1)
      );

      return decodedLog;
    }
  }
};

const findSwapEvent = (topics: any[], isOneInch: boolean) => {
  let oneInchEventHash = Web3.utils.sha3(
    "WithdrawOneInch(address,uint256,uint256,address,address,bytes,bytes32,bytes)"
  );
  if (topics?.length) {
    return topics.findIndex((topic) => topic === oneInchEventHash);
  } else {
    return undefined;
  }
};
