import React from 'react';
import { Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Menu from '../../components/Menu';
import { MenuContext } from '../../contexts/MenuContext';
import UserContextProvider from '../../contexts/UserContext';
import VerifiersContextProvider from '../../contexts/VerifiersContext';
import BoxesContextProvider from '../../contexts/BoxesContext';
import hideImg from '../../styles/imgs/hide-arrow.png';
import showImg from '../../styles/imgs/show-arrow.png';
import homeLogo from '../../styles/imgs/home-icon.png';

describe('Menu tests', () => {
  const getComponent = menuVals => {
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: '' }, listen: jest.fn() }}>
        <MenuContext.Provider value={{
          ...menuVals,
          setMenuOption: jest.fn(),
          setUsersList: jest.fn()
        }}>
        <UserContextProvider>
        <VerifiersContextProvider>
        <BoxesContextProvider>
          <Menu />
        </BoxesContextProvider>
        </VerifiersContextProvider>
        </UserContextProvider>
        </MenuContext.Provider>
      </Router>
    );

    return getByTestId('menu-test');
  }

  const tests = {
    'menu: hidden': () => {
      const foundMenu = getComponent({});
      const defaultPage = foundMenu.querySelector('menu');
      const arrowImg = foundMenu.querySelector('img');
      expect(defaultPage).toBeNull();
      expect(arrowImg).toHaveAttribute('src', showImg);
    },
    'menu: error': () => {
      const foundMenu = getComponent({
        menuVisible: true,
        foundErr: ['server', 'testErr']
      });
      const errContainer = foundMenu.querySelector('#errors-container');
      expect(errContainer).toBeDefined();
    },
    'menu: loading': () => {
      const foundMenu = getComponent({ menuVisible: true, isLoading: true });
      const loadingContainer = foundMenu.querySelector('#loading-container');
      expect(loadingContainer).toBeDefined();
    },
    'menu: search list': () => {
      const foundMenu = getComponent({ menuVisible: true, searchStr: 'test' });
      const searchList = foundMenu.querySelector('#search-list');
      expect(searchList).toBeDefined();
    },
    'menu: default': () => {
      const foundMenu = getComponent({ menuVisible: true });
      const expectedStyle = {
        maxWidth: '30%',
        minWidth: '30%',
        borderTop: '2px solid rgb(75, 73, 73)',
        borderRight: '4px solid rgb(75, 73, 73)'
      };
      const arrowImg = foundMenu.querySelector('#menu-nav-btns .arrow');
      const homeImg = foundMenu.querySelector('#menu-nav-btns #home-logo');
      expect(foundMenu).toHaveStyle(expectedStyle);
      expect(arrowImg).toHaveAttribute('src', hideImg);
      expect(homeImg).toHaveAttribute('src', homeLogo);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
