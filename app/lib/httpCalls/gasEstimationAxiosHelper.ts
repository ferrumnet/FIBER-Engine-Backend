var axios = require("axios").default;

export const getOwlracleGas = async (name: any, apiKey: string) => {
  try {
    let url = `https://api.owlracle.info/v4/${name}/gas?apikey=${apiKey}`;
    let res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getInfuraGas = async (chainId: any) => {
  try {
    let config = {
      headers: {
        Authorization: `Basic ${(global as any).environment.gasInfuraApiKeys}`,
      },
    };
    let url = `https://gas.api.infura.io/networks/${chainId}/suggestedGasFees`;
    let res = await axios.get(url, config);
    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
