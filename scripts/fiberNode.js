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
    sourceTokenAddress,
    targetChainId,
    targetTokenAddress,
    inputAmount
  ) {
    const sourceNetwork = global.commonFunctions.getNetworkByChainId(sourceChainId).multiswapNetworkFIBERInformation;
    const targetNetwork = global.commonFunctions.getNetworkByChainId(targetChainId).multiswapNetworkFIBERInformation;

    let targetAssetType;
    let sourceAssetType;
    let receipt;
    let sourceBridgeAmount;
    let destinationAmountOut;

    if (!sourceNetwork.isNonEVM) {
      // source token contract (required to approve function)
      const sourceTokenContract = new ethers.Contract(
        sourceTokenAddress,
        tokenAbi.abi,
        sourceNetwork.provider
      );
      const sourceTokenDecimal = await sourceTokenContract.decimals();
      const amount = (inputAmount * 10 ** Number(sourceTokenDecimal)).toString();
      // is source token foundy asset
      const isFoundryAsset = await this.sourceFACCheck(
        sourceNetwork,
        sourceTokenAddress
      );
      //is source token refinery asset
      const isRefineryAsset = await isSourceRefineryAsset(
        sourceNetwork,
        sourceTokenAddress,
        amount
      );

      if (isFoundryAsset) {
        sourceAssetType = "Foundry";
      } else if (isRefineryAsset) {
        sourceAssetType = "Refinery";
      } else {
        sourceAssetType = "Ionic";
      }
      if (isFoundryAsset) {
        console.log("SN-1: Source Token is Foundry Asset");
        // approve to fiber router to transfer tokens to the fund manager contract
        sourceBridgeAmount = inputAmount
        // receipt = await swapResult.wait();
      } else if (isRefineryAsset) {
        console.log("SN-1: Source Token is Refinery Asset");
        //swap refinery token to the foundry token
        let path = [sourceTokenAddress, sourceNetwork.foundryTokenAddress];
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
        sourceBridgeAmount = (amountsOut * 10 / Number(sourceTokenDecimal)).toString();
      } else {
        console.log("SN-1: Source Token is Ionic Asset");
        //swap refinery token to the foundry token
        let path = [
          sourceTokenAddress,
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
    } else if (sourceNetwork.isNonEVM) {

      const recentCudosPriceInDollars = await cudosPriceHelper.getCudosPrice();
      console.log("recentCudosPriceInDollars", recentCudosPriceInDollars)
      console.log("inputAmount", inputAmount)
      sourceBridgeAmount = await inputAmount * recentCudosPriceInDollars;
      sourceAssetType = "Foundry"
    }
    if (!targetNetwork.isNonEVM) {
      // ==========================================

      const targetSigner = signer.connect(targetNetwork.provider);

      // source token contract
      const targetTokenContract = new ethers.Contract(
        targetTokenAddress,
        tokenAbi.abi,
        targetNetwork.provider
      );
      //convert to wei
      const targetTokenDecimal = await targetTokenContract.decimals();

      if (receipt = 1) {

        let amountIn = (sourceBridgeAmount * 10 ** Number(targetTokenDecimal)).toString();
        console.log("amountInamountInamountIn", amountIn)
        const isTargetTokenFoundry = await targetFACCheck(
          targetNetwork,
          targetTokenAddress,
          Math.floor(amountIn)
        );

         const isTargetRefineryToken = await isTargetRefineryAsset(
            targetNetwork,
            targetTokenAddress,
            Math.floor(amountIn)
          );

      if (isTargetTokenFoundry) {
        targetAssetType = "Foundry";
      } else if (isTargetRefineryToken) {
        targetAssetType = "Refinery";
      } else {
        targetAssetType = "Ionic";
      }
        if (isTargetTokenFoundry === true) {
          console.log("TN-1: Target Token is Foundry Asset");
          destinationAmountOut = sourceBridgeAmount;

        } else {
          let amountIn = (sourceBridgeAmount * 10 ** Number(targetTokenDecimal)).toString();
  
          console.log("isTargetRefineryToken", isTargetRefineryToken)
          if (isTargetRefineryToken == true) {
            console.log("TN-1: Target token is Refinery Asset");

            let path2 = [targetNetwork.foundryTokenAddress, targetTokenAddress];
            let amounts2;
            try {
              amounts2 = await targetNetwork.dexContract.getAmountsOut(
                Math.floor(amountIn),
                path2
              );
            } catch (error) {
              throw "ALERT: DEX doesn't have liquidity for this pair"
            }
            const amountsOut2 = amounts2[1];

            destinationAmountOut = (amountsOut2 / 10 ** Number(targetTokenDecimal)).toString();

          } else {
            console.log("TN-1: Target Token is Ionic Asset");

            let amountIn = (sourceBridgeAmount * 10 ** Number(targetTokenDecimal)).toString();

            let path2 = [
              targetNetwork.foundryTokenAddress,
              targetNetwork.weth,
              targetTokenAddress,
            ];
            let amounts2;
            try {
              amounts2 = await targetNetwork.dexContract.getAmountsOut(
                amountIn,
                path2
              );
            } catch (error) {
              throw "ALERT: DEX doesn't have liquidity for this pair"
            }
            const amountsOut2 = amounts2[amounts2.length - 1];

            destinationAmountOut = (amountsOut2 / 10 ** Number(targetTokenDecimal)).toString();

          } 

        }
      }
    } else if (targetNetwork.isNonEVM) {
      const recentCudosPriceInDollars = await cudosPriceHelper.getCudosPrice();
      console.log("amount 1", recentCudosPriceInDollars)
      destinationAmountOut = await sourceBridgeAmount / recentCudosPriceInDollars;
      targetAssetType = "Foundry"
    }

      console.log("destinationAmountOut", destinationAmountOut)

      let data = { source: {}, destination: {} }
      data.source.type = sourceAssetType;
      data.source.amount = inputAmount;

      data.destination.type = targetAssetType;
      // data.destination.amount = destinationAmountOut 
      data.destination.amount = String(destinationAmountOut)
      return data;
    }
  }




