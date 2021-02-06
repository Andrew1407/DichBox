import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { UserContext } from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';
import Notifications from '../../components/UserData/Notifications';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import trashBin from '../../styles/imgs/trash-bin.png';
import testImgSrc from '../../styles/imgs/dich-icon.png';

describe('Notifications tests', () => {
  const getComponent = usersList => {
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: `/seminar2077` }, listen: jest.fn() }}>
        <MenuContext.Provider value={{ usersList, setUsersList: jest.fn(), setLoading: jest.fn(), setFoundErr: jest.fn() }}>
        <UserContext.Provider value={{ userData: { notifications: usersList.length }, dispatchUserData: jest.fn() }}>
          <Notifications />
        </UserContext.Provider>
        </MenuContext.Provider>
      </Router>
    );

    return getByTestId('notifications-test');
  };

  const initComponent = list => {
    const foundContainer = getComponent(list);
    const ntfsAmount = list.length ? ` (${list.length})` : '';
    expect(foundContainer).toHaveTextContent('Notifications' + ntfsAmount);
    return foundContainer;
  };

  const tests = {
    'has empty list': () => {
      const foundContainer = initComponent([]);
      const emptyMsgEl = foundContainer.querySelector('#nts-empty');
      expect(emptyMsgEl).toHaveTextContent('Notifications list is empty');
    },
    'has filled list': () => {
      const testValues = [
        {
          icon: testImgSrc,
          type: 'viewerAdd',
          note_date: '01.27.2021, 10:07:47 PM',
          userName: 'Feodar',
          boxName: 'Mahasafa',
          msgEntries: ['part-1', 'chapter-2 ', 'chunk-3']      
        },
        {
          note_date: '16.01.2027, 12:10:26 PM',
          type: 'helloMsg',
          msgEntries: ['Not welcome here, you must really love DichBox']
        }
      ];
      const foundContainer = initComponent(testValues);
      const notifications = foundContainer
        .getElementsByClassName('nts-msg');
      const clearBtn = foundContainer
        .querySelector('#nts-clear-all');

      expect(notifications).toHaveLength(testValues.length);
      expect(clearBtn).toHaveAttribute('type', 'button');
      expect(clearBtn).toHaveDisplayValue('clear all');

      for (const i in testValues) {
        const iconSrc = testValues[i].icon || logoDefault;
        const dateVal = testValues[i].note_date;
        const el = notifications[i];
        const [ headContainer, rmLogo ] = el
          .querySelector('.head').children;
        const [ iconEl, dateEl ] = headContainer.children;
        const noteContainer = el.querySelector('.note-msg');

        expect(iconEl).toHaveAttribute('src', iconSrc);
        expect(dateEl).toHaveTextContent(dateVal);
        expect(rmLogo).toHaveAttribute('src', trashBin);
        expect(noteContainer).toBeTruthy();
      }
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
