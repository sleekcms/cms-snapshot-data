export type Child = { id: number; handle: string };

export type RecordValues = string[] | boolean[] | number[]  
export type INode = {
  id: number;
  handle: string;
  name: string;
  is_list: boolean;
  children:  Child[] | null;
  level?: number;
};

export type Image = {
  key_name: string;
  token: string;
  tag: string | null;
  id: number;
  site_id: number;
  file_name: string;
  path: string | null;
  file_size: number;
  file_type: string;
  source: string;
  attr_name: string | null;
  attr_url: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  blur_hash: string | null;
  created_by_id: number;
  updated_by_id: number;
  created_at: string;
  updated_at: string;
};

export type Site = {
  id: number;
  name: string;
  archived: boolean;
  salt: string;
  is_private: boolean;
  dim_id: number;
  dim_type: null;
  key_case: 'snake';
  label: null;
  domain: string;
  plan_id: number;
  webhook: null;
  created_by_id: number;
  updated_by_id: number;
  created_at: string;
  updated_at: string;
};

export type Field = {
  id: number;
  handle: string;
  schema_id: number;
  type: string;
  label: string;
  help: null;
  attr: {
    id?: number;
    w?: null | number;
    h?: null | number;
    fit?: 'cover';
    default?: boolean;
    labels?: string[];
    options?: string[][];
    catalog_id?: null;
  };
  required: boolean;
  has_dim: boolean;
  multiple: boolean;
};
export type IRecord = {
  id: number;
  site_id: number;
  schema_id: number;
  labl: null;
  linked_data_id: null;
  order: number;
  values: Record<string, number[]>;
  created_by_id: number;
  updated_by_id: number;
  created_at: string;
  updated_at: string;
};

export type Schema = {
  id: number;
  name: string;
  parent_id: null;
  handle: string;
  is_list: boolean;
  has_dim: boolean;
  filed_ids: number[];
  fields: Field[];
};

export type Snapshot = {
  schemas: Schema[];
  recs: IRecord[];
  lablRecs: [];
  images: Image[];
  site: Site;
};

export type Schemas = Record<string, Schema>;
