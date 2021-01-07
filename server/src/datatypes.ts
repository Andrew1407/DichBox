export type dataElement = string|number|Date|number[]|boolean;
export type entryType = 'file'|'dir'|'image';
export type access_level = 'public'|'private'|'limited'|'invetee';

export interface UserData {
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

export interface BoxData {
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

export interface SubscribersData {
  person_id?: number,
  subscription?: number
};

export interface NotificationsData {
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

export interface FileEntries {
  name: string,
  src: string
};

export interface DirEntries {
  type: entryType,
  name: string
};

export interface PathEntries {
  type: entryType,
  dir?: {
   src: DirEntries[],
   name: string
  },  
  file?: FileEntries
}
