type userData = {
  id: number,
  name: string,
  email: string,
  passwd: string,
  followers: number,
  reg_date: Date,
  description: string,
  subscriptions: number[],
  name_color: string,
  description_color: string
};

type userInput = {
  name?: string,
  email?: string,
  passwd?: string,
  description?: string
};

type boxData = {
  id: number,
  name: string,
  reg_date: Date,
  description: string,
  owner_id: number,
  access_level: 'read'|'write'
};

type boxInput = {
  name: string,
  owner_id: number,
  access_level: 'read'|'write',
  description?: string
};

type entryData = {
  id: number,
  box_id: number,
  name: string,
  type: 'text'|'dir'|'media',
  description: string,
  file_entries: string
};

type entryInput = {
  box_id: number,
  name: string,
  type: 'text'|'dir'|'media',
  description?: string,
  file_entries?: string
};

type dataElement = string|number|Date|number[];

export {
  userData,
  userInput,
  boxData,
  boxInput,
  dataElement,
  entryData,
  entryInput
};
