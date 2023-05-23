const { Snap } = require("./snapshot");
export const getPayload = ({ snapshot, labl, env }) => {
    let snap = new Snap({ snapshot, mock: false, env: "development" });
    return snap.getSiteData(labl);
};
//# sourceMappingURL=index.js.map