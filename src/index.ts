import { marked } from 'marked';

type Field = {
  type: string;
  multiple: boolean;
  attr: any;
}

const getMultiple = (values: any) => {
  if (values === undefined || values === null) return [];
  if (Array.isArray(values)) return values;
  return [values];
}

const getOne = (values: any) => {
  if (values === undefined || values === null) return null;
  if (Array.isArray(values)) {
    if (values.length > 0) return values[0];
    return null;
  }
  return values;
}

const safeJsonParse = (str: any) => {
  try {
    return JSON.parse(str);
  } catch (e: any) {
    return {error: e.message};
  }
}


class ImgLookup {
  constructor() {
    this.imagesById = {};
  }
}
type GetImgAttr = {
  env: string;
  id: string;
  field: Field;
}
const getImageData = ({id, field, env}: GetImgAttr) => {
  return getImg({env, img: this.imagesById[id], site_id: this.site.id, attr: field.attr})
}


type FormatValueAttr = {
  field: Field;
  value: any;
  env: string;
}
const formatValue = ({field, value, env} : FormatValueAttr) => {
  let type = field.type;
  if (type === "singleline") {
    if (field.multiple) return getMultiple(value);
    else return getOne(value);
  }
  if (type === "markdown") {
    if (field.multiple) return getMultiple(value).map(v => marked.parse(v));
    else return marked.parse(getOne(value));
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

type GetPayloadAttr = {
  snapshot: any;
  labl: string;
  env: string;
}

export const getPayload = ({snapshot, labl, env}: GetPayloadAttr) => {
    let data = {};
  
    return data;
  }
  
  export const getMockPayload = (snapshot: any, labl: string) => {
    let data = {};
  
    return data;
  }
  