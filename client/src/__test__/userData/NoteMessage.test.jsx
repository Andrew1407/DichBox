import React from 'react';
import { Router } from 'react-router-dom';
import { render, cleanup } from '@testing-library/react';
import NoteMessage from '../../components/UserData/NoteMessage';

describe('Note message tests', () => {
  const getComponent = noteProps => {
    const { getByTestId } = render(
      <Router history={{
        push: jest.fn(),
        location: { pathname: `/${noteProps.userName}` },
        listen: jest.fn() 
      }}>
        <NoteMessage { ...noteProps } />
      </Router>
    );

    return getByTestId('note-msg-test');
  };

  const testData = {
    userName: 'Pizza-Man',
    nameColor: '#ababab',
    boxName: 'TastyStack',
    boxColor: '#343536',
    msg: ['part-1', 'chapter-2 ', 'chunk-3']
  };

  const tests = {
    'has list handler message': () => {
      const checkComponent = type => {
        const { msg } = testData;
        const noteProps = { ...testData, type };
        const noteContainer = getComponent(noteProps);
        const textContent = msg[0]
          .concat(' ' + testData.userName + ' ')
          .concat(msg[1])
          .concat(testData.boxName + ' ')
          .concat(msg[2] + '.');

        expect(noteContainer).toHaveTextContent(textContent);
        cleanup();
      };

      const noteTypes = ['viewerAdd', 'viewerRm', 'editorAdd', 'editorRm'];
      noteTypes.forEach(checkComponent);
    },
    'has box add message': () => {
      const { msg } = testData;
      const noteProps = { ...testData, type: 'boxAdd' };
      const noteContainer = getComponent(noteProps);
      const textContent = msg[0]
        .concat(' ' + testData.userName + ' ')
        .concat(msg[1])
        .concat(testData.boxName + '.');

      expect(noteContainer).toHaveTextContent(textContent);
    },
    'has removed user message': () => {
      const { msg, userName } = testData;
      const noteProps = { ...testData, type: 'userRm' };
      const noteContainer = getComponent(noteProps);
      const textContent = `${msg[0]} (${userName}) ${msg[1]}`;

      expect(noteContainer).toHaveTextContent(textContent);
    },
    'has removed user message': () => {
      const msg = ['bloody tango in my room in Zoom'];
      const noteProps = { msg, type: 'helloMsg' };
      const noteContainer = getComponent(noteProps);

      expect(noteContainer).toHaveTextContent(msg[0]);
    },
    'handles undefined message type': () => {
      const noteProps = { msg: [], type: 'undefinedType' };
      const noteContainer = getComponent(noteProps);

      expect(noteContainer).toHaveTextContent('Invalid notification');
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});

