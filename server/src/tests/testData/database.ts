import { UserData, BoxData } from '../../datatypes';

export const testBox: BoxData[] = [
  {
    name: 'new_box',
    description: 'description',
    name_color: '#ffffff',
    description_color: '#ffffff',
    access_level: 'public'
  },
  {
    name: 'nonexistent_box',
    description: 'description',
    name_color: '#ffffff',
    description_color: '#ffffff',
    access_level: 'public'
  },
  {
    name: 'test_box_1',
    description: 'description_box1',
    name_color: '#ffffff',
    description_color: '#ffffff',
    access_level: 'limited'
  },
  {
    name: 'test_box_2',
    description: 'description_box2',
    name_color: '#ffffff',
    description_color: '#ffffff',
    access_level: 'private'
  },
  {
    name: 'test_box_3',
    description: 'description_box3',
    name_color: '#ffffff',
    description_color: '#ffffff',
    access_level: 'public'
  },
  {
    name: 'test_box_4',
    description: 'description_box4',
    name_color: '#ffffff',
    description_color: '#ffffff',
    access_level: 'followers'
  }
];

export const testUser: UserData[] = [
  {
    name: 'new_user',
    email: 'new_user@gmail.com',
    passwd: 'password_hash'
  },
  {
    name: 'nonexistent_user',
    email: 'new_user@gmail.com',
    passwd: 'password_hash'
  },
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
  },
  {
    name: 'test_user_3',
    name_color: "#009fff",
    email: 'third_user@gmail.com',
    passwd: 'third_password_hash'
  },
  {
    name: 'test_user_4',
    name_color: "#009fff",
    email: 'fourth_user@gmail.com',
    passwd: 'fourth_password_hash'
  },
  {
    name: 'test_user_5',
    name_color: "#ffffff",
    description: 'first_description',
    email: 'first_user@gmail.com',
    passwd: 'first_password'
  },
  {
    name: 'test_user_6',
    name_color: "#00f0ff",
    description: 'second_description',
    email: 'second_user@gmail.com',
    passwd: 'second_password'
  },
  {
    name: 'test_user_7',
    name_color: "#009fff",
    email: 'third_user@gmail.com',
    passwd: 'third_password'
  },
  {
    name: 'test_user_8',
    name_color: "#009fff",
    email: 'fourth_user@gmail.com',
    passwd: 'fourth_password'
  }
];
