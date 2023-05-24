import {  INode, Field,  IRecord, Image, Schema, Schemas, Site, Snapshot, Child, RecordValues } from "./types";

const _ = require("lodash");
const { getMockValue } = require("./mockshot");
const { getImg } = require("./helpers");
const { marked } = require('marked');

marked.setOptions({
  headerIds: false,
  mangle : false,
});

function toTree(data:INode[]) {
  // data = [{id,children:[{id}]}]
  // response = [{id, children:[{id, children}]}]
  // find roots
  let leafs:number[][]= [];
  let roots:any[] = [];
  data.forEach((item:INode) => {
    item.children = item.children || [];
    if (item.children.length > 0) {
      leafs.push(item.children.map((c) => c.id));
    }
    roots.push(item.id);
  });
  leafs = _.uniq(_.flattenDeep(leafs));
  roots = _.without(roots, ...leafs);
  if (roots.length === 0) roots = leafs;

  let rootTree:INode[] = [];

  function addToTree(id:number, tree:INode[], level:number) {
    let nodeIndex: number = _.findIndex(data, (n:INode) => n.id === id);
    if (nodeIndex === -1) return;
    let node:INode = data.splice(nodeIndex, 1)[0];
    node.level = level;
    node.children = node.children || [];
    let children:Child[] = [];
    for (let i in node.children) {
      addToTree(node.children[i].id, children as INode[], level + 1);
    }
    node.children = children;
    tree.push(node);
  }

  for (let i in roots) {
    addToTree(roots[i], rootTree, 0);
  }
  return rootTree;
}

const toSchemaTree = (schemas:Schemas) => {
  // verify(schemas, "{*:{id,handle,name,is_list,fields:[{type,attr:{}}]}}");
  let flatTree:INode[] = Object.values(schemas).map((m:Schema) => {
    return {
      id: m.id,
      handle: m.handle,
      name: m.name,
      is_list: m.is_list,
      children:
        !m.is_list ?
        m.fields.reduce((acc:any[], field:Field) => {
          if (field.type === "schema" && _.get(field.attr, "id")) acc.push({ id: field.attr.id, handle: field.handle });
          return acc;
        }, []) : null,
    };
  });
  return toTree(flatTree);
};

const safeJsonParse = (str:null | string) => {
  try {
    if(typeof str === "string") {
      return JSON.parse(str);
    } else {
      throw new Error('Input type is not a string');
    }
  } catch (e:any) {
    return {error: e.message};
  }
}

const getMultiple = (values:RecordValues) => {
  if (values === undefined || values === null) return [];
  if (Array.isArray(values)) return values;
  return [values];
}

const getOne = (values:RecordValues) => {
  if (values === undefined || values === null) return null;
  if (Array.isArray(values)) {
    if (values.length > 0) return values[0];
    return null;
  }
  return values;
}


class Snap {
  public mock: boolean = false 
  public snapshot: Snapshot
  public schemasById: Record<string, Schema>;
  public recsById: Record<string, IRecord>
  public lablRecsById: Record<string, {}>
  public imagesById: Record<string, Image>
  public site: Site
  public env: string

  static reduceById<T extends { id: number }>(agg:Record<string, T> , entity : T) {
    agg[entity.id] = entity;
    return agg;
  }

  static isEmpty(value:RecordValues) {
    if (Array.isArray(value)) return value.length === 0 ? true : false;
    return !value;
  }

  constructor({snapshot, mock=false, env} : {snapshot : Snapshot, mock : boolean, env : string}) {
    this.mock = mock;
    this.env = env;
    this.snapshot = snapshot; // {schemas, recs, lablRecs, images, site}
    this.schemasById = snapshot.schemas.reduce(Snap.reduceById<Schema>, {});
    this.recsById = snapshot.recs.reduce(Snap.reduceById<IRecord>, {});
    this.lablRecsById = snapshot.lablRecs.reduce(Snap.reduceById, {});
    this.imagesById = snapshot.images.reduce(Snap.reduceById<Image>, {});
    this.site = snapshot.site;
  }

  getImageData(id:number , field:Field) {
    return getImg({env: this.env, img: this.imagesById[id], site_id: this.site.id, attr: field.attr})
  }

  formatValue(field:Field, values:RecordValues) {
    if (this.mock) {
      if (field.multiple) return _.fill(Array(_.random(5)),null).map((t:any) => getMockValue({field, env: this.env}));
      else return getMockValue({field, env: this.env});
    }
    let type = field.type;
    if (type === "singleline") {
      if (field.multiple) return getMultiple(values);
      else return getOne(values);
    }
    if (type === "markdown") {
      if (field.multiple) return getMultiple(values).map(v => marked.parse(v));
      else {
        return marked.parse(getOne(values) || '');
      } 
    }
    if (type === "json") {
      if (field.multiple) {
        return getMultiple(values).map(v => safeJsonParse(v ? `${v}` : null));
      } 
      else {
        const record_value = getOne(values)
        return safeJsonParse((record_value as string | null));
      } 
    }
    if (type === 'number') {
      if (field.multiple) return getMultiple(values).map(v => Number(v));
      else return Number(getOne(values));
    }
    if (type === 'image') {
      if (field.multiple) return getMultiple(values).map(v => {
        const x =  this.getImageData(v as number, field)
        return x
      });
      else return this.getImageData(getOne(values) as number, field);
    }
    if (type === 'boolean') {
      if (field.multiple) return getMultiple(values);
      else return getOne(values);
    }
    return values;
  }

  getData(rec:IRecord) {
    const schema: Schema = this.schemasById[rec.schema_id];
    const values: Record<string, RecordValues> = rec.values;
    const result:any = {};


    if (!rec.linked_data_id) result._id = rec.id;
    for (let i in schema.fields) {
      let field = schema.fields[i];
      if (rec.linked_data_id) {
        if (!field.has_dim) continue;
        if (Snap.isEmpty(values[field.id])) continue;
      }
      const record_value : RecordValues = values[field.id] || []
      result[field.handle] = this.formatValue(field, record_value);
    }
    return result;
  }

  getSiteData(labl:string) {
    let deepResp = {};
    let dataBySchemaId :any= {};
    let schemaTree = toSchemaTree(this.schemasById)
    const schemasById = this.schemasById
    
    const lablMap = this.snapshot.lablRecs.reduce((agg:any, curr:any) => {
      if (curr.linked_data_id && curr.labl === labl) agg[curr.linked_data_id] = curr;
      return agg;
    }, {});


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

    function buildTree<T extends INode>(node:T, obj:any, handle : string | null =null) {
      let handleName = handle || (node && node.handle);
      if (!handleName) return;
      obj[handleName] = dataBySchemaId[node.id] || (node.is_list ? [] : {});
      if (node.children) {
        for (let child of node.children) {
          let field = schemasById[node.id].fields.find((f:Field) => f.attr.id == child.id);
          if (field) {
            buildTree<any>(child, obj[handleName] || {}, field.handle );
          }
          
        }
      }
    }
  
    schemaTree.forEach((node:INode) =>  buildTree<any>(node, deepResp));
    
    return deepResp;
  }
}


module.exports = { Snap };
