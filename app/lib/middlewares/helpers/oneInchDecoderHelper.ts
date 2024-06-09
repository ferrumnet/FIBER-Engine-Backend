export const removeSelector = (data: any) => {
  if (data) {
    return "0x" + data.slice(10);
  }
  return data;
};

export const getSelector = (data: any) => {
  if (data) {
    return data.slice(0, 10);
  }
  return data;
};
