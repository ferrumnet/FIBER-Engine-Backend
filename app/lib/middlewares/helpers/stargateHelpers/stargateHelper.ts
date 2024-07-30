import { checkForStargate } from "../liquidityHelper";

export const getIsStargate = (isStargate: any): boolean => {
  try {
    console.log("isStargate", isStargate);
    if (isStargate == true || isStargate == "true") {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return true;
};

export const isStargateFlow = async (
  srcAssetType: boolean,
  desAssetType: boolean,
  srcChainId: string,
  desChainId: string
): Promise<boolean> => {
  const FOUNDARY = (global as any).utils.assetType.FOUNDARY;
  const srcType = srcAssetType ? FOUNDARY : "";
  const desType = desAssetType ? FOUNDARY : "";
  return await checkForStargate(srcType, desType, srcChainId, desChainId);
};
