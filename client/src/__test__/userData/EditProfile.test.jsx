import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { UserContext } from '../../contexts/UserContext';
import MenuContextProvider from '../../contexts/MenuContext';
import VerifiersContextProvider from '../../contexts/VerifiersContext';
import EditProfile from '../../components/UserData/EditProfile';
import testImgSrc from '../../styles/imgs/dich-icon.png';

describe('Edit profile tests', () => {
  const getComponent = userData => {
    const userProps = {
      userData,
      username: userData.name,
      dispatchUsername: jest.fn(),
      dispatchUserData: jest.fn()
    };

    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: `/${userData.name}` }, listen: jest.fn() }}>
        <MenuContextProvider>
        <UserContext.Provider value={ userProps }>
        <VerifiersContextProvider>
          <EditProfile />
        </VerifiersContextProvider>
        </UserContext.Provider>
        </MenuContextProvider>
      </Router>
    );

    return getByTestId('edit-profile-test');
  };

  const testUser = {
    name: 'Archie.Morgotten',
    name_color: '#ababab',
    description: 'dead blue button',
    description_color: '#343536'
  };

  const tests = {
    'has user logo': () => {
      const userData = { ...testUser, logo: testImgSrc };
      const editProfile = getComponent(userData);
      const logo = editProfile.querySelector('#edit-logo');
      const defaultBtns = 2;
      const logoBtns = editProfile
        .querySelectorAll('.menu-form > .menu-form > input');
      const [ changeBtn, setDefaultBtn ] = logoBtns;
      
      expect(logo).toHaveAttribute('src', userData.logo);
      expect(logoBtns).toHaveLength(defaultBtns);
      expect(changeBtn).toHaveAttribute('type', 'button');
      expect(changeBtn).toHaveDisplayValue('change logo');
      expect(setDefaultBtn).toHaveAttribute('type', 'button');
      expect(setDefaultBtn).toHaveDisplayValue('set default');
    },
    'has no user logo': () => {
      const editProfile = getComponent(testUser);
      const logo = editProfile.querySelector('#edit-logo');
      const defaultBtns = 1;
      const logoBtns = editProfile
        .querySelectorAll('.menu-form > .menu-form > input');
      
      expect(logo).toHaveAttribute('src', 'test-file-stub');
      expect(logoBtns).toHaveLength(defaultBtns);
    },
    'has valid components': () => {
      const editProfile = getComponent(testUser);
      const editFiledsQuantity = 5;
      const editFields = editProfile
        .getElementsByClassName('edit-field');
      const entriesLengthExpected = [2, 2, 2, 1, 1];
      const passwdButton = editFields[editFields.length - 1]
        .querySelector('input');
      const submitBtn = editProfile
        .querySelector('#edit-submit');
      const submitStyle = {
        color: 'rgb(0, 217, 255)',
        borderColor: 'rgb(0, 217, 255)'
      };

      expect(editFields).toHaveLength(editFiledsQuantity);
      for (const i in entriesLengthExpected) {
        const elEntries = editFields[i].querySelectorAll('.edit-field > *');
        expect(elEntries).toHaveLength(entriesLengthExpected[i]);
      }
      expect(passwdButton).toHaveAttribute('type', 'button');
      expect(passwdButton).toHaveDisplayValue('change password');
      expect(submitBtn).toHaveAttribute('type', 'submit');
      expect(submitBtn).toHaveDisplayValue('edit profile');
      expect(submitBtn).toHaveStyle(submitStyle);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
