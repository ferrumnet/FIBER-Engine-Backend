var tokenAbi = require("../artifacts/contracts/token/Token.sol/Token.json");
var { ethers } = require("ethers");
var signer = new ethers.Wallet((global as any).environment.PRI_KEY);

//check the requested token exist on the Source network Fund Manager
async function targetFACCheck(
  targetNetwork: any,
  tokenAddress: any,
  amount: any
) {
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

//check the requested token exist on the Source network Fund Manager
async function sourceFACCheck(sourceNetwork: any, tokenAddress: any) {
  const isSourceTokenFoundryAsset =
    await sourceNetwork.fundManagerContract.isFoundryAsset(tokenAddress);
  return isSourceTokenFoundryAsset;
}
//check source toke is foundry asset
async function isSourceRefineryAsset(
  sourceNetwork: any,
  tokenAddress: any,
  amount: any
) {
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

//check source toke is foundry asset
async function isTargetRefineryAsset(
  targetNetwork: any,
  tokenAddress: any,
  amount: any
) {
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

module.exports = {
  categoriseSwapAssets: async function (
    sourceChainId: any,
    sourceTokenAddress: any,
    targetChainId: any,
    targetTokenAddress: any,
    inputAmount: any
  ) {
    const sourceNetwork = (global as any).commonFunctions.getNetworkByChainId(
      sourceChainId
    ).multiswapNetworkFIBERInformation;
    const targetNetwork = (global as any).commonFunctions.getNetworkByChainId(
      targetChainId
    ).multiswapNetworkFIBERInformation;

    let targetAssetType;
    let sourceAssetType;
    let receipt;
    let sourceBridgeAmount;
    let destinationAmountOut;
    let machineSourceBridgeAmount: any;
    let targetFoundryTokenAddress;

    if (!sourceNetwork.isNonEVM) {
      // source token contract (required to approve function)
      const sourceTokenContract = new ethers.Contract(
        sourceTokenAddress,
        tokenAbi.abi,
        sourceNetwork.provider
      );
      const sourceFoundryTokenContract = new ethers.Contract(
        sourceNetwork.foundryTokenAddress,
        tokenAbi.abi,
        sourceNetwork.provider
      );
      const sourceTokenDecimal = await sourceTokenContract.decimals();
      const sourceFoundryTokenDecimal =
        await sourceFoundryTokenContract.decimals();
      let amount = (inputAmount * 10 ** Number(sourceTokenDecimal)).toString();
      amount = this.convert(amount);
      // is source token foundy asset
      const isFoundryAsset = await sourceFACCheck(
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
        sourceBridgeAmount = inputAmount;
        // receipt = await swapResult.wait();
      } else if (isRefineryAsset) {
        console.log("SN-1: Source Token is Refinery Asset");
        //swap refinery token to the foundry token
        let path = [sourceTokenAddress, sourceNetwork.foundryTokenAddress];
        let amounts;
        try {
          amounts = await sourceNetwork.dexContract.getAmountsOut(
            String(amount),
            path
          );
        } catch (error) {
          throw "ALERT: DEX doesn't have liquidity for this pair";
        }
        const amountsOut = amounts[1];
        sourceBridgeAmount = (
          amountsOut /
          10 ** Number(sourceFoundryTokenDecimal)
        ).toString();
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
            String(amount),
            path
          );
        } catch (error) {
          console.log("error", error);
          throw "ALERT: DEX doesn't have liquidity for this pair";
        }
        const amountsOut = amounts[amounts.length - 1];
        sourceBridgeAmount = (
          amountsOut /
          10 ** Number(sourceFoundryTokenDecimal)
        ).toString();
        //wait until the transaction be completed
        receipt = { status: 1 };
      }
    } else if (sourceNetwork.isNonEVM) {
      const recentCudosPriceInDollars =
        await cudosPriceAxiosHelper.getCudosPrice();
      sourceBridgeAmount = (await inputAmount) * recentCudosPriceInDollars;
      sourceAssetType = "Foundry";
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
      if (
        targetChainId == (global as any).utils.arbitrumChainID &&
        targetTokenAddress == (global as any).utils.cFRMTokenAddress
      ) {
        targetFoundryTokenAddress = targetTokenAddress;
      } else {
        targetFoundryTokenAddress = targetNetwork.foundryTokenAddress;
      }
      console.log("targetFoundryTokenAddress", targetFoundryTokenAddress);
      const targetFoundryTokenContract = new ethers.Contract(
        targetFoundryTokenAddress,
        tokenAbi.abi,
        targetNetwork.provider
      );
      //convert to wei
      const targetTokenDecimal = await targetTokenContract.decimals();
      const targetFoundryTokenDecimal =
        await targetFoundryTokenContract.decimals();

      if ((receipt = 1)) {
        let amountIn: any = (
          sourceBridgeAmount *
          10 ** Number(targetFoundryTokenDecimal)
        ).toString();
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
          machineSourceBridgeAmount = (
            sourceBridgeAmount *
            10 ** Number(targetFoundryTokenDecimal)
          ).toString();
        } else {
          console.log("isTargetRefineryToken", isTargetRefineryToken);
          if (isTargetRefineryToken == true) {
            console.log("TN-1: Target token is Refinery Asset");
            amountIn = Math.floor(amountIn);
            machineSourceBridgeAmount = amountIn;
            let path2 = [targetNetwork.foundryTokenAddress, targetTokenAddress];
            let amounts2;
            try {
              amounts2 = await targetNetwork.dexContract.getAmountsOut(
                String(Math.floor(amountIn)),
                path2
              );
            } catch (error) {
              throw "ALERT: DEX doesn't have liquidity for this pair";
            }
            const amountsOut2 = amounts2[1];

            destinationAmountOut = (
              amountsOut2 /
              10 ** Number(targetTokenDecimal)
            ).toString();
          } else {
            console.log("TN-1: Target Token is Ionic Asset");
            amountIn = Math.floor(amountIn);
            machineSourceBridgeAmount = amountIn;
            let path2 = [
              targetNetwork.foundryTokenAddress,
              targetNetwork.weth,
              targetTokenAddress,
            ];
            let amounts2;
            try {
              amounts2 = await targetNetwork.dexContract.getAmountsOut(
                String(amountIn),
                path2
              );
            } catch (error) {
              console.log("error", error);
              throw "ALERT: DEX doesn't have liquidity for this pair";
            }
            const amountsOut2 = amounts2[amounts2.length - 1];

            destinationAmountOut = (
              amountsOut2 /
              10 ** Number(targetTokenDecimal)
            ).toString();
          }
        }
      }
    } else if (targetNetwork.isNonEVM) {
      const recentCudosPriceInDollars =
        await cudosPriceAxiosHelper.getCudosPrice();
      destinationAmountOut =
        (await sourceBridgeAmount) / recentCudosPriceInDollars;
      machineSourceBridgeAmount = destinationAmountOut * 10 ** 18;
      machineSourceBridgeAmount = this.convert(machineSourceBridgeAmount);
      targetAssetType = "Foundry";
    }

    console.log("machineSourceBridgeAmount", machineSourceBridgeAmount);
    if (!targetNetwork.isNonEVM) {
      machineSourceBridgeAmount = String(Math.floor(machineSourceBridgeAmount));
      console.log("machineSourceBridgeAmount", machineSourceBridgeAmount);
    }

    let data: any = { source: {}, destination: {} };
    data.source.type = sourceAssetType;
    data.source.amount = inputAmount;

    data.destination.type = targetAssetType;
    data.destination.amount = String(destinationAmountOut);
    data.destination.bridgeAmount = machineSourceBridgeAmount;
    return data;
  },

  convert(n: any) {
    var sign = +n < 0 ? "-" : "",
      toStr = n.toString();
    if (!/e/i.test(toStr)) {
      return n;
    }
    var [lead, decimal, pow] = n
      .toString()
      .replace(/^-/, "")
      .replace(/^([0-9]+)(e.*)/, "$1.$2")
      .split(/e|\./);
    return +pow < 0
      ? sign +
          "0." +
          "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) +
          lead +
          decimal
      : sign +
          lead +
          (+pow >= decimal.length
            ? decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))
            : decimal.slice(0, +pow) + "." + decimal.slice(+pow));
  },
};
