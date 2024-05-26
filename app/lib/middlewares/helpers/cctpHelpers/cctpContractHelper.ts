var { ethers } = require("ethers");
const forgeAbi: any = require("../../../../../config/forge.json");
const cctpMessageTransmitter: any = require("../../../../../config/cctpMessageTransmitter.json");
import { Contract } from "../../../../interfaces/forgeInterface";
import { sendSlackNotification } from "../fiberEngineHelper";
import {
  addBuffer,
  getGasForWithdraw,
} from "../gasFeeHelpers/gasEstimationHelper";

const cctpContract = (provider: any, tokenContractAddress: any) => {
  return new ethers.Contract(
    tokenContractAddress,
    cctpMessageTransmitter.abi,
    provider
  );
};

const getSigner = (provider: any) => {
  var signer = new ethers.Wallet((global as any).environment.PRI_KEY);
  return signer.connect(provider);
};

export const messageTransmitter = async (
  contract: Contract,
  network: any,
  messageBytes: string,
  attestationSignature: string
): Promise<boolean> => {
  let receipt: any;
  try {
    console.log(contract);
    let cctpMTContract = cctpContract(
      network.provider,
      contract.contractAddress
    );
    let gasLimit = await cctpMTContract
      .connect(getSigner(network.provider))
      .estimateGas.receiveMessage(messageBytes, attestationSignature);
    console.log("gasLimit", gasLimit.toString());
    gasLimit = await addBuffer(gasLimit, network.chainId, true, 0);
    let response = await cctpMTContract
      .connect(getSigner(network.provider))
      .receiveMessage(
        messageBytes,
        attestationSignature,
        await getGasForWithdraw(network.chainId, gasLimit)
      );
    receipt = await response?.wait();
    console.log("receipt.status", receipt.status);
    if (receipt?.status) {
      return true;
    }
  } catch (e: any) {
    receipt = e;
    console.log(e);
  }
  sendSlackNotification(
    attestationSignature,
    "Message Transmitter Receipt: " + receipt,
    null
  );
  return false;
};
