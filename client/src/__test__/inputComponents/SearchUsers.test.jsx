import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import UserContextProvider from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';
import SearchUsers from '../../components/inputFields/SearchUsers';
import testImgSrc from '../../styles/imgs/dich-icon.png';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import trashBinSrc from '../../styles/imgs/trash-bin.png';

describe('Search users tests', () => {
  const inputList = [
    { name: 'testUser1', logo: testImgSrc, name_color: '#ffffff' },
    { name: 'testNonHumanAfterJavaCourses', name_color: '#262626' }
  ];
  const foundList = render(
    <Router history={{ push: jest.fn(), location: { pathname: '' }, listen: jest.fn() }}>
      <MenuContext.Provider value={{
        setFoundErr: jest.fn(),
        setLoading: jest.fn(),
        setUsersList: jest.fn()
      }}>
      <UserContextProvider>
        <SearchUsers {...{
          inputList,
          setInputList: jest.fn(),
          setChangeList: jest.fn()
        }} />
      </UserContextProvider>
    </MenuContext.Provider>
    </Router>
  ).getByTestId('search-users-test');

  const checkUser = (el, obj) => {
    const logoSrc = obj.logo || logoDefault;
    const name = obj.name.length < 20 ?
      obj.name : `${obj.name.slice(0, 19)}...`;
    const { name_color } = obj;
    const nameContainer = el.querySelector('span');
    const userLogo = el.firstChild;
    expect(el).toHaveAttribute('title', obj.name);
    expect(userLogo).toHaveAttribute('src', logoSrc);
    expect(nameContainer).toHaveStyle(`color: ${name_color}`);
    expect(nameContainer).toHaveTextContent(name);
  };

  const tests = {
    'has no found users': () => {
      const foundUsers = foundList.querySelector('#found-users-list');
      expect(foundUsers).toBeNull();
    },
    'has text content': () => {
      expect(foundList).toHaveTextContent('username:');
      expect(foundList).toHaveTextContent('clear');
    },
    'has users input list': () => {
      const usersContainer = foundList.querySelector('.box-limited .box-limited-list');
      const foundUsers = usersContainer.getElementsByClassName('limited-user');
      const usersArr = Array.from(foundUsers)
        .map(x => x.querySelector('.limited-user-data'));

      expect(usersContainer).toBeDefined();
      expect(foundUsers).toHaveLength(inputList.length);
      for (const i in usersArr)
        checkUser(usersArr[i], inputList[i]);

      // check trash bin image
      const trashBin = foundUsers[0].lastChild;
      expect(trashBin).toHaveAttribute('src', trashBinSrc);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
