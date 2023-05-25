const { Snap } = require("./snapshot");

const getPayload = ({ snapshot, labl, env }) => {
  let snap = new Snap({ snapshot, mock: false, env: "development" });
  return snap.getSiteData(labl);
};

exports = module.exports = { getPayload };