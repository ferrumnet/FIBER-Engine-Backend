var { ethers } = require("ethers");
var Web3 = require("web3");
require("dotenv").config();
const fundManagerAbi = require("../artifacts/contracts/upgradeable-Bridge/FundManager.sol/FundManager.json");
const fiberRouterAbi = require("../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/FiberRouter.json");
var tokenAbi = require("../artifacts/contracts/token/Token.sol/Token.json");
const routerAbi = require("../artifacts/contracts/common/uniswap/IUniswapV2Router02.sol/IUniswapV2Router02.json");
const { produecSignaturewithdrawHash, fixSig } = require("./utils/BridgeUtils");
const { BigNumber } = require("ethers");
// const {
//   bscChainId,
//   goerliChainId,
//   goerliRPC,
//   bscRPC,
//   goerliFundManager,
//   bscFundManager,
//   goerliFiberRouter,
//   bscFiberRouter,
//   bscRouter,
//   goerliRouter,
//   bscUsdt,
//   goerliUsdt,
//   bscCake,
//   goerliCake,
//   goerliUsdc,
//   bscUsdc,
//   bscAda,
//   goerliAda,
//   bscLink,
//   goerliLink,
//   bscUsdtOracle,
//   goerliUsdtOracle,
//   bscLinkOracle,
//   goerliLinkOracle,
//   goerliAave,
//   bscAave,
//   networks,
//   goerliCudos,
//   bscCudos,
// } = (global as any).networkHelper;
const cudosWithdraw = require("./cudosWithdraw");
const { ecsign, toRpcSig } = require("ethereumjs-util");
var Big = require("big.js");
const toWei = (i: any) => ethers.utils.parseEther(i);
const toEther = (i: any) => ethers.utils.formatEther(i);
const MAX_FEE_PER_GAS = "60";
const MAX_PRIORITY_FEE_PER_GAS = "60";
const GAS_LIMIT = "2000000";

// user wallet
var signer = new ethers.Wallet((global as any).environment.PRI_KEY);

