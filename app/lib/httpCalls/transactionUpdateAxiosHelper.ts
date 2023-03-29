var axios = require("axios").default;
var Web3 = require('web3');
var { Big } =  require("big.js");
var CryptoJS = require("crypto-js");

module.exports = {

  async updateTransactionJobStatus(txHash: string, body: any) {
    try {
      let config = {
        headers: {
          Authorization: this.getGatewayBackendToken(),
        }
      };
      let baseUrl = ((global as any) as any).environment.baseUrlGatewayBackend;
      let url = `${baseUrl}/transactions/update/swap/and/withdraw/job/${txHash}?isFrom=fiber`;
      let res = await axios.put(
        url,
        body,
        config
      );
      console.log('updateTransactionJobStatus response',res.data)
      return res;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  getGatewayBackendToken () {
    return 'Bearer ' + this.doEncryption();
  },
  
  doEncryption () {
    try {
      const privateKey = (global as any).environment.privateKeyForAuth;
      const publicKey = (global as any).environment.publicKeyForAuth;
      var ciphertext = CryptoJS.AES.encrypt(publicKey, privateKey);
      return ciphertext;
    } catch (e) {
      console.log(e);
      return '';
    }
  }

};
