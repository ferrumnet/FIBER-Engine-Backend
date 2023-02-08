var axios = require("axios").default;
var Web3 = require('web3');
var { Big } =  require("big.js");

module.exports = {

  async getNetworkByChainId(chainId: any) {
    try {
      let baseUrl = ((global as any) as any).environment.baseUrlGatewayBackend;
      let url = `${baseUrl}/networks/${chainId}`;
      let res = await axios.get(url);
      return res.data.body.network;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async getAllNetworks() {
    try {
      let baseUrl = ((global as any) as any).environment.baseUrlGatewayBackend;
      let url = `${baseUrl}/networks/list?isNonEVM=&isAllowedOnMultiSwap=true&allowFIBERData=${(global as any).environment.apiKeyForGateway}&isPagination=false`;
      let res = await axios.get(url);
      if(res.data.body && res.data.body.networks && res.data.body.networks.length){
        (global as any).networks = await (global as any).commonFunctions.convertIntoFIBERNetworks(res.data.body.networks);
        console.log('Refresh netwroks',(global as any).networks.length)
      }
      return res.data.body.networks;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

};
