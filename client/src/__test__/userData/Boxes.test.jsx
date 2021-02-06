import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import MenuContextProvider from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import BoxesContextProvider from '../../contexts/BoxesContext';
import Boxes from '../../components/UserData/Boxes';

describe('Boxes tests', () => {
  const getComponent = ownPage => {
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: 'dichUser/dichBox' }, listen: jest.fn() }}>
        <MenuContextProvider>
        <UserContext.Provider value={{ userData: { ownPage }, username: 'sasik' }}>
        <BoxesContextProvider>
          <Boxes />
        </BoxesContextProvider>
        </UserContext.Provider>
        </MenuContextProvider>
      </Router>
    );

    return getByTestId('boxes-test');
  };
  const options = [
    'all', 'public', 'private',
    'followers', 'limited', 'invetee'
  ];
  const checkOptions = (elsArr, optionsArr) => {
    for (const i in optionsArr) {
      const el = elsArr[i];
      expect(el).toHaveTextContent(optionsArr[i]);
      expect(el).toHaveValue(optionsArr[i]);
    }
  };

  const tests = {
    'has default attributes': () => {
      const ownPage = false;
      const boxesComponent = getComponent(ownPage);

      expect(boxesComponent).toHaveTextContent('Boxes')
      expect(boxesComponent).toHaveTextContent('search:')
    },
    'has own page components': () => {
      const ownPage = true;
      const boxesComponent = getComponent(ownPage);
      const optionsQuantity = 6;
      const optionsEls = boxesComponent.getElementsByTagName('option');
      const addBtn = boxesComponent.querySelector('#boxes-header-btn');

      expect(optionsEls).toHaveLength(optionsQuantity);
      expect(addBtn).toHaveDisplayValue('[ + new box ]');
      checkOptions(optionsEls, options);
    },
    'has not own page components': () => {
      const ownPage = false;
      const boxesComponent = getComponent(ownPage);
      const optionsQuantity = 4;
      const optionsEls = boxesComponent.getElementsByTagName('option');
      const addBtn = boxesComponent.querySelector('#boxes-header-btn');
      const optionsExpected = [
        options[0], options[1], options[3], options[4]
      ];

      expect(optionsEls).toHaveLength(optionsQuantity);
      expect(addBtn).toBeNull();
      checkOptions(optionsEls, optionsExpected);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
