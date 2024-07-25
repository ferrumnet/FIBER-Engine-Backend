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
