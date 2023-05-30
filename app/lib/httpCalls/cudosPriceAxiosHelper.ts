var axios = require("axios").default;

module.exports = {
  async getCudosPrice() {
    try {
      let headers = {
        "X-CMC_PRO_API_KEY": (global as any).environment.CMC_API,
        "Accept-Encoding": "application/json",
      };
      let baseUrl =
        "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=CUDOS";
      // let url = `${baseUrl}/networks/${chainId}`;
      let res = await axios.get(baseUrl, { headers: headers });
      console.log(res.data);
      return res.data.data.CUDOS[0].quote.USD.price;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};
