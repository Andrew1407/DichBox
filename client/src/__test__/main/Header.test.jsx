import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import Header from '../../components/Header';
import MenuContextProvider from '../../contexts/MenuContext';
import UserContextProvider from '../../contexts/UserContext';
import VerifiersContextProvider from '../../contexts/VerifiersContext';
import BoxesContextProvider from '../../contexts/BoxesContext';
import defaultLogo from '../../styles/imgs/default-user-logo.png';
import searchLogo from '../../styles/imgs/search.png';

describe('Header tests', () => {
  const { getByTestId, getByPlaceholderText } = render(
    <Router history={{ push: jest.fn(), location: { pathname: '' }, listen: jest.fn() }}>
      <MenuContextProvider>
      <UserContextProvider>
      <VerifiersContextProvider>
      <BoxesContextProvider>
        <Header />
      </BoxesContextProvider>
      </VerifiersContextProvider>
      </UserContextProvider>
      </MenuContextProvider>
    </Router>
  );
  const foundHeader = getByTestId('header-test');
  const foundSearchInput = getByPlaceholderText('search users');

  const tests = {
    'has title': () => {
      expect(foundHeader).toHaveTextContent('DichBox');
    },
    'has user button': () => {
      const butnImg = foundHeader.querySelector('#header-menu .highlight');
      expect(butnImg).toHaveAttribute('src', defaultLogo);
    },
    'has search area': () => {
      expect(foundSearchInput).toBeDefined();
      const [ serachImg ] = foundHeader.getElementsByTagName('img');
      expect(serachImg).toHaveAttribute('src', searchLogo);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
