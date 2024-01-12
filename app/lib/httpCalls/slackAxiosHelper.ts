var axios = require("axios").default;

export const postAlertIntoChannel = async (body: any) => {
  try {
    const url = (global as any as any).environment
      .slackMultiswapAlertNotificationUrl;
    let config = {
      headers: {
        Authorization: "",
      },
    };
    let res = await axios.post(`${url}`, body, config);
    return res.data;
  } catch (error: any) {
    console.log(error);
  }
  return null;
};
