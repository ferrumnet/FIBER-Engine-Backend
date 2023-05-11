import {
  produecSignaturewithdrawHash,
  fixSig,
} from "../../../../scripts/utils/BridgeUtils";
import { ecsign, toRpcSig } from "ethereumjs-util";
import Web3 from "web3";

interface SignatureResponse {
  hash: String;
  salt: String;
  signature: String;
  amount: String;
}

interface LocalSignatureData {
  targetNetworkChainId: String;
  targetNetworkFundManager: String;
  targetTokenAddress: String;
  address: String;
  amount: String;
  salt: String;
}

module.exports = {
  getSignature: async function (
    paramsBody: any,
    assetType: String,
    localSignatureData: LocalSignatureData
  ): Promise<SignatureResponse> {
    let signatureResponse: SignatureResponse = {
      hash: "",
      salt: "",
      signature: "",
      amount: "",
    };
    if (
      paramsBody &&
      paramsBody.salt &&
      paramsBody.hash &&
      paramsBody.signatures
    ) {
      // fethc signature data from api req body for v2
      signatureResponse.hash = paramsBody.hash;
      signatureResponse.salt = paramsBody.salt;
      signatureResponse.amount = paramsBody.bridgeAmount;
      if (assetType == (global as any).utils.assetType.FOUNDARY) {
        signatureResponse.signature =
          paramsBody.signatures.length > 0 ? paramsBody.signatures[0] : "";
      } else {
        signatureResponse.signature =
          paramsBody.signatures.length > 0 ? paramsBody.signatures[1] : "";
      }
      console.log(
        "fetch signature data from api req body for v2",
        signatureResponse
      );
    } else {
      // create local signature for v1
      const hash = await produecSignaturewithdrawHash(
        localSignatureData.targetNetworkChainId,
        localSignatureData.targetNetworkFundManager,
        localSignatureData.targetTokenAddress,
        localSignatureData.address,
        localSignatureData.amount,
        localSignatureData.salt
      );
      const sigP2 = ecsign(
        Buffer.from(hash.replace("0x", ""), "hex"),
        Buffer.from((global as any).environment.SIGNER.replace("0x", ""), "hex")
      );
      const sig2 = fixSig(toRpcSig(sigP2.v, sigP2.r, sigP2.s));
      signatureResponse.hash = hash;
      signatureResponse.salt = localSignatureData.salt;
      signatureResponse.amount = localSignatureData.amount;
      signatureResponse.signature = sig2;
      console.log("create local signature for v1", signatureResponse);
    }
    return signatureResponse;
  },

  createLocalSignatureDataObject: function (
    targetNetworkChainId: string,
    targetNetworkFundManager: string,
    targetTokenAddress: string,
    address: string,
    amount: string,
    salt: string
  ) {
    salt = Web3.utils.keccak256(salt.toLocaleLowerCase());
    let localSignatureData: LocalSignatureData = {
      targetNetworkChainId: targetNetworkChainId,
      targetNetworkFundManager: targetNetworkFundManager,
      targetTokenAddress: targetTokenAddress,
      address: address,
      amount: amount,
      salt: salt,
    };
    console.log(localSignatureData, "localSignatureData");
    return localSignatureData;
  },
};
