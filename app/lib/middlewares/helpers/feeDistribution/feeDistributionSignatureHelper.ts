import moment from "moment";
import Web3 from "web3";
import crypto from "crypto";
import { ethers } from "ethers";
import { _TypedDataEncoder } from "ethers/lib/utils";
const CONTRACT_NAME = "FEE_DISTRIBUTOR";
const CONTRACT_VERSION = "000.001";

export const getSaltAndExpiryData = async () => {
  const salt = Web3.utils.keccak256(crypto.randomBytes(512).toString("hex"));
  const expiry = getExpiry();
  return { salt, expiry };
};

export const getFeeDistributionSignature = async (
  token: string,
  network: any,
  fiberRouterContractAddress: any,
  feeAllocations: any[],
  salt: any,
  expiry: any
) => {
  const domain = {
    name: CONTRACT_NAME,
    version: CONTRACT_VERSION,
    chainId: network.chainId,
    verifyingContract: fiberRouterContractAddress,
  };
  const types = {
    FeeAllocation: [
      { name: "recipient", type: "address" },
      { name: "rateInBps", type: "uint16" },
    ],
    DistributeFees: [
      { name: "token", type: "address" },
      { name: "feeAllocations", type: "FeeAllocation[]" },
      { name: "salt", type: "bytes32" },
      { name: "expiry", type: "uint256" },
    ],
  };
  const values = {
    token: token,
    feeAllocations: feeAllocations,
    salt: salt,
    expiry: expiry,
  };
  var wallet = new ethers.Wallet((global as any).environment.PRI_KEY);
  const signer = wallet.connect(network?.provider);
  const signature = await signer._signTypedData(domain, types, values);
  console.log("getFeeDistributionSignature", signature);
  return signature;
};

export const getExpiry = function () {
  return moment().utc().add("minutes", 15).unix();
};
