import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { UserContext } from '../../contexts/UserContext';
import MenuContextProvider from '../../contexts/MenuContext';
import Default from '../../components/UserData/Default';
import testImgSrc from '../../styles/imgs/dich-icon.png';

describe('Default tests', () => {
  const getComponent = userData => {
    const userProps = {
      userData,
      username: userData.name,
      dispatchUsername: jest.fn(),
      dispatchUserData: jest.fn(),
      setPathName: jest.fn()
    };

    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: `/${userData.name}` }, listen: jest.fn() }}>
        <MenuContextProvider>
        <UserContext.Provider value={ userProps }>
          <Default />
        </UserContext.Provider>
        </MenuContextProvider>
      </Router>
    );

    return getByTestId('default-test');
  };

  const testUser = {
    name: 'roasted.Frank',
    name_color: '#ababab',
    description: 'ramaL llac reveN',
    description_color: '#343536',
    followers: 26
  };
  const checkOptions = (els, arr) => {
    expect(els).toHaveLength(arr.length);
    for (const i in arr)
      expect(els[i]).toHaveTextContent(arr[i]);
  };

  const tests = {
    'has main elements (all user data, own page)': () => {
      const userData = {
        ...testUser,
        ownPage: true,
        logo: testImgSrc,
        notifications: 34,
        email: 'frankly.speaking@inv.com',
        reg_date: '26.10.1996'
      };
      
      const foundProfile = getComponent(userData);
      const logo = foundProfile.querySelector('#default-logo');
      const [ name, description ] = foundProfile
        .querySelectorAll('.name-desc > p');
      const extraElements = 3;
      const defaultExtra = foundProfile
        .getElementsByClassName('default-extra');
      const [ followers, email, signed ] = defaultExtra;
      const defaultOptions = foundProfile
        .querySelectorAll('#default-options > p');
      const optionsExpected = [
        'edit profile',
        'boxes',
        'subscriptions',
        `notifications (${userData.notifications})`
      ];
      const notificationsNumber = defaultOptions[defaultOptions.length - 1]
        .querySelector('span');

      expect(foundProfile).toHaveTextContent('sign out');
      expect(foundProfile).toHaveTextContent('remove account');

      expect(logo).toHaveAttribute('src', userData.logo);

      expect(name).toHaveTextContent(userData.name);
      expect(name).toHaveStyle(`color: ${userData.name_color}`);

      expect(description).toHaveTextContent(userData.description);
      expect(description).toHaveStyle(`color: ${userData.description_color}`);

      expect(defaultExtra).toHaveLength(extraElements);
      expect(followers).toHaveTextContent(userData.followers);
      expect(email).toHaveTextContent(userData.email);
      expect(signed).toHaveTextContent(userData.reg_date);

      expect(notificationsNumber).toHaveStyle('color: orange');
      checkOptions(defaultOptions, optionsExpected);
    },
    'has no user logo, not own page (follower mode)': () => {
      const userData = { ...testUser, follower: true };
      const foundProfile = getComponent(userData);
      const logo = foundProfile.querySelector('#default-logo');
      const defaultOptions = foundProfile
        .querySelectorAll('#default-options > p');
      const optionsExpected = ['unsubscribe', 'boxes'];
      const [ unsubscribeEl ] = defaultOptions;
      const extraElements = 2;
      const defaultExtra = foundProfile
        .getElementsByClassName('default-extra');

      expect(logo).toHaveAttribute('src', 'test-file-stub');
      checkOptions(defaultOptions, optionsExpected);
      expect(unsubscribeEl).toHaveStyle('color: rgb(204, 0, 255)');
      expect(defaultExtra).toHaveLength(extraElements);

      expect(foundProfile).not.toHaveTextContent('sign out');
      expect(foundProfile).not.toHaveTextContent('remove account');
    },
    'has neither own page nor follower mode': () => {
      const foundProfile = getComponent(testUser);
      const defaultOptions = foundProfile
        .querySelectorAll('#default-options > p');
      const optionsExpected = ['subscribe', 'boxes'];
      const [ subscribeEl ] = defaultOptions;

      checkOptions(defaultOptions, optionsExpected);
      expect(subscribeEl).toHaveStyle('color: rgb(0, 255, 76)');
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
