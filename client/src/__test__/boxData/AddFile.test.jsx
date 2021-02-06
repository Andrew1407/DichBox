import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import AddFile from '../../components/BoxData/AddFile';
import MenuContextProvider from '../../contexts/MenuContext';
import UserContextProvider from '../../contexts/UserContext';
import BoxesContextProvider from '../../contexts/BoxesContext';

describe('Add file tests', () => {
  const getComponent = fileType => {
    const props = {
      setAddFileVisible: jest.fn(),
      pathName: ['testPath'],
      addFileVisible: fileType
    };
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: '' }, listen: jest.fn() }}>
        <MenuContextProvider>
        <UserContextProvider>
        <BoxesContextProvider>
          <AddFile { ...props } />
        </BoxesContextProvider>
        </UserContextProvider>
        </MenuContextProvider>
      </Router>
    );
    const testId = fileType === 'image' ?
      'add-img-test' : 'add-file-test';
    return getByTestId(testId);
  };

  const tests = {
    'adds image': () => {
      const imgSelector = getComponent('image');
      const [ fileSelector, addBtn ] = imgSelector
        .getElementsByTagName('input');
      const btnStyle = {
        borderColor: 'rgb(0, 217, 255)',
        color: 'rgb(0, 217, 255)'
      }
      expect(imgSelector).toHaveTextContent('Select image:');
      expect(fileSelector).toHaveAttribute('accept', 'image/*');
      expect(fileSelector).toHaveAttribute('type', 'file');
      expect(addBtn).toHaveAttribute('type', 'button');
      expect(addBtn).toHaveValue('add');
      expect(addBtn).toHaveStyle(btnStyle);
    },
    'adds text file': () => {
      const fileSelector = getComponent('file');
      const [ inputField ] = fileSelector
        .getElementsByTagName('input');
      expect(fileSelector).toHaveTextContent('file name:');
      expect(inputField).toHaveAttribute('type', 'text');
    },
    'adds dir': () => {
      const fileSelector = getComponent('dir');
      const [ inputField ] = fileSelector
        .getElementsByTagName('input');
      expect(fileSelector).toHaveTextContent('dir name:');
      expect(inputField).toHaveAttribute('type', 'text');
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
