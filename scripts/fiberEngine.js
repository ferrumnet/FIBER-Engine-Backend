const { ethers } = require("ethers");
const axios = require("axios");
const Web3 = require('web3');
require("dotenv").config();
const fundManagerAbi = require("../artifacts/contracts/upgradeable-Bridge/FundManager.sol/FundManager.json");
const fiberRouterAbi = require("../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/FiberRouter.json");
const tokenAbi = require("../artifacts/contracts/token/Token.sol/Token.json");
const routerAbi = require("../artifacts/contracts/common/uniswap/IUniswapV2Router02.sol/IUniswapV2Router02.json");
const { produecSignaturewithdrawHash, fixSig } = require("./utils/BridgeUtils");
const {
  bscChainId,
  goerliChainId,
  goerliRPC,
  bscRPC,
  goerliFundManager,
  bscFundManager,
  goerliFiberRouter,
  bscFiberRouter,
  bscRouter,
  goerliRouter,
  bscUsdt,
  goerliUsdt,
  bscCake,
  goerliCake,
  goerliUsdc,
  bscUsdc,
  bscAda,
  goerliAda,
  bscLink,
  goerliLink,
  bscUsdtOracle,
  goerliUsdtOracle,
  bscLinkOracle,
  goerliLinkOracle,
  goerliAave,
  bscAave,
  networks,
  goerliCudos,
  bscCudos,
} = global.networkHelper;
const { ecsign, toRpcSig } = require("ethereumjs-util");
const Big = require('big.js');
const toWei = (i) => ethers.utils.parseEther(i);
const toEther = (i) => ethers.utils.formatEther(i);

// user wallet
const signer = new ethers.Wallet(global.environment.PRI_KEY);

