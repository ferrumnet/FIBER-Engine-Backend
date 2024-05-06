var axios = require("axios").default;

interface Response {
  attestation: string;
  status: any;
}

export const getCCTPAttestation = async (
  msgHash: string
): Promise<Response> => {
  let attestation: any = "";
  let status = "";

  try {
    let url = `https://iris-api.circle.com/attestations/${msgHash}`;
    let res = await axios.get(url);
    console.log("getCCTPAttestation response", res?.data);
    if (res?.data?.attestation) {
      attestation = res?.data?.attestation;
    }
    if (res?.data?.status) {
      status = res?.data?.status;
    }
  } catch (error: any) {
    // console.log("getCCTPAttestation error", error);
    console.log("getCCTPAttestation error");
    status = "failed";
  }

  let response: Response = {
    attestation: attestation,
    status: status,
  };
  return response;
};
