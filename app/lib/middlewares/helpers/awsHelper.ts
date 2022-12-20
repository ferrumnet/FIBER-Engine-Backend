var mongoose = require('mongoose');
var AWS = require('aws-sdk'),
      region = (global as any).environment.region,
      secretName = (global as any).environment.secretName,
      secret,
      decodedBinarySecret;

module.exports = {

  async awsSecretsManagerInit() {
    return new Promise(async (resolve, reject) => {
      var client = new AWS.SecretsManager({
        region: region,
        accessKeyId: (global as any).environment.accessKeyId,
        secretAccessKey: (global as any).environment.secretAccessKey,
      });
      client.getSecretValue({ SecretId: secretName }, function (err: any, data: any) {
        if (err) {
            console.log("aws error: "+err)
            reject('')
        }else {
          if ('SecretString' in data) {
            secret = data.SecretString;
            var secretJson = JSON.parse(secret);
            (global as any).environment = secretJson
          } else {
            let buff = new Buffer(data.SecretBinary, 'base64');
            decodedBinarySecret = buff.toString('ascii');
          }
          resolve('')
        }
    })
    });
  }
}