module.exports = {
  web3(rpcUrl: any) {
    if (rpcUrl) {
      return new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }
    return null;
  },

  fiberRouterPool(rpcUrl: any, tokenContractAddress: any) {
    let web3 = this.web3(rpcUrl).eth;
    return new web3.Contract(fiberRouterAbi.abi, tokenContractAddress);
  },

  getTransactionsCount: async function (rpcUrl: any, walletAddress: any) {
    let web3 = this.web3(rpcUrl).eth;
    if (web3) {
      let transactionCount = await web3.getTransactionCount(
        walletAddress,
        "pending"
      );
      return transactionCount;
    }
    return null;
  },

  //check the requested token exist on the Source network Fund Manager
  sourceFACCheck: async function (sourceNetwork: any, tokenAddress: any) {
    const isSourceTokenFoundryAsset =
      await sourceNetwork.fundManagerContract.isFoundryAsset(tokenAddress);
    return isSourceTokenFoundryAsset;
  },
  //check the requested token exist on the Source network Fund Manager
  targetFACCheck: async function (
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
  },

  //check source toke is foundry asset
  isSourceRefineryAsset: async function (
    sourceNetwork: any,
    tokenAddress: any,
    amount: any
  ) {
    try {
      const isTokenFoundryAsset = await this.sourceFACCheck(
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
  },

  //check source token is foundry asset
  isTargetRefineryAsset: async function (
    targetNetwork: any,
    tokenAddress: any,
    amount: any
  ) {
    try {
      const isTokenFoundryAsset = await this.targetFACCheck(
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
  },

  getDeadLine: function () {
    const currentDate = new Date();
    const deadLine = currentDate.getTime() + 20 * 60000;
    return deadLine;
  },

  estimateGasForWithdraw: async function (sourceChainId: any, from: any) {
    let data: any = {};
    let item = await db.GasFees.findOne({ chainId: sourceChainId });
    if (item) {
      let maxFeePerGas = MAX_FEE_PER_GAS;
      let maxPriorityFeePerGas = MAX_PRIORITY_FEE_PER_GAS;
      let gasLimit = GAS_LIMIT;
      maxFeePerGas = item.maxFeePerGas;
      maxPriorityFeePerGas = item.maxPriorityFeePerGas;
      gasLimit = item.gasLimit;
      data.maxFeePerGas = Web3.utils.toHex(
        Web3.utils.toWei(maxFeePerGas, "gwei")
      );
      data.maxPriorityFeePerGas = Web3.utils.toHex(
        Web3.utils.toWei(maxPriorityFeePerGas, "gwei")
      );
      data.gasLimit = gasLimit;
    } else {
      data.gasPrice = 15000000000;
    }
    return data;
  },

  estimateGasForSwap: async function (sourceChainId: any, from: any) {
    let data: any = {};
    let item = await db.GasFees.findOne({ chainId: sourceChainId });
    if (item) {
      let maxFeePerGas = MAX_FEE_PER_GAS;
      let maxPriorityFeePerGas = MAX_PRIORITY_FEE_PER_GAS;
      let gasLimit = GAS_LIMIT;
      maxFeePerGas = item.maxFeePerGas;
      maxPriorityFeePerGas = item.maxPriorityFeePerGas;
      gasLimit = item.gasLimit;
      data.maxFeePerGas = Web3.utils.toHex(
        Web3.utils.toWei(maxFeePerGas, "gwei")
      );
      data.maxPriorityFeePerGas = Web3.utils.toHex(
        Web3.utils.toWei(maxPriorityFeePerGas, "gwei")
      );
      data.gas = { gasLimit: gasLimit };
    } else {
      data.gas = {};
    }
    return data;
  },

  //main function to bridge and swap tokens
  withdraw: async function (
    sourceTokenAddress: any,
    targetTokenAddress: any,
    sourceChainId: any,
    targetChainId: any,
    inputAmount: any,
    destinationWalletAddress: any,
    salt: any,
    body: any
  ) {
    console.log(1);
    const gas = await this.estimateGasForWithdraw(
      targetChainId,
      destinationWalletAddress
    );
    const sourceNetwork = (global as any).commonFunctions.getNetworkByChainId(
      sourceChainId
    ).multiswapNetworkFIBERInformation;
    const targetNetwork = (global as any).commonFunctions.getNetworkByChainId(
      targetChainId
    ).multiswapNetworkFIBERInformation;

    let receipt;
    let transactionHash = "";
    let destinationAmount;
    let sourceBridgeAmount: any;
    let swapResult;
    let targetFoundryTokenAddress;

    // calculate amount
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
      const amount = (
        inputAmount *
        10 ** Number(sourceTokenDecimal)
      ).toString();
      // is source token foundy asset
      const isFoundryAsset = await this.sourceFACCheck(
        sourceNetwork,
        sourceTokenAddress
      );
      //is source token refinery asset
      const isRefineryAsset = await this.isSourceRefineryAsset(
        sourceNetwork,
        sourceTokenAddress,
        amount
      );
      if (isFoundryAsset) {
        console.log("SN-1: Source Token is Foundry Asset");
        console.log("SN-2: Add Foundry Asset in Source Network FundManager");
        // approve to fiber router to transfer tokens to the fund manager contract
        sourceBridgeAmount = inputAmount;
        // receipt = await swapResult.wait();
      } else if (isRefineryAsset) {
        console.log("SN-1: Source Token is Refinery Asset");
        console.log("SN-2: Swap Refinery Asset to Foundry Asset ...");
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
        console.log("SN-2: Swap Ionic Asset to Foundry Asset ...");
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
      console.log("recentCudosPriceInDollars", recentCudosPriceInDollars);
      console.log("inputAmount", inputAmount);
      sourceBridgeAmount = (await inputAmount) * recentCudosPriceInDollars;

      console.log("sourceBridgeAmount", sourceBridgeAmount);
    }

    // withdraw
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
        console.log(
          "SUCCESS: Assets are successfully Swapped in Source Network !"
        );
        console.log("Cheers! your bridge and swap was successful !!!");

        let amountIn: any = (
          sourceBridgeAmount *
          10 ** Number(targetFoundryTokenDecimal)
        ).toString();
        const isTargetTokenFoundry = await this.targetFACCheck(
          targetNetwork,
          targetTokenAddress,
          Math.floor(amountIn)
        );
        console.log("isTargetTokenFoundry", isTargetTokenFoundry);
        if (isTargetTokenFoundry === true) {
          console.log("TN-1: Target Token is Foundry Asset");
          console.log("TN-2: Withdraw Foundry Asset...");
          // const hash = await produecSignaturewithdrawHash(
          //   targetNetwork.chainId,
          //   targetNetwork.fundManager,
          //   targetTokenAddress,
          //   destinationWalletAddress,
          //   String(Math.floor(amountIn)),
          //   salt
          // );
          // const sigP2 = ecsign(
          //   Buffer.from(hash.replace("0x", ""), "hex"),
          //   Buffer.from((global as any).environment.SIGNER.replace("0x", ""), "hex")
          // );
          // let sig2 = fixSig(toRpcSig(sigP2.v, sigP2.r, sigP2.s));
          //if target token is foundry asset
          let localSignatureData = (
            global as any
          ).signatureHelper.createLocalSignatureDataObject(
            targetNetwork.chainId,
            targetNetwork.fundManager,
            targetTokenAddress,
            destinationWalletAddress,
            String(Math.floor(amountIn)),
            salt
          );
          let signatureResponse = await (
            global as any
          ).signatureHelper.getSignature(
            body,
            (global as any).utils.assetType.FOUNDARY,
            localSignatureData
          );
          const swapResult = await targetNetwork.fiberRouterContract
            .connect(targetSigner)
            .withdrawSigned(
              targetTokenAddress, //token address on network 2
              destinationWalletAddress, //reciver
              String(signatureResponse.amount), //targetToken amount
              signatureResponse.salt,
              String(signatureResponse.signature),
              gas
            );
          const receipt = await swapResult.wait();
          if (receipt.status == 1) {
            console.log(
              "SUCCESS: Foundry Assets are Successfully Withdrawn on Source Network !"
            );
            console.log("Cheers! your bridge and swap was successful !!!");
            if (swapResult && swapResult.hash) {
              destinationAmount = sourceBridgeAmount;
              transactionHash = swapResult.hash;
              console.log("Transaction hash is: swapResult", swapResult.hash);
            }
          }
        } else {
          let amountIn: any = (
            sourceBridgeAmount *
            10 ** Number(targetFoundryTokenDecimal)
          ).toString();
          const isTargetRefineryToken = await this.isTargetRefineryAsset(
            targetNetwork,
            targetTokenAddress,
            Math.floor(amountIn)
          );
          console.log("isTargetRefineryToken", isTargetRefineryToken);
          if (isTargetRefineryToken == true) {
            console.log("TN-1: Target token is Refinery Asset");

            console.log(
              "TN-2: Withdraw and Swap Foundry Asset to Target Token ...."
            );
            let path2 = [targetNetwork.foundryTokenAddress, targetTokenAddress];
            // const hash = await produecSignaturewithdrawHash(
            //   targetNetwork.chainId,
            //   targetNetwork.fundManager,
            //   path2[0],
            //   targetNetwork.fiberRouter,
            //   String(Math.floor(amountIn)),
            //   salt
            // );
            // const sigP2 = ecsign(
            //   Buffer.from(hash.replace("0x", ""), "hex"),
            //   Buffer.from((global as any).environment.SIGNER.replace("0x", ""), "hex")
            // );
            // const sig2 = fixSig(toRpcSig(sigP2.v, sigP2.r, sigP2.s));
            let localSignatureData = (
              global as any
            ).signatureHelper.createLocalSignatureDataObject(
              targetNetwork.chainId,
              targetNetwork.fundManager,
              path2[0],
              targetNetwork.fiberRouter,
              String(Math.floor(amountIn)),
              salt
            );
            let signatureResponse = await (
              global as any
            ).signatureHelper.getSignature(
              body,
              (global as any).utils.assetType.REFINERY,
              localSignatureData
            );
            let amounts2;
            try {
              amounts2 = await targetNetwork.dexContract.getAmountsOut(
                String(signatureResponse.amount),
                path2
              );
            } catch (error) {
              throw "ALERT: DEX doesn't have liquidity for this pair";
            }
            const amountsOut2 = amounts2[1];
            console.log("amountsOut2", amountsOut2);
            const swapResult2 = await targetNetwork.fiberRouterContract
              .connect(targetSigner)
              .withdrawSignedAndSwap(
                destinationWalletAddress,
                targetNetwork.router,
                String(signatureResponse.amount),
                String(amountsOut2),
                path2,
                this.getDeadLine().toString(),
                signatureResponse.salt,
                String(signatureResponse.signature),
                gas
              );
            const receipt2 = await swapResult2.wait();
            if (receipt2.status == 1) {
              console.log(
                "SUCCESS: Foundry Assets are Successfully swapped to Target Token !"
              );
              console.log("Cheers! your bridge and swap was successful !!!");
              if (swapResult2 && swapResult2.hash) {
                destinationAmount = (
                  amountsOut2 /
                  10 ** Number(targetTokenDecimal)
                ).toString();
                transactionHash = swapResult2.hash;
                console.log(
                  "Transaction hash is:swapResult2 ",
                  swapResult2.hash
                );
              }
            }
          } else {
            console.log("TN-1: Target Token is Ionic Asset");

            console.log(
              "TN-2: Withdraw and Swap Foundry Token to Target Token ...."
            );

            let amountIn = (
              sourceBridgeAmount *
              10 ** Number(targetFoundryTokenDecimal)
            ).toString();
            let path2 = [
              targetNetwork.foundryTokenAddress,
              targetNetwork.weth,
              targetTokenAddress,
            ];
            // const hash = await produecSignaturewithdrawHash(
            //   targetNetwork.chainId,
            //   targetNetwork.fundManager,
            //   path2[0],
            //   targetNetwork.fiberRouter,
            //   amountIn,
            //   salt
            // );
            // const sigP2 = ecsign(
            //   Buffer.from(hash.replace("0x", ""), "hex"),
            //   Buffer.from((global as any).environment.SIGNER.replace("0x", ""), "hex")
            // );
            // const sig2 = fixSig(toRpcSig(sigP2.v, sigP2.r, sigP2.s));
            let localSignatureData = (
              global as any
            ).signatureHelper.createLocalSignatureDataObject(
              targetNetwork.chainId,
              targetNetwork.fundManager,
              path2[0],
              targetNetwork.fiberRouter,
              amountIn,
              salt
            );
            let signatureResponse = await (
              global as any
            ).signatureHelper.getSignature(
              body,
              (global as any).utils.assetType.IONIC,
              localSignatureData
            );
            let amounts2;
            try {
              amounts2 = await targetNetwork.dexContract.getAmountsOut(
                String(signatureResponse.amount),
                path2
              );
            } catch (error) {
              throw "ALERT: DEX doesn't have liquidity for this pair";
            }
            const amountsOut2 = amounts2[amounts2.length - 1];
            console.log("amountsOut2", amountsOut2);
            const swapResult3 = await targetNetwork.fiberRouterContract
              .connect(targetSigner)
              .withdrawSignedAndSwap(
                destinationWalletAddress,
                targetNetwork.router,
                String(signatureResponse.amount),
                String(amountsOut2),
                path2,
                this.getDeadLine().toString(), //deadline
                signatureResponse.salt,
                String(signatureResponse.signature),
                gas
              );
            const receipt3 = await swapResult3.wait();
            if (receipt3.status == 1) {
              console.log(
                "TN-3: Successfully Swapped Foundry Token to Target Token"
              );
              console.log("Cheers! your bridge and swap was successful !!!");
              if (swapResult3 && swapResult3.hash) {
                destinationAmount = (
                  amountsOut2 /
                  10 ** Number(targetTokenDecimal)
                ).toString();
                transactionHash = swapResult3.hash;
                console.log("Transaction hash is: ", swapResult3.hash);
              }
            }
          }
        }
      }
    } else if (targetNetwork.isNonEVM) {
      const recentCudosPriceInDollars =
        await cudosPriceAxiosHelper.getCudosPrice();
      console.log("amount 1", recentCudosPriceInDollars);
      sourceBridgeAmount =
        (await sourceBridgeAmount) / recentCudosPriceInDollars;
      destinationAmount = sourceBridgeAmount;
      console.log("sourceBridgeAmount2", sourceBridgeAmount);
      sourceBridgeAmount = (
        sourceBridgeAmount *
        10 ** Number(targetNetwork.decimals)
      ).toString();
      console.log("sourceBridgeAmount final", sourceBridgeAmount);
      let localSignatureData = (
        global as any
      ).signatureHelper.createLocalSignatureDataObject(
        targetNetwork.chainId,
        targetNetwork.fundManager,
        "",
        targetNetwork.fiberRouter,
        sourceBridgeAmount,
        salt
      );
      let signatureResponse = await (
        global as any
      ).signatureHelper.getSignature(
        body,
        (global as any).utils.assetType.IONIC,
        localSignatureData
      );
      const swapResult = await cudosWithdraw(
        targetTokenAddress,
        String(signatureResponse.amount),
        destinationWalletAddress,
        targetNetwork.fundManager,
        targetNetwork.fiberRouter,
        targetNetwork.rpcUrl,
        (global as any).environment.DESTINATION_CHAIN_PRIV_KEY,
        (global as any).environment.CUDOS_GAS_PRICE,
        signatureResponse.salt,
        String(signatureResponse.signature)
      );
      console.log("swapResult.transactionHash", swapResult.transactionHash);
      transactionHash = await swapResult.transactionHash;
    }
    let data: any = {};
    data.txHash = transactionHash;
    data.destinationAmount = String(destinationAmount);
    return data;
  },

  swapForAbi: async function (
    sourceWalletAddress: any,
    sourceTokenAddress: any,
    targetTokenAddress: any,
    sourceChainId: any,
    targetChainId: any,
    inputAmount: any,
    destinationWalletAddress: any
  ) {
    try {
      const sourceNetwork = (global as any).commonFunctions.getNetworkByChainId(
        sourceChainId
      ).multiswapNetworkFIBERInformation;
      const targetNetwork = (global as any).commonFunctions.getNetworkByChainId(
        targetChainId
      ).multiswapNetworkFIBERInformation;
      if (sourceNetwork.isNonEVM) {
        throw "CUDOS Swap: Please Perform Swap From Frontend";
      }
      let fiberRouter = this.fiberRouterPool(
        sourceNetwork.rpc,
        sourceNetwork.fiberRouter
      );

      //signers for both side networks
      const sourceSigner = signer.connect(sourceNetwork.provider);
      // source token contract (required to approve function)
      const sourceTokenContract = new ethers.Contract(
        sourceTokenAddress,
        tokenAbi.abi,
        sourceNetwork.provider
      );

      const sourceTokenDecimal = await sourceTokenContract.decimals();
      const amount = (
        inputAmount *
        10 ** Number(sourceTokenDecimal)
      ).toString();
      console.log("INIT: Swap Initiated for this Amount: ", inputAmount);
      // is source token foundy asset
      const isFoundryAsset = await this.sourceFACCheck(
        sourceNetwork,
        sourceTokenAddress
      );
      //is source token refinery asset
      const isRefineryAsset = await this.isSourceRefineryAsset(
        sourceNetwork,
        sourceTokenAddress,
        amount
      );

      let sourceBridgeAmount;
      let swapResult;
      if (isFoundryAsset) {
        if (!targetNetwork.isNonEVM) {
          console.log("SN-1: Source Token is Foundry Asset");
          console.log("SN-2: Add Foundry Asset in Source Network FundManager");
          // approve to fiber router to transfer tokens to the fund manager contract
          const targetFoundryTokenAddress =
            await sourceNetwork.fundManagerContract.allowedTargets(
              sourceTokenAddress,
              targetChainId
            );
          // fiber router add foundry asset to fund manager
          swapResult = fiberRouter.methods.swap(
            sourceTokenAddress,
            amount,
            targetChainId,
            targetFoundryTokenAddress,
            destinationWalletAddress
          );
          //wait until the transaction be completed
          sourceBridgeAmount = amount;
        } else if (targetNetwork.isNonEVM) {
          console.log("SN-1: Non Evm Source Token is Foundry Asset");
          console.log(
            "SN-2: Non Evm Add Foundry Asset in Source Network FundManager"
          );
          // approve to fiber router to transfer tokens to the fund manager contract
          const targetFoundryTokenAddress =
            await sourceNetwork.fundManagerContract.nonEvmAllowedTargets(
              sourceTokenAddress,
              targetChainId
            );
          // fiber router add foundry asset to fund manager
          swapResult = fiberRouter.methods.nonEvmSwap(
            sourceTokenAddress,
            amount,
            targetChainId,
            targetFoundryTokenAddress,
            destinationWalletAddress
          );
          //wait until the transaction be completed
          sourceBridgeAmount = amount;
        }
      } else if (isRefineryAsset) {
        if (!targetNetwork.isNonEVM) {
          console.log("SN-1: Source Token is Refinery Asset");
          console.log("SN-2: Swap Refinery Asset to Foundry Asset ...");
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
          sourceBridgeAmount = amountsOut;
          swapResult = fiberRouter.methods.swapAndCross(
            sourceNetwork.dexContract.address,
            amount,
            amountsOut,
            path,
            this.getDeadLine().toString(), // deadline
            targetChainId,
            targetNetwork.foundryTokenAddress,
            destinationWalletAddress
          );
        } else if (targetNetwork.isNonEVM) {
          console.log("SN-1: Non Evm Source Token is Refinery Asset");
          console.log("SN-2: Non Evm Swap Refinery Asset to Foundry Asset ...");
          //swap refinery token to the foundry token
          // const amount = await (inputAmount * 10 ** Number(targetNetwork.decimals)).toString();
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
          sourceBridgeAmount = amountsOut;
          swapResult = fiberRouter.methods.nonEvmSwapAndCross(
            sourceNetwork.dexContract.address,
            amount,
            amountsOut,
            path,
            this.getDeadLine().toString(), // deadline
            targetChainId,
            targetNetwork.foundryTokenAddress,
            destinationWalletAddress
          );
        }
      } else {
        if (!targetNetwork.isNonEVM) {
          console.log("SN-1: Source Token is Ionic Asset");
          console.log("SN-2: Swap Ionic Asset to Foundry Asset ...");
          //swap refinery token to the foundry token
          let path = [
            sourceTokenAddress,
            sourceNetwork.weth,
            sourceNetwork.foundryTokenAddress,
          ];
          console.log("path", path);
          let amounts;
          try {
            amounts = await sourceNetwork.dexContract.getAmountsOut(
              String(amount),
              path
            );
          } catch (error) {
            throw "ALERT: DEX doesn't have liquidity for this pair";
          }
          const amountsOut = amounts[amounts.length - 1];
          sourceBridgeAmount = amountsOut;
          swapResult = fiberRouter.methods.swapAndCross(
            sourceNetwork.dexContract.address,
            amount,
            amountsOut,
            path,
            this.getDeadLine().toString(), // deadline
            targetChainId,
            targetNetwork.foundryTokenAddress,
            destinationWalletAddress
          );
        } else if (targetNetwork.isNonEVM) {
          console.log("SN-1: Non Evm Source Token is Ionic Asset");
          console.log("SN-2: Non Evm Swap Ionic Asset to Foundry Asset ...");
          //swap refinery token to the foundry token
          let path = [
            sourceTokenAddress,
            sourceNetwork.weth,
            sourceNetwork.foundryTokenAddress,
          ];
          console.log("path", path);
          let amounts;
          try {
            amounts = await sourceNetwork.dexContract.getAmountsOut(
              String(amount),
              path
            );
          } catch (error) {
            throw "ALERT: DEX doesn't have liquidity for this pair";
          }
          const amountsOut = amounts[amounts.length - 1];
          sourceBridgeAmount = amountsOut;
          swapResult = fiberRouter.methods.nonEvmSwapAndCross(
            sourceNetwork.dexContract.address,
            amount,
            amountsOut,
            path,
            this.getDeadLine().toString(), // deadline
            targetChainId,
            targetNetwork.foundryTokenAddress,
            destinationWalletAddress
          );
        }
      }

      let data = "";
      if (swapResult) {
        data = swapResult.encodeABI();
      }
      let nonce = await this.getTransactionsCount(
        sourceNetwork.rpc,
        sourceWalletAddress
      );

      return {
        currency: sourceNetwork.shortName + ":" + sourceTokenAddress,
        from: sourceWalletAddress,
        amount: "0",
        contract: sourceNetwork.fiberRouter,
        data: data,
        nonce,
        description: `Swap `,
        ...(await this.estimateGasForSwap(
          sourceChainId,
          destinationWalletAddress
        )),
      };
    } catch (error) {
      throw { error };
    }
  },
};
