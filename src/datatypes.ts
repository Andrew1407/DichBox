type userData = {
  id?: number,
  name?: string,
  email?: string,
  passwd?: string,
  followers?: number,
  reg_date?: Date|string,
  description?: string,
  name_color?: string,
  description_color?: string
};

type boxData = {
  id?: number,
  name?: string,
  name_color?: string,
  reg_date?: Date|string,
  description?: string,
  description_color?: string,
  owner_id?: number,
  access_level?: 'public'|'private'|'limited'|'invetee'
};

type subscribersData = {
  person_id?: number,
  subscription?: number
};

type dataElement = string|number|Date|number[];
type privacyList = {
  name: string,
  access_level: string
}[];


export {
  userData,
  boxData,
  dataElement,
  subscribersData,
  privacyList
};
