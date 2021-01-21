import { UserData, BoxData } from '../../datatypes';

export const testBox: BoxData =
  {
    name: 'new_box',
    description: 'description',
    name_color: '#ffffff',
    description_color: '#ffffff',
    access_level: 'public'
  };

export const testUser: UserData[] = [
  {
    name: 'test_user_1',
    name_color: "#ffffff",
    description: 'first_description',
    email: 'first_user@gmail.com',
    passwd: 'first_password_hash'
  },
  {
    name: 'test_user_2',
    name_color: "#00f0ff",
    description: 'second_description',
    email: 'second_user@gmail.com',
    passwd: 'second_password_hash'
  }
];
