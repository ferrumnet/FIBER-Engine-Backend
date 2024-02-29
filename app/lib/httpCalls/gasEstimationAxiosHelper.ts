var axios = require("axios").default;

module.exports = {
  async getGasEstimationByNetworkName(name: any, apiKey: string) {
    try {
      let url = `https://api.owlracle.info/v4/${name}/gas?apikey=${apiKey}`;
      let res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};
