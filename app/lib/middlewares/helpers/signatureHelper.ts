var HDWalletProvider = require("@truffle/hdwallet-provider");
var Web3= require("web3");
import crypto from 'crypto';
var CryptoJS = require("crypto-js");

module.exports = { 

  createSignature: async function (model: any, network: any) {
    var privateAccountKey = this.decryptApiKey(((global as any) as any).environment.walletAccountPrivateKey);
    let provider = new HDWalletProvider(privateAccountKey, network.rpcUrl);
    var web3 = new Web3(provider);
    var key = crypto.randomBytes(20).toString('hex');
    key = Web3.utils.keccak256(
			key
		);
    model.key = key;
    var hash = this.getMessageHash(model);
    var signature = await web3.eth.sign(hash, ((global as any) as any).environment.walletPublicAddress);
    console.log('signature:::',signature)
    return {
      signature: signature,
      salt: hash,
      key: key
    };
  },

  getMessageHash: function (model: any) {
    let body = Web3.utils.encodePacked(model.name, model.tokenContractAddress, model.key, model.chainId);
    let hash = Web3.utils.keccak256(
			body
		);
    return hash;
  },

  decryptApiKey: function (data: any) {
    try{
      var bytes  = CryptoJS.AES.decrypt(data, (global as any).environment.jwtSecret);
      var originalText = bytes.toString(CryptoJS.enc.Utf8);   
      return originalText;   
    }catch(e){
      console.log(e);
      return '';
    }
  }

}
