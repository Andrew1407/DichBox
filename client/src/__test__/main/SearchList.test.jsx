import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { MenuContext } from '../../contexts/MenuContext';
import SearchList from '../../components/SearchList';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import userLogo from '../../styles/imgs/search.png';

describe('Search list tests', () => {
  const getComponent = usersList => {
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: '' }, listen: jest.fn() }}>
      <MenuContext.Provider value={{ usersList }}>
        <SearchList />
      </MenuContext.Provider>
      </Router>
    );

    return getByTestId('search-list-test');
  };

  const testUser = (el, obj) => {
    const logo = obj.logo || logoDefault;
    const nameContainer = el.querySelector('span');
    const userImg = el.querySelector('img');

    expect(nameContainer).toHaveTextContent(obj.name);
    expect(nameContainer).toHaveStyle(`color: ${obj.name_color}`);
    expect(userImg).toHaveAttribute('src', logo);
  }

  const tests = {
    'has title': () => {
      const foundList = getComponent(null);
      expect(foundList).toHaveTextContent('Found users');
    },
    'if search list is empty': () => {
      const foundList = getComponent(null);
      const personsArr = foundList.getElementsByClassName('search-list-person');
      expect(personsArr.length).toBeFalsy();
      expect(foundList).toHaveTextContent('No users were found');
    },
    'if search list isn\'t empty': () => {
      const testUser1 = { name: 'testUser1', name_color: '#ffffff' };
      const testUser2 = { name: 'testUser2', logo: userLogo, name_color: 'rgb(0, 217, 255)' };
      const usersArr = [testUser1, null, testUser2];
      const expectedLength = 2;
      const foundList = getComponent(usersArr);
      const elementsArr = foundList.getElementsByClassName('search-list-person');
      const [ userEl1, userEl2 ] = Array.from(elementsArr);

      expect(elementsArr).toHaveLength(expectedLength);
      expect(foundList).not.toHaveTextContent('No users were found');

      testUser(userEl1, testUser1);
      testUser(userEl2, testUser2);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});