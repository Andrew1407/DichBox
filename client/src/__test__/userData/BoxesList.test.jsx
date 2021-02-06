import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import MenuContextProvider from '../../contexts/MenuContext';
import BoxesList from '../../components/UserData/BoxesList';

describe('Boxes list tests', () => {
  const getComponent = (userData, boxData, searchInput) => {
    const boxProps = {
      ...boxData,
      setListOptions: jest.fn(),
      setBoxesList: jest.fn(),
    };

    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: 'dichUser/dichBox' }, listen: jest.fn() }}>
        <MenuContextProvider>
        <UserContext.Provider value={{ userData }}>
        <BoxesContext.Provider value={ boxProps }>
          <BoxesList {...{ searchInput, setMenuOption: jest.fn() }}/>
        </BoxesContext.Provider>
        </UserContext.Provider>
        </MenuContextProvider>
      </Router>
    );

    return getByTestId('boxes-list-test');
  };

  const boxesList = [
    { name: 'GolangHellSack', name_color: '#dfdfdf', access_level: 'public' },
    { name: 'MetalHereStack', name_color: '#b6b6b6', access_level: 'private' },
    { name: 'PavlogiatWet', name_color: '#101010', access_level: 'followers' },
    { name: 'KotlinForCrocodiles', name_color: '#222222', access_level: 'limited' },
    { name: 'FromCubaWithLove', name_color: '#dddddd', access_level: 'invetee' },
  ];
  const userData = { name: 'Petro', name_color: '#303030' };


  const tests = {
    'has boxes (no search)': () => {
      const searchInput = '';
      const testUser = { ...userData, ownPage: true };
      const boxData = { boxesList, listOption: 'all' };
      const listComponent = getComponent(testUser, boxData, searchInput);
      const boxesElements = listComponent
        .getElementsByClassName('boxes-items');

      expect(boxesElements).toHaveLength(boxesList.length);
      for (const i in boxesList) {
        const { name, name_color, access_level } = boxesList[i];
        const [ nameEl, accessLevelEl ] = boxesElements[i]
          .getElementsByTagName('span');

        expect(nameEl).toHaveTextContent(name);
        expect(nameEl).toHaveStyle(`color: ${name_color}`);
        expect(accessLevelEl).toHaveTextContent(access_level);
      }
    },
    'has no boxes (no search)': () => {
      const searchInput = '';
      const testUser = { ...userData, ownPage: true };
      const boxData = { boxesList: [], listOption: 'all' };
      const listComponent = getComponent(testUser, boxData, searchInput);
      
      expect(listComponent).toHaveTextContent('No boxes there');
    },
    'no boxes found with search': () => {
      const searchInput = 'FromCubaWithLove';
      const testUser = { ...userData, ownPage: true };
      const boxData = { boxesList, listOption: 'private' };
      const listComponent = getComponent(testUser, boxData, searchInput);
      
      expect(listComponent).toHaveTextContent('No boxes there');
    },
    'no boxes found (follow message)': () => {
      const searchInput = '';
      const testUser = { ...userData, ownPage: false };
      const boxData = { boxesList: [], listOption: 'followers' };
      const listComponent = getComponent(testUser, boxData, searchInput);
      const followMsg = `Follow ${userData.name} to see the boxes for followers`;
      const nameContainer = listComponent.querySelector('b');
      
      expect(listComponent).toHaveTextContent(followMsg);
      expect(nameContainer).toHaveStyle(`color: ${userData.name_color}`);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
