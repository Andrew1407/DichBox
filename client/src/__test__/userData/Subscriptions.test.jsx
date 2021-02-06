import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import UserContextProvider from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';
import Subscriptions from '../../components/UserData/Subscriptions';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import testImgSrc from '../../styles/imgs/dich-icon.png';
import logoUnsubscribeSrc from '../../styles/imgs/unsubscribe.png';

describe('Subscriptions tests', () => {
  const getComponent = usersList => {
    const menuValues = {
      usersList,
      setUsersList: jest.fn(),
      setLoading: jest.fn(),
      setFoundErr: jest.fn()
    };
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: `/seminar2077` }, listen: jest.fn() }}>
        <MenuContext.Provider value={ menuValues }>
        <UserContextProvider>
          <Subscriptions />
        </UserContextProvider>
        </MenuContext.Provider>
      </Router>
    );

    return getByTestId('subscriptions-test');
  };

  const tests = {
    'has main attributes, no users': () => {
      const usersList = [];
      const foundContainer = getComponent(usersList);
      const [ srchLabel, srchInput ] = foundContainer
        .querySelectorAll('#subs-search > label, input');
      const emptyMsgEl = foundContainer.querySelector('#subs-empty');

      expect(foundContainer).toHaveTextContent('Subscriptions');
      expect(srchLabel).toHaveTextContent('search:');
      expect(srchInput).toHaveAttribute('type', 'text');
      expect(srchInput).toHaveAttribute('spellCheck', 'false');
      expect(srchInput).toHaveDisplayValue('');
      expect(emptyMsgEl).toHaveTextContent('No subscriptions were found');
    },
    'contains users list': () => {
      const shortenName = str => str.length < 20 ?
        str :`${str.slice(0, 19)}...`;
      const usersList = [
        { name: 'Viktor.Koknos', name_color: '#899998', logo: testImgSrc },
        { name: 'Stephan.Sosokata.Giant', name_color: '#545457' }
      ];
      const foundContainer = getComponent(usersList);
      const usersContainers = foundContainer
        .getElementsByClassName('sub-person');

      expect(foundContainer).not
        .toHaveTextContent('No subscriptions were found');
      expect(usersContainers).toHaveLength(usersList.length);
      for (const i in usersList) {
        const { name, name_color } = usersList[i];
        const logo = usersList[i].logo || logoDefault;
        const userData = usersContainers[i]
          .querySelector('.subs-data');
        const [ logoEl, delIcon ] = usersContainers[i]
          .querySelectorAll('img');
        const textEl = userData.querySelector('span');
        
        expect(userData).toHaveAttribute('title', name);
        expect(logoEl).toHaveAttribute('src', logo);
        expect(textEl).toHaveTextContent(shortenName(name));
        expect(textEl).toHaveStyle(`color: ${name_color}`);
        expect(delIcon).toHaveAttribute('src', logoUnsubscribeSrc);
      }
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});

