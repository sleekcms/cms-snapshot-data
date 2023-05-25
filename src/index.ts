import { Payload } from "./types";

const { Snap } = require("./snapshot");

type GetPayloadAttr = {
  snapshot: any;
  labl: string;
  env?: string;
};

export const getPayload = ({ snapshot, labl, env }: GetPayloadAttr) => {
  let snap = new Snap({ snapshot, mock: true, env: "development" });
  const payload : Payload = snap.getSiteData(labl);
  return payload
};
