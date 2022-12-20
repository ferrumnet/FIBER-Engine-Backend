import crypto from 'crypto';
var CryptoJS = require("crypto-js");
import * as jwt from 'jsonwebtoken';
var fs = require("fs");

module.exports = {
  getHashedPassword: function (password: any) {
    return crypto.createHash("sha256").update(password).digest("base64");
  },

  createToken: function (object: any, expiresIn: any) {
    let options: any = {};
    if (expiresIn) {
      options.expiresIn = expiresIn;
    }
    return jwt.sign(object, (global as any).environment.jwtSecret, options);
  },

  decodeAPiToken: function (token: any) {
    return jwt.verify(token, ((global as any) as any).environment.jwtSecret);
  },

  async getValueFromStringsPhrase(queryKey: any) {
    return new Promise((resolve, reject) => {
      fs.readFile("./app/lib/stringsPhrase.json", "utf8", function (err: any, data: any) {
        if (err) {
          console.log(err);
          resolve("");
        }
        if (data) {
          const phraseObj = JSON.parse(data);
          if (phraseObj) {
            for (const [key, value] of Object.entries(phraseObj)) {
              if (key == queryKey) {
                resolve(value);
                return;
              }
            }
          }
        }
        resolve("");
      });
    });
  },
  
  encryptApiKey: function (data: any) {
    try {
      var ciphertext = CryptoJS.AES.encrypt(data, (global as any).environment.jwtSecret).toString();
      return ciphertext;
    } catch (e) {
      console.log(e);
      return '';
    }
  },

  decryptApiKey: function (data: any) {
    try {
      var bytes = CryptoJS.AES.decrypt(data, (global as any).environment.jwtSecret);
      var originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (e) {
      console.log(e);
      return '';
    }
  },

  getNetworkByChainId: function (chainId: any) {
    try {
      if ((global as any).networks) {
        return (global as any).networks.find((item: any) => item.chainId === chainId);
      }
    } catch (e) {
      console.log(e);
    }
    return null;
  },

  amountConversion: function(amount: any){
    try{
      
    }catch(e){
      console.log(e);
    }
    return amount;
  }
  
};
