import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import FileManipulator from '../../components/BoxData/FileManipulator';
import MenuContextProvider from '../../contexts/MenuContext';
import UserContextProvider from '../../contexts/UserContext';
import BoxesContextProvider from '../../contexts/BoxesContext';

describe('File manipulator tests', () => {
  const file = { type: 'file', name: 'gopher_slayer.go' };
  const pathName = ['testPath', 'testDir'];
  const getComponent = fileManipulation => {
    const props = {
      fileManipulation,
      pathName,
      setFileManipulation: jest.fn()
    };
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: '' }, listen: jest.fn() }}>
        <MenuContextProvider>
        <UserContextProvider>
        <BoxesContextProvider>
          <FileManipulator { ...props } />
        </BoxesContextProvider>
        </UserContextProvider>
        </MenuContextProvider>
      </Router>
    );

    return getByTestId('file-manipulator-test');
  };
  const formatContent = (file, path) =>
    `${file.type} "${file.name} (${path.join('/')}/${file.name})"`;

  const tests = {
    'handles rename action': () => {
      const manipulator = getComponent({ ...file, action: 'rename' });
      const optionTitle = `Rename ${formatContent(file, pathName)}?`;
      const renameField = manipulator.querySelector('#fm-rename > input');
      expect(manipulator).toHaveTextContent(optionTitle);
      expect(renameField).toHaveAttribute('spellCheck', 'false');
      expect(renameField).toHaveAttribute('type', 'text');
      expect(renameField).toHaveValue('');
    },
    'handles remove action': () => {
      const manipulator = getComponent({ ...file, action: 'remove' });
      const optionTitle = `Remove ${formatContent(file, pathName)}?`;
      const renameField = manipulator.querySelector('#fm-rename > input');
      expect(manipulator).toHaveTextContent(optionTitle);
      expect(renameField).toBeNull();
    },
    'has valid buttons': () => {
      const manipulator = getComponent({ ...file, action: 'rename' });
      const buttonsQuantity = 2;
      const buttons = manipulator.querySelectorAll('#fm-btns .files-btn');
      const [ okBtn, cancelBtn ] = buttons;
      const okStyle = {
        color: 'rgb(0, 217, 255)',
        borderColor: 'rgb(0, 217, 255)'
      };

      expect(buttons).toHaveLength(buttonsQuantity);
      expect(okBtn).toHaveAttribute('type', 'button');
      expect(okBtn).toHaveValue('ok');
      expect(okBtn).toHaveStyle(okStyle);
      expect(cancelBtn).toHaveAttribute('type', 'button');
      expect(cancelBtn).toHaveValue('cancel');
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
