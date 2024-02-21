var jwt = require("jsonwebtoken");

module.exports = function () {
  return async function (req: any, res: any, next: any) {
    if (!req.headers.authorization) {
      return res.http401("Authorization header missing");
    } else {
      try {
        const token = req.headers.authorization.split(" ")[1];
        if ((await authHelper.isTokenValid(token)) == false) {
          return res.http401("Invalid token");
        }
        next();
      } catch (error) {
        (global as any).log.error(error);
        return res.http401("Invalid token");
      }
    }
  };
};
