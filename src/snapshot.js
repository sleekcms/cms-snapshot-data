const _ = require("lodash");
const { getMockValue } = require("./mockshot");
const { getImg } = require("./helpers");
const { marked } = require('marked');

function toTree(data) {
  // data = [{id,children:[{id}]}]
  // response = [{id, children:[{id, children}]}]
  // find roots
  let leafs = [];
  let roots = [];
  data.forEach(item => {
    item.children = item.children || [];
    if (item.children.length > 0) {
      leafs.push(item.children.map(c => c.id));
    }
    roots.push(item.id);
  });
  leafs = _.uniq(_.flattenDeep(leafs));
  roots = _.without(roots, ...leafs);
  if (roots.length === 0) roots = leafs;

  let rootTree = [];

  function addToTree(id, tree, level) {
    let nodeIndex = _.findIndex(data, n => n.id === id);
    if (nodeIndex === -1) return;
    let node = data.splice(nodeIndex, 1)[0];
    node.level = level;
    node.children = node.children || [];
    let children = [];
    for (let i in node.children) {
      addToTree(node.children[i].id, children, level + 1);
    }
    node.children = children;
    tree.push(node);
  }

  for (let i in roots) {
    addToTree(roots[i], rootTree, 0);
  }
  return rootTree;
}

const toSchemaTree = schemas => {
  // verify(schemas, "{*:{id,handle,name,is_list,fields:[{type,attr:{}}]}}");
  let flatTree = Object.values(schemas).map(m => {
    return {
      id: m.id,
      handle: m.handle,
      name: m.name,
      is_list: m.is_list,
      children:
        !m.is_list &&
        m.fields.reduce((acc, f) => {
          if (f.type === "schema" && _.get(f.attr, "id")) acc.push({ id: f.attr.id, handle: f.handle });
          return acc;
        }, []),
    };
  });
  return toTree(flatTree);
};

const safeJsonParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {error: e.message};
  }
}

const getMultiple = (values) => {
  if (values === undefined || values === null) return [];
  if (Array.isArray(values)) return values;
  return [values];
}

const getOne = (values) => {
  if (values === undefined || values === null) return null;
  if (Array.isArray(values)) {
    if (values.length > 0) return values[0];
    return null;
  }
  return values;
}
class Snap {

  mock=false
  snapshot
  schemasById
  recsById
  lablRecsById
  imagesById
  site

  static reduceById(agg, curr, index) {
    agg[curr.id] = curr;
    return agg;
  }

  static isEmpty(field, value) {
    if (Array.isArray(value)) return value.length === 0 ? true : false;
    return !value;
  }

  constructor({snapshot, mock=false, env}) {
    this.mock = mock;
    this.env = env;
    this.snapshot = snapshot; // {schemas, recs, lablRecs, images, site}
    this.schemasById = snapshot.schemas.reduce(Snap.reduceById, {});
    this.recsById = snapshot.recs.reduce(Snap.reduceById, {});
    this.lablRecsById = snapshot.lablRecs.reduce(Snap.reduceById, {});
    this.imagesById = snapshot.images.reduce(Snap.reduceById, {});
    this.site = snapshot.site;
  }

  getImageData(id, field) {
    return getImg({env: this.env, img: this.imagesById[id], site_id: this.site.id, attr: field.attr})
  }

  formatValue(field, value) {
    if (this.mock) {
      if (field.multiple) return _.fill(Array(_.random(5)),null).map(t => getMockValue({field, env: this.env}));
      else return getMockValue({field, env: this.env});
    }
    let type = field.type;
    if (type === "singleline") {
      if (field.multiple) return getMultiple(value);
      else return getOne(value);
    }
    if (type === "markdown") {
      if (field.multiple) return getMultiple(value).map(v => marked.parse(v));
      else return marked.parse(getOne(value) || '');
    }
    if (type === "json") {
      if (field.multiple) return getMultiple(value).map(v => safeJsonParse(v));
      else return safeJsonParse(getOne(value));
    }
    if (type === 'number') {
      if (field.multiple) return getMultiple(value).map(v => Number(v));
      else return Number(getOne(value));
    }
    if (type === 'image') {
      if (field.multiple) return getMultiple(value).map(v => this.getImageData(v, field));
      else return this.getImageData(getOne(value), field);
    }
    if (type === 'boolean') {
      if (field.multiple) return getMultiple(value);
      else return getOne(value);
    }
    return value;
  }

  getData(rec) {
    let schema = this.schemasById[rec.schema_id];
    let values = rec.values;
    let result = {};
    if (!rec.linked_data_id) result._id = rec.id;
    for (let i in schema.fields) {
      let field = schema.fields[i];
      if (rec.linked_data_id) {
        if (!field.has_dim) continue;
        if (Snap.isEmpty(field, values[field.id])) continue;
      }
      result[field.handle] = this.formatValue(field, values[field.id]);
    }
    return result;
  }

  getSiteData(labl) {

    let lablMap = this.snapshot.lablRecs.reduce((agg, curr) => {
      if (curr.linked_data_id && curr.labl === labl) agg[curr.linked_data_id] = curr;
      return agg;
    }, {});

    let dataBySchemaId = {};

    for (let i in this.snapshot.recs) {
      let r = this.snapshot.recs[i];
      let data = this.getData(r)
      let isList = this.schemasById[r.schema_id].is_list;
      if (lablMap[r.id]) {
        let lablData = this.getData(lablMap[r.id]);
        data = Object.assign(data, lablData);
      }
      
      if (isList) {
        if (!dataBySchemaId[r.schema_id]) dataBySchemaId[r.schema_id] = [];
        dataBySchemaId[r.schema_id].push(data);
      } else {
        if (!dataBySchemaId[r.schema_id]) dataBySchemaId[r.schema_id] = data;
      }      
    }

    let schemaTree = toSchemaTree(this.schemasById)

    let deepResp = {};

    let self = this;

    function buildTree(node, obj, handle=null) {
      let handleName = handle || (node && node.handle);
      if (!handleName) return;
      obj[handleName] = dataBySchemaId[node.id] || (node.is_list ? [] : {});
      if (node.children) {
        for (let child of node.children) {
          let field = self.schemasById[node.id].fields.find(f => f.attr.id == child.id);
          if (field) {
            buildTree(child, obj[handleName] || {}, field.handle);
          }
          
        }
      }
    }
  
    schemaTree.forEach(node => buildTree(node, deepResp));
    
    return deepResp;
  }
}


module.exports = { Snap };
