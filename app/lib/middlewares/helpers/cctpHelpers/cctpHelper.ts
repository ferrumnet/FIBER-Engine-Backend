import { getCCTPAttestation } from "../../../httpCalls/cctpAxiosHelper";

export const getIsCCTP = (isCCTPType: any): boolean => {
  try {
    console.log("isCCTPType", isCCTPType);
    if (isCCTPType == true || isCCTPType == "true") {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return true;
};

export const getForgeFundManager = (isCCTP: boolean, network: any): string => {
  if (isCCTP) {
    console.log("network.forgeCCTPFundManager", network.forgeCCTPFundManager);
    return network.forgeCCTPFundManager;
  } else {
    console.log("network.forgeFundManager", network.forgeFundManager);
    return network.forgeFundManager;
  }
};

export const getAttestation = async (mesgHash: string): Promise<string> => {
  console.log("mesgHash", mesgHash);
  let attestation = "";
  if (mesgHash) {
    let response = await getCCTPAttestation(mesgHash);
    console.log("response", response);
    let status = response?.status;
    if (status == "failed") {
      attestation = "";
    } else if (status == "complete") {
      attestation = response.attestation;
    } else if (status != "complete" && status != "failed") {
      await delay();
      attestation = await getAttestation(mesgHash);
    }
  }
  return attestation;
};

const delay = () => new Promise((res) => setTimeout(res, 60000));
