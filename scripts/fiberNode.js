const tokenAbi = require("../artifacts/contracts/token/Token.sol/Token.json");
const {
  goerliUsdt,
  bscUsdt,
  networks,
  bscAave,
  goerliCudos,
  goerliAave,
  goerliUsdc,
  bscCake,
  goerliAda,
} = global.networkHelper;
const { ethers } = require("ethers");
const signer = new ethers.Wallet(global.environment.PRI_KEY);


//check the requested token exist on the Source network Fund Manager
async function targetFACCheck(targetNetwork, tokenAddress, amount) {
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

//check source toke is foundry asset
async function isSourceRefineryAsset(sourceNetwork, tokenAddress, amount) {
  try {
    const isTokenFoundryAsset = await sourceFACCheck(
      sourceNetwork,
      tokenAddress
    );

    let path = [tokenAddress, sourceNetwork.foundryTokenAddress];
    const amounts = await sourceNetwork.dexContract.getAmountsOut(amount, path);
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

//check source toke is foundry asset
async function isTargetRefineryAsset(targetNetwork, tokenAddress, amount) {
  try {
    const isTokenFoundryAsset = await targetFACCheck(
      targetNetwork,
      tokenAddress,
      amount
    );

    let path = [targetNetwork.foundryTokenAddress, tokenAddress];
    const amounts = await targetNetwork.dexContract.getAmountsOut(amount, path);
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

module.exports = {

  //check the requested token exist on the Source network Fund Manager
  sourceFACCheck: async function (sourceNetwork, tokenAddress) {
    const isSourceTokenFoundryAsset =
      await sourceNetwork.fundManagerContract.isFoundryAsset(tokenAddress);
    return isSourceTokenFoundryAsset;
  },

  categoriseSwapAssets: async function (
    sourceChainId,
    sourcetokenAddress,
    targetChainId,
    targetTokenAddress,
    inputAmount
  ) {

    //error if source and network token and chain id are similar
    if (sourcetokenAddress == targetTokenAddress && sourceChainId == targetChainId) {
      console.error("ERROR: SAME TOKEN ADDRESS AND CHAIN ID");
      return;
    }

    const sourceNetwork = global.commonFunctions.getNetworkByChainId(sourceChainId).multiswapNetworkFIBERInformation;
    const targetNetwork = global.commonFunctions.getNetworkByChainId(targetChainId).multiswapNetworkFIBERInformation;
    //signers for both side networks
    const sourceSigner = signer.connect(sourceNetwork.provider);
    const targetSigner = signer.connect(targetNetwork.provider);
    // source token contract (required to approve function)
    const sourceTokenContract = new ethers.Contract(
      sourcetokenAddress,
      tokenAbi.abi,
      sourceNetwork.provider
    );

    // source token contract
    const targetTokenContract = new ethers.Contract(
      targetTokenAddress,
      tokenAbi.abi,
      targetNetwork.provider
    );
    //convert to wei
    const sourceTokenDecimal = await sourceTokenContract.decimals();
    const targetTokenDecimal = await targetTokenContract.decimals();
    const amount = (inputAmount * 10 ** Number(sourceTokenDecimal)).toString();
    console.log("INIT: Swap Initiated for this Amount: ", inputAmount);
    // is source token foundy asset
    const isFoundryAsset = await this.sourceFACCheck(
      sourceNetwork,
      sourcetokenAddress
    );
    //is source token refinery asset
    const isRefineryAsset = await isSourceRefineryAsset(
      sourceNetwork,
      sourcetokenAddress,
      amount
    );
    let targetAssetType;
    let sourceAssetType;
    let receipt;
    let sourceBridgeAmount;
    let destinationAmountOut;
    if (isFoundryAsset) {
      console.log("SN-1: Source Token is Foundry Asset");
      // approve to fiber router to transfer tokens to the fund manager contract
      sourceBridgeAmount = (inputAmount * 10 ** Number(targetTokenDecimal)).toString();
      console.log("sourceBridgeAmount foundry", sourceBridgeAmount)
      // receipt = await swapResult.wait();
    } else if (isRefineryAsset) {
      console.log("SN-1: Source Token is Refinery Asset");
      //swap refinery token to the foundry token
      let path = [sourcetokenAddress, sourceNetwork.foundryTokenAddress];
      let amounts;
      try {
        amounts = await sourceNetwork.dexContract.getAmountsOut(
          amount,
          path
        );
      } catch (error) {
        throw "ALERT: DEX doesn't have liquidity for this pair"
      }
      const amountsOut = amounts[1];
      sourceBridgeAmount = amountsOut;
    } else {
      console.log("SN-1: Source Token is Ionic Asset");
      //swap refinery token to the foundry token
      let path = [
        sourcetokenAddress,
        sourceNetwork.weth,
        sourceNetwork.foundryTokenAddress,
      ];
      let amounts;
      try {
        amounts = await sourceNetwork.dexContract.getAmountsOut(
          amount,
          path
        );
      } catch (error) {
        throw "ALERT: DEX doesn't have liquidity for this pair"
      }
      const amountsOut = amounts[amounts.length - 1];
      sourceBridgeAmount = amountsOut;
      //wait until the transaction be completed
      receipt = { status: 1 }
    }
    if (receipt = 1) {
      // console.log("sourceBridgeAmount", sourceBridgeAmount)
      // console.log("sourceTokenDecimalsourceTokenDecimal", sourceTokenDecimal)
      // let bridgeAmount = (sourceBridgeAmount / 10 ** Number(sourceTokenDecimal)).toString();
      // console.log("bridgeAmountbridgeAmount", bridgeAmount)
      let amountIn = (inputAmount * 10 ** Number(targetTokenDecimal)).toString();
      // console.log("Transaction hash is: swapResult===================>", swapResult);
      const isTargetTokenFoundry = await targetFACCheck(
        targetNetwork,
        targetTokenAddress,
        Math.floor(amountIn)
      );
      console.log("isTargetTokenFoundry", isTargetTokenFoundry)
      // const Salt = keccak256(Buffer.from(sourcetokenAddress + sourceBridgeAmount)).toString('hex');
      if (isTargetTokenFoundry) {

        destinationAmountOut = Math.floor(amountIn)
      } else {
        const isTargetRefineryToken = await isTargetRefineryAsset(
          targetNetwork,
          targetTokenAddress,
          sourceBridgeAmount
        );
        console.log("isTargetRefineryToken", isTargetRefineryToken)
        if (isTargetRefineryToken == true) {
          console.log("sourceBridgeAmountsourceBridgeAmount", sourceBridgeAmount)
          console.log("TN-1: Target token is Refinery Asset");
          let path2 = [targetNetwork.foundryTokenAddress, targetTokenAddress];
          let amounts2;
          try {
            amounts2 = await targetNetwork.dexContract.getAmountsOut(
              sourceBridgeAmount,
              path2
            );
          } catch (error) {
            throw "ALERT: DEX doesn't have liquidity for this pair"
          }

          console.log("amounts2amounts2amounts2", amounts2)
          const amountsOut2 = amounts2[1];
          destinationAmountOut = amountsOut2;

        } else {
          console.log("TN-1: Target Token is Ionic Asset");
          let path2 = [
            targetNetwork.foundryTokenAddress,
            targetNetwork.weth,
            targetTokenAddress,
          ];
          let amounts2;
          try {
            amounts2 = await targetNetwork.dexContract.getAmountsOut(
              sourceBridgeAmount,
              path2
            );
          } catch (error) {
            throw "ALERT: DEX doesn't have liquidity for this pair"
          }
          const amountsOut2 = amounts2[amounts2.length - 1];
          destinationAmountOut = amountsOut2;
        }
      }

      if (isFoundryAsset) {
        sourceAssetType = "Foundry";
      } else if (isRefineryAsset) {
        sourceAssetType = "Refinery";
      } else {
        sourceAssetType = "Ionic";
      }
      const isTargetTokenRefineryAsset = await isTargetRefineryAsset(
        targetNetwork,
        targetTokenAddress,
        sourceBridgeAmount
      );

      console.log("isTargetTokenFoundryAsset", isTargetTokenFoundry)
      if (isTargetTokenFoundry) {
        targetAssetType = "Foundry";
      } else if (isTargetTokenRefineryAsset) {
        targetAssetType = "Refinery";
      } else  {
        targetAssetType = "Ionic";
      }

      console.log("destinationAmountOut", destinationAmountOut)

      let data = { source: {}, destination: {} }
      data.source.type = sourceAssetType;
      data.source.amount = inputAmount;

      data.destination.type = targetAssetType;
      // data.destination.amount = destinationAmountOut 
      data.destination.amount = (destinationAmountOut / 10 ** Number(targetTokenDecimal)).toString();
      return data;
    }
  }
}