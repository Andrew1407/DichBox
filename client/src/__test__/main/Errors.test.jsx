import React from 'react';
import { cleanup, render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Errors from '../../components/Errors/Errors';
import { MenuContext } from '../../contexts/MenuContext';
import boxErrLogo from '../styles/imgs/errors/box.png';
import dirErrLogo from '../styles/imgs/errors/dir.png';
import serverErrLogo from '../styles/imgs/errors/server.png';
import signInErrLogo from '../styles/imgs/errors/signIn.png';
import userErrLogo from '../styles/imgs/errors/user.png';
import signUpErrLogo from '../styles/imgs/errors/signUp.png';

describe('Errors tests', () => {
  const testData = [
    ['dir', 'dir error', dirErrLogo],
    ['box', 'box error', boxErrLogo],
    ['user', 'user error', userErrLogo],
    ['signIn', 'singIn error', signInErrLogo],
    ['signUp', 'singUp error', signUpErrLogo],
    ['server', 'server error', serverErrLogo]
  ];

  const tests = {
    'has title': () => {
      const foundErr = testData[0].slice(0, -1);
      const foundErrors = render(
        <MenuContext.Provider value={{ foundErr }}>
          <Errors />
        </MenuContext.Provider>
      ).getByTestId('errors-test');
      expect(foundErrors).toHaveTextContent('Error');
    },
    'has error content': () => {
      for (const testArgs of testData) {
        const foundErr = testArgs.slice(0, -1);
        const foundErrors = render(
          <MenuContext.Provider value={{ foundErr }}>
            <Errors />
          </MenuContext.Provider>
        ).getByTestId('errors-test');
        
        const [ _, errMsg, errImg ] = testArgs;
        const imgContainer = foundErrors.querySelector('#error-image');
        const imgEl = imgContainer.querySelector('img');

        expect(foundErrors).toHaveTextContent(errMsg);
        expect(imgContainer).toContainElement(imgEl);
        expect(imgEl).toHaveAttribute('src', errImg);
        cleanup();
      }
    },
    'matches snapshot': () => {
      const foundErr = testData[testData.length - 1].slice(0, -1);
      const tree = renderer.create(
        <MenuContext.Provider value={{ foundErr }}>
          <Errors />
        </MenuContext.Provider>
      ).toJSON();
      expect(tree).toMatchSnapshot();
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
