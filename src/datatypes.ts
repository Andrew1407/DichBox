type userData = {
  id: number,
  name: string,
  email: string,
  passwd: string,
  followers: number,
  reg_date: Date,
  description: string,
  name_color: string,
  description_color: string
};

type userInput = {
  id?: number,
  name?: string,
  email?: string,
  passwd?: string,
  description?: string
  description_color?: string,
  name_color?: string
};

type boxData = {
  id: number,
  name: string,
  name_color: string,
  reg_date: Date,
  description: string,
  description_color: string,
  owner_id: number,
  access_level: 'public'|'private'|'limited'|'invetee'
};

type boxInput = {
  name?: string,
  owner_id?: number,
  name_color?: string,
  access_level?: 'public'|'private'|'limited'|'invetee'|'followers',
  description?: string,
  description_color?: string
};

type subscribersData = {
  person_id: number,
  subscription: number
};

type dataElement = string|number|Date|number[];

export {
  userData,
  userInput,
  boxData,
  boxInput,
  dataElement,
  subscribersData
};
