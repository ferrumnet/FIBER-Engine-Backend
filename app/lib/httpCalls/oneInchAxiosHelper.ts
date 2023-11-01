var axios = require("axios").default;

export const OneInchSwap = async (): Promise<any> => {
  try {
    let config = {
      headers: {
        Authorization: `Bearer ${
          (global as any as any).environment.OneInchApiKey
        }`,
      },
    };
    let url = `https://api.1inch.dev/swap/v5.2/56/swap?src=0xA719b8aB7EA7AF0DDb4358719a34631bb79d15Dc&dst=0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d&amount=1000000&from=0xb907da3947a589B56FD05a1740c09Ea06B3C9bbc&slippage=1&disableEstimate=true&includeProtocols=true&allowPartialFill=true`;
    let res = await axios.get(url, config);
    console.log("OneInch Swap", res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
