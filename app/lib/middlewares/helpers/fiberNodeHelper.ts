let fakeAmount = "0.1";
export const getSourceAmountOut = (
  destinationAmount: string,
  actualAmount: any
): any => {
  if (destinationAmount) {
    return fakeAmount;
  } else {
    return actualAmount;
  }
};
