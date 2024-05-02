import Web3 from "web3";
import {
  ecsign,
  toRpcSig,
  fromRpcSig,
  ecrecover,
  toBuffer,
  pubToAddress,
  bufferToHex,
} from "ethereumjs-util";
export const createSignedPayment = (
  chainId: string,
  payee: string,
  amount: string,
  targetToken: string,
  contractAddress: string,
  salt: string,
  destinationAssetType: string,
  amountIn: string,
  amountOut: string,
  targetFoundaryToken: string,
  routerCalldata: string,
  expiry: number,
  web3: Web3,
  aggregateRouterContractAddress: string
) => {
  let hash;
  const FOUNDARY = (global as any).utils.assetType.FOUNDARY;
  const ONE_INCH = (global as any).utils.assetType.ONE_INCH;

  if (destinationAssetType == FOUNDARY) {
    hash = produceFoundaryHash(
      web3,
      chainId,
      contractAddress,
      targetFoundaryToken,
      payee,
      amount,
      salt,
      expiry
    );
  } else if (destinationAssetType == ONE_INCH) {
    hash = produceOneInchHash(
      web3,
      chainId,
      contractAddress,
      payee,
      amountIn,
      amountOut,
      targetFoundaryToken,
      targetToken,
      routerCalldata,
      salt,
      expiry,
      aggregateRouterContractAddress
    );
  }
  const privateKey = getPrivateKey();
  const ecSign = ecsign(
    Buffer.from(hash.replace("0x", ""), "hex"),
    Buffer.from(privateKey.replace("0x", ""), "hex")
  );
  const signature = fixSig(toRpcSig(ecSign.v, ecSign.r, ecSign.s));
  return { signature, hash };
};

export const produceFoundaryHash = (
  web3: Web3,
  chainId: string,
  contractAddress: string,
  token: string,
  payee: string,
  amount: string,
  salt: string,
  expiry: number
): any => {
  console.log("i am foundary");
  const methodHash = Web3.utils.keccak256(
    Web3.utils.utf8ToHex(
      "WithdrawSigned(address token,address payee,uint256 amount,bytes32 salt,uint256 expiry)"
    )
  );
  const params = [
    "bytes32",
    "address",
    "address",
    "uint256",
    "bytes32",
    "uint256",
  ];
  const structure = web3.eth.abi.encodeParameters(params, [
    methodHash,
    token,
    payee,
    amount,
    salt,
    expiry,
  ]);
  const structureHash = Web3.utils.keccak256(structure);
  const ds = domainSeparator(web3, chainId, contractAddress);
  const hash = Web3.utils.soliditySha3("\x19\x01", ds, structureHash);
  return hash;
};

export const produceOneInchHash = (
  web3: Web3,
  chainId: string,
  contractAddress: string,
  payee: string,
  amountIn: string,
  amountOut: string,
  foundryToken: string,
  targetToken: string,
  routerCalldata: string,
  salt: string,
  expiry: number,
  aggregateRouterContractAddress: string
): any => {
  console.log("i am 1Inch");
  const methodHash = Web3.utils.keccak256(
    Web3.utils.utf8ToHex(
      "withdrawSignedAndSwapRouter(address to,uint256 amountIn,uint256 minAmountOut,address foundryToken,address targetToken,address router,bytes32 routerCalldata,bytes32 salt,uint256 expiry)"
    )
  );
  const params = [
    "bytes32",
    "address",
    "uint256",
    "uint256",
    "address",
    "address",
    "address",
    "bytes32",
    "bytes32",
    "uint256",
  ];
  const structure = web3.eth.abi.encodeParameters(params, [
    methodHash,
    payee,
    amountIn,
    amountOut,
    foundryToken,
    targetToken,
    aggregateRouterContractAddress,
    Web3.utils.keccak256(routerCalldata),
    salt,
    expiry,
  ]);
  const structureHash = Web3.utils.keccak256(structure);
  const ds = domainSeparator(web3, chainId, contractAddress);
  const hash = Web3.utils.soliditySha3("\x19\x01", ds, structureHash);
  return hash;
};

export const domainSeparator = (
  web3: Web3,
  chainId: string,
  contractAddress: string
) => {
  const CONTRACT_NAME = (global as any).utils.CONTRACT_NAME;
  const CONTRACT_VERSION = (global as any).utils.CONTRACT_VERSION;
  const hashedName = Web3.utils.keccak256(Web3.utils.utf8ToHex(CONTRACT_NAME));
  const hashedVersion = Web3.utils.keccak256(
    Web3.utils.utf8ToHex(CONTRACT_VERSION)
  );
  const typeHash = Web3.utils.keccak256(
    Web3.utils.utf8ToHex(
      "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    )
  );
  return Web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [typeHash, hashedName, hashedVersion, chainId, contractAddress]
    )
  );
};

export const getPrivateKey = function () {
  return (global as any).environment.forgePrivateKey;
};

const fixSig = (sig: any) => {
  const rs = sig.substring(0, sig.length - 2);
  let v = sig.substring(sig.length - 2);
  if (v === "00" || v === "37" || v === "25") {
    v = "1b";
  } else if (v === "01" || v === "38" || v === "26") {
    v = "1c";
  }
  return rs + v;
};

export const recoverAddress = (signature: string, hash: string): boolean => {
  try {
    const { v, r, s } = fromRpcSig(signature);
    const pubKey = ecrecover(toBuffer(hash), v, r, s);
    const addrBuf = pubToAddress(pubKey);
    const address = bufferToHex(addrBuf);
    console.log("recoverAddress", address);
  } catch (e) {
    console.log(e);
  }
  return false;
};
