const { Snap } = require("./snapshot");

type GetPayloadAttr = {
  snapshot: any;
  labl: string;
  env?: string;
};

export const getPayload = ({ snapshot, labl, env }: GetPayloadAttr) => {
  let snap = new Snap({ snapshot, mock: false, env: "development" });
  return snap.getSiteData(labl);
};
