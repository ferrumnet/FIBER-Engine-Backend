import Web3 from "web3";

export interface SignatureResponse {
  hash: String;
  salt: String;
  signature: String;
  amount: String;
}

export const getSignature = (paramsBody: any): SignatureResponse => {
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
    signatureResponse.hash = paramsBody.hash;
    signatureResponse.salt = paramsBody.salt;
    signatureResponse.amount = paramsBody.destinationBridgeAmount;
    signatureResponse.signature =
      paramsBody.signatures.length > 0
        ? paramsBody.signatures[0].signature
        : "";
  }
  return signatureResponse;
};

export const getWithdrawalDataHashForSwap = (
  sourceOneInchData: string,
  destinationOneInchData: string,
  amountIn: string,
  amountOut: string,
  sourceAssetType: string,
  destinationAssetType: string
): string => {
  let hash = Web3.utils.keccak256(
    sourceOneInchData +
      destinationOneInchData +
      amountIn +
      amountOut +
      sourceAssetType +
      destinationAssetType
  );
  console.log(
    sourceOneInchData,
    destinationOneInchData,
    amountIn,
    amountOut,
    sourceAssetType,
    destinationAssetType,
    hash
  );
  return hash;
};
