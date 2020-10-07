type userData = {
  id?: number,
  name?: string,
  email?: string,
  passwd?: string,
  followers?: number,
  reg_date?: Date|string,
  description?: string,
  name_color?: string,
  description_color?: string,
  notifications?: number
};

type access_level = 'public'|'private'|'limited'|'invetee';

type boxData = {
  id?: number,
  name?: string,
  name_color?: string,
  reg_date?: Date|string,
  description?: string,
  description_color?: string,
  owner_id?: number,
  access_level?: access_level,
  owner_name?: string,
  onwer_nc?: string,
  editor?: boolean,
  last_edited?: string,
  box_id?: number,
  person_id?: number
};

type subscribersData = {
  person_id?: number,
  subscription?: number
};

type notificationsData = {
  id?: number,
  person_id?: number,
  type?: string,
  param?: number|null,
  extra_values?: string[]|null,
  note_date?: Date|string,
  user_name?: string,
  user_color?: string,
  box_name?: string,
  box_color?: string,
  msgEntries?: string[],
  icon?: string|null
};

type dataElement = string|number|Date|number[];

type entryType = 'file'|'dir'|'img';

type fileEntries = {
  name: string,
  src: string
};

type dirEntries = {
  type: entryType,
  name: string
};

type pathEntries = {
  type: entryType,
  dir?: {
   src: dirEntries[],
   name: string
  },  
  file?: fileEntries
}

export {
  userData,
  boxData,
  dataElement,
  subscribersData,
  access_level,
  pathEntries,
  dirEntries,
  fileEntries,
  entryType,
  notificationsData
};
