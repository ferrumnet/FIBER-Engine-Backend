var { ethers } = require("ethers");
var tokenAbi = require("../../../../artifacts/contracts/token/Token.sol/Token.json");

interface AssetType {
  isFoundryAsset: boolean;
  isRefineryAsset: boolean;
  isIonicAsset: boolean;
}

export const getSourceAssetTypes = async (
  sourceNetwork: any,
  sourceTokenAddress: any,
  amount: any
): Promise<AssetType> => {
  let isFoundryAsset = false;
  let isRefineryAsset = false;
  let isIonicAsset = false;

  isFoundryAsset = await sourceFACCheck(sourceNetwork, sourceTokenAddress);
  console.log("isFoundryAsset", isFoundryAsset);
  if (!isFoundryAsset) {
    isRefineryAsset = await isSourceRefineryAsset(
      sourceNetwork,
      sourceTokenAddress,
      amount
    );
    console.log("isRefineryAsset", isRefineryAsset);
    if (!isRefineryAsset) {
      isIonicAsset = true;
      console.log("isIonicAsset", isIonicAsset);
    }
  }

  let response: AssetType = {
    isFoundryAsset: isFoundryAsset,
    isRefineryAsset: isRefineryAsset,
    isIonicAsset: isIonicAsset,
  };

  return response;
};

export const getTargetAssetTypes = async (
  targetNetwork: any,
  targetTokenAddress: any,
  amount: any
): Promise<AssetType> => {
  let isFoundryAsset = false;
  let isRefineryAsset = false;
  let isIonicAsset = false;

  isFoundryAsset = await targetFACCheck(
    targetNetwork,
    targetTokenAddress,
    amount
  );
  console.log("isFoundryAsset", isFoundryAsset);

  if (!isFoundryAsset) {
    isRefineryAsset = await isTargetRefineryAsset(
      targetNetwork,
      targetTokenAddress,
      amount
    );
    console.log("isRefineryAsset", isRefineryAsset);

    if (!isRefineryAsset) {
      isIonicAsset = true;
      console.log("isIonicAsset", isIonicAsset);
    }
  }

  let response: AssetType = {
    isFoundryAsset: isFoundryAsset,
    isRefineryAsset: isRefineryAsset,
    isIonicAsset: isIonicAsset,
  };

  return response;
};

export const convertIntoAssetTypesObjectForSource = (query: any): AssetType => {
  let isFoundryAsset = false;
  let isRefineryAsset = false;
  let isIonicAsset = false;
  let type = "";
  if (query?.sourceAssetType) {
    type = query?.sourceAssetType;
  }

  if (type == "Foundry") {
    isFoundryAsset = true;
  } else if (type == "Refinery") {
    isRefineryAsset = true;
  } else if (type == "Ionic") {
    isIonicAsset = true;
  }

  let response: AssetType = {
    isFoundryAsset: isFoundryAsset,
    isRefineryAsset: isRefineryAsset,
    isIonicAsset: isIonicAsset,
  };

  console.log("convertIntoAssetTypesObjectForSource", response);
  return response;
};

export const convertIntoAssetTypesObjectForTarget = (query: any): AssetType => {
  let isFoundryAsset = false;
  let isRefineryAsset = false;
  let isIonicAsset = false;
  let type = "";
  if (query?.sourceAssetType) {
    type = query?.sourceAssetType;
  }

  if (type == "Foundry") {
    isFoundryAsset = true;
  } else if (type == "Refinery") {
    isRefineryAsset = true;
  } else if (type == "Ionic") {
    isIonicAsset = true;
  }

  let response: AssetType = {
    isFoundryAsset: isFoundryAsset,
    isRefineryAsset: isRefineryAsset,
    isIonicAsset: isIonicAsset,
  };
  console.log("convertIntoAssetTypesObjectForTarget", response);
  return response;
};

export const isTypeFoundryAsset = async (
  sourceNetwork: any,
  sourceTokenAddress: any
): Promise<boolean> => {
  const isFoundryAsset = await sourceFACCheck(
    sourceNetwork,
    sourceTokenAddress
  );
  console.log("isFoundryAsset", isFoundryAsset);
  return isFoundryAsset;
};

export const isTypeRefineryAsset = async (
  sourceNetwork: any,
  sourceTokenAddress: any,
  amount: any
): Promise<boolean> => {
  const isRefineryAsset = await isSourceRefineryAsset(
    sourceNetwork,
    sourceTokenAddress,
    amount
  );
  console.log("isRefineryAsset", isRefineryAsset);
  return isRefineryAsset;
};

async function sourceFACCheck(
  sourceNetwork: any,
  tokenAddress: any
): Promise<boolean> {
  const isSourceTokenFoundryAsset =
    await sourceNetwork.fundManagerContract.isFoundryAsset(tokenAddress);
  return isSourceTokenFoundryAsset;
}

async function isSourceRefineryAsset(
  sourceNetwork: any,
  tokenAddress: any,
  amount: any
): Promise<boolean> {
  try {
    const isTokenFoundryAsset = await sourceFACCheck(
      sourceNetwork,
      tokenAddress
    );

    let path = [tokenAddress, sourceNetwork.foundryTokenAddress];
    const amounts = await sourceNetwork.dexContract.getAmountsOut(
      String(amount),
      path
    );
    const amountsOut = amounts[1];
    if (isTokenFoundryAsset == false && Number(amountsOut) > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function targetFACCheck(
  targetNetwork: any,
  tokenAddress: any,
  amount: any
): Promise<boolean> {
  const targetTokenContract = new ethers.Contract(
    tokenAddress,
    tokenAbi.abi,
    targetNetwork.provider
  );
  const isTargetTokenFoundryAsset =
    await targetNetwork.fundManagerContract.isFoundryAsset(tokenAddress);
  const targetFoundryAssetLiquidity = await targetTokenContract.balanceOf(
    targetNetwork.fundManagerContract.address
  );
  if (
    isTargetTokenFoundryAsset === true &&
    Number(targetFoundryAssetLiquidity) > Number(amount)
  ) {
    return true;
  } else {
    return false;
  }
}

async function isTargetRefineryAsset(
  targetNetwork: any,
  tokenAddress: any,
  amount: any
): Promise<boolean> {
  try {
    const isTokenFoundryAsset = await targetFACCheck(
      targetNetwork,
      tokenAddress,
      amount
    );

    let path = [targetNetwork.foundryTokenAddress, tokenAddress];
    const amounts = await targetNetwork.dexContract.getAmountsOut(
      String(amount),
      path
    );
    const amountsOut = amounts[1];
    if (isTokenFoundryAsset == false && Number(amountsOut) > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
