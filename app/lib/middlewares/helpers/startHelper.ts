module.exports = {
  startHelperInit(process: any) {
    // deafult environmentTag: dev and environmentType: api
    let starterObject = {
      environmentTag: "dev",
      isCronEnvironmentSupportedForDeleteRandomKey: "no",
      isCronEnvironmentSupportedForGetAllNetwork: "no",
      isCronEnvironmentSupportedForGetGasEstimation: "no",
    };
    if (process && process.argv && process.argv.length > 0) {
      console.log(process.argv);
      let environmentTag = process.argv[2]; // dev | uat | qa | staging | prod
      let environmentType = process.argv[3]; // api | cron

      if (environmentTag) {
        starterObject.environmentTag = environmentTag;
      }
      if (environmentType) {
        if (environmentType == "cron") {
          (starterObject.isCronEnvironmentSupportedForDeleteRandomKey = "yes"),
            (starterObject.isCronEnvironmentSupportedForGetAllNetwork = "yes"),
            (starterObject.isCronEnvironmentSupportedForGetGasEstimation =
              "yes");
        }
      }
    }

    return starterObject;
  },
};
