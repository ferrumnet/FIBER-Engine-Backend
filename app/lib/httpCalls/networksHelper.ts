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
      let url = `${baseUrl}/networks/list?isPagination=false`;
      let res = await axios.get(url);
      (global as any).networks = res.data.body.networks
      return res.data.body.networks;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

};
