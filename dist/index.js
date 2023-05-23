"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayload = void 0;
const { Snap } = require("./snapshot");
const getPayload = ({ snapshot, labl, env }) => {
    let snap = new Snap({ snapshot, mock: false, env: "development" });
    return snap.getSiteData(labl);
};
exports.getPayload = getPayload;
//# sourceMappingURL=index.js.map