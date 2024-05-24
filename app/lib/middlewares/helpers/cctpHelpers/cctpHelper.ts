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

export const getAttestation = async (
  mesgHash: string,
  recursionCount = 0
): Promise<string> => {
  console.log("mesgHash", mesgHash);
  let attestation = "";
  if (mesgHash) {
    let response = await getCCTPAttestation(mesgHash);
    console.log("response", response);
    let status = response?.status;
    if (status == "complete") {
      attestation = response.attestation;
    } else if (recursionCount < (await getCCTPAttestationApiThreshold())) {
      await delay();
      recursionCount = recursionCount + 1;
      attestation = await getAttestation(mesgHash, recursionCount);
    }
  }
  return attestation;
};

const delay = () => new Promise((res) => setTimeout(res, 10000));
