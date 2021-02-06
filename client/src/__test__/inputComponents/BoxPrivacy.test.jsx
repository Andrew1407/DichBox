import React from 'react';
import { Router } from 'react-router-dom';
import { cleanup, render } from '@testing-library/react';
import UserContextProvider from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';
import BoxPrivacy from '../../components/inputFields/BoxPrivacy';

describe('Box privacy tests', () => {
  const getPrivacyComponent = privacy => {
    const props = {
      privacy,
      setPrivacy: jest.fn(),
      limitedList: [],
      setLimitedList: jest.fn(),
      setChangedList: jest.fn(),
      changedList: null
    };
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: '' }, listen: jest.fn() }}>
        <MenuContext.Provider value={{
          setFoundErr: jest.fn(),
          setLoading: jest.fn(),
          setUsersList: jest.fn()
        }}>
        <UserContextProvider>
          <BoxPrivacy { ...props } />
        </UserContextProvider>
        </MenuContext.Provider>
      </Router>
    );
    return getByTestId('box-privacy-test');
  };
  const radios = [
    ['public', '(everyone can view this box)'],
    ['private', '(you and editors can view this box)'],
    ['followers', '(subscribers can view this box)'],
    ['limited', '(add/remove users who can view this box)']
  ];

  const tests = {
    'has users list for limited privacy': () => {
      const checkUsersList = privacy => {
        const privacyComponent = getPrivacyComponent(privacy);
        const listContainer = privacyComponent
          .querySelector('#search-users-container');
        if (privacy === 'limited')
          expect(listContainer).not.toBeNull();
        else
          expect(listContainer).toBeNull();
        cleanup();
      };
      
      radios.map(x => x[0]).forEach(checkUsersList);
    },
    'has correct radio checked': () => {
      const checkRadios = privacy => {
        const privacyComponent = getPrivacyComponent(privacy);
        const radioContainers = privacyComponent
          .getElementsByClassName('box-privacy-radio');
        const radioElements = Array.from(radioContainers)
          .map(x => x.querySelector('label > input'));
        radioElements.forEach(el => {
          const checked = el.name.startsWith(privacy);
          if (checked)
            expect(el).toBeChecked();
          else
            expect(el).not.toBeChecked();
        });
        cleanup();
      };

      radios.map(x => x[0]).forEach(checkRadios);
    },
    'has correct elements properties': () => {
      const publicComponent = getPrivacyComponent('public');
      const privacyContainers = Array.from(
        publicComponent.getElementsByClassName('box-privacy-radio')
      ).map(x => x.querySelector('label'));

      expect(publicComponent).toHaveTextContent('*box privacy');
      privacyContainers.forEach((el, i) => {
        const labelEntry = radios[i].join(' ');
        expect(el).toHaveTextContent(labelEntry);
        const elInput = el.querySelector('input');
        expect(elInput).toHaveAttribute('value', radios[i][0]);
        expect(elInput).toHaveAttribute('name', radios[i][0] + 'Radio');
      });
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
