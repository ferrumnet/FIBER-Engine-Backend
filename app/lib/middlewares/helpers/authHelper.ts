import moment from 'moment';
var crypto = require("crypto");

module.exports = {

  async isTokenValid(token: any) {
    try{
      let decryptedToken = commonFunctions.decryptApiKey(token);
      if(decryptedToken){
        let tokenIntoJsonObject = JSON.parse(decryptedToken);
        if(tokenIntoJsonObject){

          let validateRandomKey = await this.validateRandomKey(tokenIntoJsonObject);
          if(validateRandomKey == false){
            return false;
          }

          let validateDates = await this.validateDates(tokenIntoJsonObject);
          if(validateDates == false){
            return false;
          }

          let validateAPIKey = await this.validateAPIKey(tokenIntoJsonObject);
          if(validateAPIKey == false){
            return false;
          }

          await this.saveRandomKey(tokenIntoJsonObject);
        }
      }
    }catch(e: any){
      console.log(e);
      return false;
    }

    return true;
  },

  validateDates(data: any) {
    try{
      if(data.startDateTime && data.endDateTime){
        let currentDate = moment().utc();
        let startDate = moment(data.startDateTime).utc();
        let endDate = moment(data.endDateTime).utc();
        return currentDate.isBetween(startDate, endDate);
      }
    }catch(e: any){
      console.log(e);
    }

    return false;
  },

  validateAPIKey(data: any) {
    try{
      if(data.apiKey && data.apiKey == (global as any).environment.apiKeyForGateway){
        return true;
      }
    }catch(e: any){
      console.log(e);
    }

    return false;
  },

  async validateRandomKey(data: any) {
    try{
      if(data.randomKey){
        let count = await db.RandomKeys.countDocuments({key: data.randomKey});
        if(count == 0){
          return true;
        }
      }
    }catch(e: any){
      console.log(e);
    }

    return false;
  },

  async saveRandomKey(data: any) {
    try{
      if(data.randomKey){

        let body: any = {};
        body.key = data.randomKey;
        body.createdAt = new Date();
        body.updatedAt = new Date();

        await db.RandomKeys.create(body);
      }
    }catch(e: any){
      console.log(e);
    }
  },

  async createAuthToken() {
    let timelapse = 5;
    let currentTime = new Date();
    let startDateTime = moment(currentTime).subtract('minutes', timelapse).utc().format();
    let endDateTime = moment(currentTime).add('minutes', timelapse).utc().format();
    let randomKey = crypto.randomBytes(512).toString('hex');
    let apiKey = (global as any).environment.apiKeyForGateway;
    let tokenBody: any = {};
    tokenBody.startDateTime = startDateTime;
    tokenBody.endDateTime = endDateTime;
    tokenBody.randomKey = randomKey;
    tokenBody.apiKey = apiKey;

    let strTokenBody = JSON.stringify(tokenBody)
    let encryptedSessionToken = commonFunctions.encryptApiKey(strTokenBody);
    return encryptedSessionToken;

  },
  

}
