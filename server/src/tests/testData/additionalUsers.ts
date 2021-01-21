import { UserData } from '../../datatypes';

export const testUsersCreate: UserData[] = [
  {
    name: 'user',
    email: 'user@gmail.com',
    passwd: 'hash_passwd'
  },
  {
    name: 'user',
    passwd: 'hash_passwd'
  },
  {
    name: 'user2',
    email: 'user@gmail.com'
  },
  {
    email: 'user@gmail.com',
    passwd: 'hash_passwd'
  },
  {
    name: 'user'
  },
  {
    email: 'user@gmail.com'
  },
  {
    passwd: 'hash_passwd'
  },
  {
    name: 'user user',
    email: 'user@gmail.com',
    passwd: 'hash_passwd'
  },
  {
    name: '',
    email: 'user@gmail.com',
    passwd: 'hash_passwd'
  },
  {
    name: 'useruseruseruseruseruseruseruseruseruseruser',
    email: 'user@gmail.com',
    passwd: 'hash_passwd'
  },
  {
    name: 'user/',
    email: 'user@gmail.com',
    passwd: 'hash_passwd'
  },
  {
    name: 'user',
    email: 'user@gmail.com',
    passwd: 'h'
  },
  {
    name: 'useruseruseruseruseruseruseruseruseruseruser',
    email: 'user@gmail.com',
    passwd: 'hash_passwd'
  },
  {
    name: 'user user',
    email: '',
    passwd: 'hash_passwd'
  }
];

export const testUsersEdit: UserData[] = [
  {
    name: 'user',
    email: 'user@gmail.com',
    passwd: 'passwd_hash',
    followers: 0,
    description: 'User1 description',
    name_color: '#dd09f5',
    description_color: '#dd09f5'
  },
  {
    email: 'user@gmail.com',
    name_color: ''
  },
  {
    email: 'user@gmail.com',
    description_color: 'incorrect'
  },
  {
    name: 'user',
    description: 'descriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescription'
  },
  ...testUsersCreate
];
