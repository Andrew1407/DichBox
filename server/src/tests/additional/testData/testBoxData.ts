import { BoxData } from "../../../datatypes";

export const testBoxes: BoxData[] = [
  {
    name: 'box',
    description: 'box description',
    name_color: '#ffffff',
    description_color: '#ffffff',
    access_level: 'public'
  },
  {
    name_color: '#ffffff'
  },
  {
    name: ''
  },
  {
    description: 'descriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescription',
  },
  {
    name_color: 'invalid',
    description_color: '#ffffff'
  },
  {
    description_color: 'invalid',
    name_color: '#ffffff'
  },
  {
    name: 'nonamenonamenonamenonamenonamenonamenonamenonamenoname'
  }
];