module.exports = {

  web3(rpcUrl) {
    if (rpcUrl) {
      return new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }
    return null;
  },

  fiberRouterPool(rpcUrl, tokenContractAddress) {
    let web3 = this.web3(rpcUrl).eth;
    return new web3.Contract(fiberRouterAbi.abi, tokenContractAddress);
  },

  getTransactionsCount: async function (rpcUrl, walletAddress) {
    let web3 = this.web3(rpcUrl).eth;
    if (web3) {
      let transactionCount = await web3.getTransactionCount(walletAddress, 'pending')
      return transactionCount;
    }
    return null;
  },

  //check the requested token exist on the Source network Fund Manager
  sourceFACCheck: async function (sourceNetwork, tokenAddress) {
    const isSourceTokenFoundryAsset =
      await sourceNetwork.fundManagerContract.isFoundryAsset(tokenAddress);
    return isSourceTokenFoundryAsset;
  },

  //check the requested token exist on the Source network Fund Manager
  targetFACCheck: async function (targetNetwork, tokenAddress, amount) {
    const targetTokenContract = new ethers.Contract(
      tokenAddress,
      tokenAbi.abi,
      targetNetwork.provider
    );
    const isTargetTokenFoundryAsset =
      await targetNetwork.fundManagerContract.isFoundryAsset(tokenAddress);
    console.log("isTargetTokenFoundryAsset111", isTargetTokenFoundryAsset)
    const targetFoundryAssetLiquidity = await targetTokenContract.balanceOf(
      targetNetwork.fundManagerContract.address
    );
    console.log("targetFoundryAssetLiquidity1111", targetFoundryAssetLiquidity)
    console.log("amountamount", amount)


    
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
  isSourceRefineryAsset: async function (sourceNetwork, tokenAddress, amount) {
    try {
      const isTokenFoundryAsset = await this.sourceFACCheck(
        sourceNetwork,
        tokenAddress
      );

      let path = [tokenAddress, sourceNetwork.foundryTokenAddress];
      const amounts = await sourceNetwork.dexContract.getAmountsOut(
        amount,
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
  isTargetRefineryAsset: async function (targetNetwork, tokenAddress, amount) {
    try {
      const isTokenFoundryAsset = await this.targetFACCheck(
        targetNetwork,
        tokenAddress,
        amount
      );

      let path = [targetNetwork.foundryTokenAddress, tokenAddress];
      const amounts = await targetNetwork.dexContract.getAmountsOut(
        amount,
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

  estimateGasForWithdraw: async function (sourceChainId, from) {
    let estimatedGas
    const network = networks[sourceChainId];

    const web3 = new Web3(network.rpc)
    
    if (sourceChainId = 137) {
      let gas = await web3.eth.estimateGas({
        from: from
      });
      gas = 60000 + gas;
      let gasPrice = await web3.eth.getGasPrice();
      gasPrice = new Big(gasPrice).mul(1.5).round().toString();
      estimatedGas = gasPrice;
    } else {
      estimatedGas = 1000000000000;
    }
    return estimatedGas;
  },

  estimateGasForSwap: async function (sourceChainId, from) {
    let data = {};
    if(sourceChainId == 137){
      let maxFeePerGas = '60';
      let maxPriorityFeePerGas = '60';
      let gasLimit = '2000000';

      let item = await db.GasFees.findOne({type: 'polygon'});
      if(item){
        maxFeePerGas = item.maxFeePerGas;
        maxPriorityFeePerGas = item.maxPriorityFeePerGas;
        gasLimit = item.gasLimit;
      }

      data.maxFeePerGas = Web3.utils.toHex(Web3.utils.toWei(maxFeePerGas, 'gwei'));
      data.maxPriorityFeePerGas = Web3.utils.toHex(Web3.utils.toWei(maxPriorityFeePerGas, 'gwei'));
      data.gas = {gasLimit: gasLimit};
    }else {
      data.gas = {};
    }
    return data;
  },

  //main function to bridge and swap tokens
  withdraw: async function (
    sourcetokenAddress,
    targetTokenAddress,
    sourceChainId,
    targetChainId,
    inputAmount,
    destinationWalletAddress
  ) {
    const gas = await this.estimateGasForWithdraw(targetChainId, destinationWalletAddress);
    // mapping source and target networs (go to Network.js file)
    const sourceNetwork = networks[sourceChainId];
    const targetNetwork = networks[targetChainId];
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
    const isRefineryAsset = await this.isSourceRefineryAsset(
      sourceNetwork,
      sourcetokenAddress,
      amount
    );

    let receipt;
    let transactionHash = '';
    let sourceBridgeAmount;
    let swapResult;
    if (isFoundryAsset) {
      console.log("SN-1: Source Token is Foundry Asset");
      console.log("SN-2: Add Foundry Asset in Source Network FundManager");
      // approve to fiber router to transfer tokens to the fund manager contract
      sourceBridgeAmount = (inputAmount * 10 ** Number(targetTokenDecimal)).toString();
      // receipt = await swapResult.wait();
    } else if (isRefineryAsset) {
      console.log("SN-1: Source Token is Refinery Asset");
      console.log("SN-2: Swap Refinery Asset to Foundry Asset ...");
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
      console.log("SN-2: Swap Ionic Asset to Foundry Asset ...");
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
      console.log(
        "SUCCESS: Assets are successfully Swapped in Source Network !"
      );
      console.log("Cheers! your bridge and swap was successful !!!");
      let amountIn = (inputAmount * 10 ** Number(targetTokenDecimal)).toString();
      // console.log("Transaction hash is: swapResult===================>", swapResult);
      const isTargetTokenFoundry = await this.targetFACCheck(
        targetNetwork,
        targetTokenAddress,
        Math.floor(amountIn)
      );
      console.log("isTargetTokenFoundry", isTargetTokenFoundry)
      const Salt = Web3.utils.randomHex(32);
      if (isTargetTokenFoundry === true) {
        console.log("TN-1: Target Token is Foundry Asset");
        console.log("TN-2: Withdraw Foundry Asset...");
        const hash = await produecSignaturewithdrawHash(
          targetNetwork.chainId,
          targetNetwork.fundManager,
          targetTokenAddress,
          destinationWalletAddress,
          sourceBridgeAmount,
          Salt
        );
        const sigP2 = ecsign(
          Buffer.from(hash.replace("0x", ""), "hex"),
          Buffer.from(global.environment.SIGNER.replace("0x", ""), "hex")
        );
        const sig2 = fixSig(toRpcSig(sigP2.v, sigP2.r, sigP2.s));
        //if target token is foundry asset
        const swapResult = await targetNetwork.fiberRouterContract
          .connect(targetSigner)
          .withdrawSigned(
            targetTokenAddress, //token address on network 2
            destinationWalletAddress, //reciver
            sourceBridgeAmount, //targetToken amount
            Salt,
            sig2,
            { gasPrice: gas }  );


        const receipt = await swapResult.wait();
        if (receipt.status == 1) {
          console.log(
            "SUCCESS: Foundry Assets are Successfully Withdrawn on Source Network !"
          );
          console.log("Cheers! your bridge and swap was successful !!!");
          if (swapResult && swapResult.hash) {
            transactionHash = swapResult.hash;
            console.log("Transaction hash is: swapResult", swapResult.hash);
          }
        }
      } else {
        const isTargetRefineryToken = await this.isTargetRefineryAsset(
          targetNetwork,
          targetTokenAddress,
          sourceBridgeAmount
        );
        console.log("isTargetRefineryToken", isTargetRefineryToken)
        if (isTargetRefineryToken == true) {
          console.log("TN-1: Target token is Refinery Asset");

          console.log(
            "TN-2: Withdraw and Swap Foundry Asset to Target Token ...."
          );
          console.log("sourceBridgeAmountsourceBridgeAmountsourceBridgeAmountsourceBridgeAmountsourceBridgeAmount", sourceBridgeAmount)
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
          const hash = await produecSignaturewithdrawHash(
            targetNetwork.chainId,
            targetNetwork.fundManager,
            path2[0],
            targetNetwork.fiberRouter,
            sourceBridgeAmount,
            Salt
          );
          const sigP2 = ecsign(
            Buffer.from(hash.replace("0x", ""), "hex"),
            Buffer.from(global.environment.SIGNER.replace("0x", ""), "hex")
          );
          const sig2 = fixSig(toRpcSig(sigP2.v, sigP2.r, sigP2.s));
          console.log("Sig produced2=====================>2", sig2, sigP2, targetSigner.address);

          const amountsOut2 = amounts2[1];
          const swapResult2 = await targetNetwork.fiberRouterContract
            .connect(targetSigner)
            .withdrawSignedAndSwap(
              destinationWalletAddress,
              targetNetwork.router,
              sourceBridgeAmount,
              amountsOut2,
              path2,
              this.getDeadLine().toString(),
              Salt,
              sig2,
              { gasPrice: gas }
            );
          const receipt2 = await swapResult2.wait();
          if (receipt2.status == 1) {
            console.log(
              "SUCCESS: Foundry Assets are Successfully swapped to Target Token !"
            );
            console.log("Cheers! your bridge and swap was successful !!!");
            if (swapResult2 && swapResult2.hash) {
              transactionHash = swapResult2.hash;
              console.log("Transaction hash is:swapResult2 ", swapResult2.hash);
            }
          }
        } else {
          console.log("TN-1: Target Token is Ionic Asset");

          console.log(
            "TN-2: Withdraw and Swap Foundry Token to Target Token ...."
          );
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
          const hash = await produecSignaturewithdrawHash(
            targetNetwork.chainId,
            targetNetwork.fundManager,
            path2[0],
            targetNetwork.fiberRouter,
            sourceBridgeAmount,
            Salt
          );

          console.log("targetChainId", targetChainId, "targetNetwork.fundManager", targetNetwork.fundManager, "targetTokenAddress", targetTokenAddress, "=========>path2[0]", path2[0], "targetSigner.address", targetSigner.address, "sourceBridgeAmount", sourceBridgeAmount, "Salt", Salt)
          const sigP2 = ecsign(
            Buffer.from(hash.replace("0x", ""), "hex"),
            Buffer.from(global.environment.SIGNER.replace("0x", ""), "hex")
          );
          const sig2 = fixSig(toRpcSig(sigP2.v, sigP2.r, sigP2.s));
          console.log("Sig produced2=====================>1", sig2, sigP2, targetSigner.address);

          const swapResult3 = await targetNetwork.fiberRouterContract
            .connect(targetSigner)
            .withdrawSignedAndSwap(
              destinationWalletAddress,
              targetNetwork.router,
              sourceBridgeAmount,
              amountsOut2,
              path2,
              this.getDeadLine().toString(), //deadline
              Salt,
              sig2,
              { gasPrice: gas }
            );
          const receipt3 = await swapResult3.wait();
          if (receipt3.status == 1) {
            console.log(
              "TN-3: Successfully Swapped Foundry Token to Target Token"
            );
            console.log("Cheers! your bridge and swap was successful !!!");
            if (swapResult3 && swapResult3.hash) {
              transactionHash = swapResult3.hash;
              console.log("Transaction hash is: ", swapResult3.hash);
            }
          }
        }
      }
    }

    return transactionHash;
  },

  swapForAbi: async function (
    sourceWalletAddress,
    sourcetokenAddress,
    targetTokenAddress,
    sourceChainId,
    targetChainId,
    inputAmount,
    destinationWalletAddress
  ) {
    // mapping source and target networs (go to Network.js file)
    const sourceNetwork = networks[sourceChainId];
    const targetNetwork = networks[targetChainId];

    console.log("=========================>2", await sourceNetwork)


    let fiberRouter = this.fiberRouterPool(sourceNetwork.rpc, sourceNetwork.fiberRouter);

    //signers for both side networks
    const sourceSigner = signer.connect(sourceNetwork.provider);
    const targetSigner = signer.connect(targetNetwork.provider);
    // source token contract (required to approve function)
    const sourceTokenContract = new ethers.Contract(
      sourcetokenAddress,
      tokenAbi.abi,
      sourceNetwork.provider
    );

    const sourceTokenDecimal = await sourceTokenContract.decimals();
    const amount = (inputAmount * 10 ** Number(sourceTokenDecimal)).toString();
    console.log("INIT: Swap Initiated for this Amount: ", inputAmount);
    // is source token foundy asset
    const isFoundryAsset = await this.sourceFACCheck(
      sourceNetwork,
      sourcetokenAddress
    );
    //is source token refinery asset
    const isRefineryAsset = await this.isSourceRefineryAsset(
      sourceNetwork,
      sourcetokenAddress,
      amount
    );

    let sourceBridgeAmount;
    let swapResult;
    if (isFoundryAsset) {
      console.log("SN-1: Source Token is Foundry Asset");
      console.log("SN-2: Add Foundry Asset in Source Network FundManager");
      // approve to fiber router to transfer tokens to the fund manager contract
      const targetFoundryTokenAddress = await sourceNetwork.fundManagerContract.allowedTargets(sourcetokenAddress, targetChainId);
      // fiber router add foundry asset to fund manager
      swapResult = fiberRouter.methods
        .swap(
          sourcetokenAddress,
          amount,
          targetChainId,
          targetFoundryTokenAddress,
          destinationWalletAddress,
        );
      //wait until the transaction be completed
      sourceBridgeAmount = amount;
    } else if (isRefineryAsset) {
      console.log("SN-1: Source Token is Refinery Asset");
      console.log("SN-2: Swap Refinery Asset to Foundry Asset ...");
      //swap refinery token to the foundry token
      let path = [sourcetokenAddress, sourceNetwork.foundryTokenAddress];

      const amounts = await sourceNetwork.dexContract.getAmountsOut(
        amount,
        path
      );
      const amountsOut = amounts[1];
      sourceBridgeAmount = amountsOut;
      swapResult = fiberRouter.methods
        .swapAndCross(
          sourceNetwork.dexContract.address,
          amount,
          amountsOut,
          path,
          this.getDeadLine().toString(), // deadline
          targetChainId,
          targetNetwork.foundryTokenAddress
        );
    } else {
      console.log("SN-1: Source Token is Ionic Asset");
      console.log("SN-2: Swap Ionic Asset to Foundry Asset ...");
      //swap refinery token to the foundry token
      let path = [
        sourcetokenAddress,
        sourceNetwork.weth,
        sourceNetwork.foundryTokenAddress,
      ];
      console.log("path", path);

      const amounts = await sourceNetwork.dexContract.getAmountsOut(
        amount,
        path
      );
      const amountsOut = amounts[amounts.length - 1];
      sourceBridgeAmount = amountsOut;
      swapResult = fiberRouter.methods
        .swapAndCross(
          sourceNetwork.dexContract.address,
          amount,
          amountsOut,
          path,
          this.getDeadLine().toString(), // deadline
          targetChainId,
          targetNetwork.foundryTokenAddress
        );
    }

    let data = '';
    if (swapResult) {
      data = swapResult.encodeABI();
    }
    let nonce = await this.getTransactionsCount(sourceNetwork.rpc, sourceWalletAddress);

    return {
      currency: sourceNetwork.shortName + ':' + sourcetokenAddress,
      from: sourceWalletAddress,
      amount: '0',
      contract: sourceNetwork.fiberRouter,
      data: data,
      nonce,
      description: `Swap `,
      ...await this.estimateGasForSwap(sourceChainId, destinationWalletAddress)
    };
  },
  
}