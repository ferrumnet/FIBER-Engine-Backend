var Web3= require("web3");
const abiDecoder = require('abi-decoder'); // NodeJS

module.exports = {

  getWithdrawReqObject: async function (req: any) {
    try{
      let data: any = {};
      let sourceNetwork = commonFunctions.getNetworkByChainId(req.query.sourceNetworkChainId);
      console.log('sourceNetwork',sourceNetwork);
      if(sourceNetwork){
        let receipt = await receiptsHelper.getReceiptBySwapHash(req.query.swapTransactionHash, sourceNetwork._id);
        // check receipt status here
        console.log('swap receipt',receipt);
        let web3 = web3ConfigurationHelper.web3(sourceNetwork.rpcUrl).eth;
        let transaction = await web3.getTransaction(req.query.swapTransactionHash);
        console.log('swap transaction',transaction);
        if (transaction) {
          data.sourceAmount = await this.getValueFromWebTransaction(transaction, 'amountIn');
          if(!data.sourceAmount){
            data.sourceAmount = await this.getValueFromWebTransaction(transaction, 'amount');
          }
          data.sourceWalletAddress = transaction.from;
          data.destinationWalletAddress = await this.getValueFromWebTransaction(transaction, 'targetAddress');
          if(data.sourceWalletAddress){
            data.sourceWalletAddress = (data.sourceWalletAddress).toLowerCase();
          }
          if(data.destinationWalletAddress){
            data.destinationWalletAddress = (data.destinationWalletAddress).toLowerCase();
          }
          console.log('swap req data object',data);
        }
      }
      

    }catch(e){
      console.log('error',e)
    }
  },

  getValueFromWebTransaction: async function (transaction: any, paramName: any) {
    let amount = null;
    if(transaction){
      abiDecoder.addABI(web3ConfigurationHelper.getfiberAbi());
      const decodedData = await abiDecoder.decodeMethod(transaction.input);
      console.log(decodedData);
      if(decodedData && decodedData.params && decodedData.params.length > 0){
        for(let item of decodedData.params||[]){
          console.log(item.name);
          if(item && item.name == paramName){
            if(item.value){
              return item.value;
            }

          }
        }
      }
    }
    return amount;
  }

}
