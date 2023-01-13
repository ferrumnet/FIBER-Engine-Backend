var axios = require("axios").default;

module.exports = {

  async getReceiptBySwapHash(swapHash: any, sourceNetworkId: any) {
    try {
      // let baseUrl = ((global as any) as any).environment.baseUrlGatewayBackend;
      let baseUrl = 'http://localhost:8080/api/v1';
      let url = `${baseUrl}/transactions/receipt/by/hash/${swapHash}?sourceNetworkId=${sourceNetworkId}`;
      let res = await axios.get(url);
      console.log(res.data.body.receipt)
      if(res && res.data && res.data.body && res.data.body.receipt && res.data.body.receipt.status){
        return res.data.body.receipt;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

};
