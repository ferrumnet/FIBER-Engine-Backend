import { getCCTPAttestation } from "../../../httpCalls/cctpAxiosHelper";
import { getCCTPAttestationApiThreshold } from "../configurationHelper";

export const getIsCCTP = (isCCTPType: any): boolean => {
  try {
    console.log("isCCTPType", isCCTPType);
    if (isCCTPType == true || isCCTPType == "true") {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
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
  const threshold = await getCCTPAttestationApiThreshold();
  let attestation = "";
  if (mesgHash) {
    for (let count = 0; count <= threshold; count++) {
      let response = await getCCTPAttestation(mesgHash);
      console.log("response", response);
      let status = response?.status;
      if (status == "complete") {
        return response.attestation;
      }
      await delay();
    }
  }
  return attestation;
};

const delay = () => new Promise((res) => setTimeout(res, 10000));
