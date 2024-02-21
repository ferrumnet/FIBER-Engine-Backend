var axios = require("axios").default;

export const getQuote = async (symbol: string): Promise<any> => {
  try {
    let headers = {
      "X-CMC_PRO_API_KEY": (global as any).environment.CMC_API,
      "Accept-Encoding": "application/json",
    };
    let baseUrl = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}`;
    let res = await axios.get(baseUrl, { headers: headers });
    return filterResponse(res?.data?.data)?.quote?.USD?.price;
  } catch (error: any) {
    console.log("error", error);
  }
  return "";
};

const filterResponse = (data: any) => {
  try {
    if (data) {
      for (var key in data) {
        if (data[key]) {
          return data[key][0];
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
