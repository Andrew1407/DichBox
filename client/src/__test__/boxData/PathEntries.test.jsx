import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import PathEntries from '../../components/BoxData/PathEntries';
import MenuContextProvider from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import fileLogo from '../../styles/imgs/file-icon.png';
import dirLogo from '../../styles/imgs/folder-icon.png';
import removeSrc from '../../styles/imgs/entry-remove.png';
import renameSrc from '../../styles/imgs/entry-rename.png';

describe('Path entries tests', () => {
  const getComponent = ({ entriesSearch, pathname, pathEntries, editor }) => {
    const props = {
      entriesSearch,
      setFileManipulation: jest.fn(),
      setAddFileVisible: jest.fn()
    };
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname }, listen: jest.fn() }}>
        <MenuContextProvider>
        <UserContext.Provider value={{ userData: { editor } }}>
        <BoxesContext.Provider value={{ pathEntries, fetchEntries: jest.fn() }}>
          <PathEntries { ...props } />
        </BoxesContext.Provider>
        </UserContext.Provider>
        </MenuContextProvider>
      </Router>
    );
    
    return getByTestId('path-entries-test');
  };
  const shortenName = str => str.length < 17 ? str : `${str.slice(0, 16)}...`;

  const tests = {
    'has empty directory and short path': () => {
      const args = {
        entriesSearch: '',
        pathname: 'sucram',
        pathEntries: []
      };
      const pathEntries = getComponent(args);
      const entries = pathEntries.getElementsByClassName('be-item-wrap');
      expect(pathEntries).not.toHaveTextContent('...');
      expect(pathEntries).toHaveTextContent('This directory is empty');
      expect(entries).toHaveLength(0);
    },
    'has no files found by search string': () => {
      const args = {
        entriesSearch: 'bob',
        pathname: 'sucram',
        pathEntries: [{ type: 'dir', name: 'sponge' }]
      };
      const pathEntries = getComponent(args);
      const entries = pathEntries.getElementsByClassName('be-item-wrap');
      expect(pathEntries).not.toHaveTextContent('...');
      expect(pathEntries).toHaveTextContent('No files or directories were found');
      expect(entries).toHaveLength(0);
    },
    'has files and long path, no editor': () => {
      const args = {
        entriesSearch: '',
        pathname: 'sucram/suilerua/iraffag/rumit',
        pathEntries: [
          { type: 'dir', name: 'zoomio.balls.client.server' },
          { type: 'file', name: 'rm_tan.go' }
        ]
      };
      const pathEntries = getComponent(args);
      const entries = pathEntries
        .getElementsByClassName('be-item-wrap');
      const goBackEl = pathEntries
        .querySelector('#mol-units-list > .box-entries-item');
      const goBackImg = goBackEl.querySelector('img');
      const entriesArr = Array.from(
        pathEntries.getElementsByClassName('be-item-wrap')
      );
      const checkEntry = (el, obj) => {
        const itemContainer = el.querySelector('.box-entries-item');
        const editorIcons = el.querySelector('.be-item-icons');
        const typeIcon = itemContainer.querySelector('img');
        const logo = obj.type === 'dir' ? dirLogo : fileLogo;
        expect(itemContainer).toHaveAttribute('title', obj.name);
        expect(itemContainer).toHaveTextContent(shortenName(obj.name));
        expect(typeIcon).toHaveAttribute('src', logo);
        expect(editorIcons).toBeNull();
      };

      expect(goBackEl).toHaveTextContent('...');
      expect(goBackImg).toHaveAttribute('src', dirLogo);
      expect(entries).toHaveLength(args.pathEntries.length);
      for (const i in entriesArr)
        checkEntry(entriesArr[i], args.pathEntries[i]);
    },
    'has editor mode': () => {
      const args = {
        editor: true,
        entriesSearch: '',
        pathname: 'shamalungma',
        pathEntries: [{ type: 'file', name: 'angry-at.commit' }]
      };
      const pathEntries = getComponent(args);
      const iconsContainer = pathEntries
        .querySelector('.be-item-wrap .be-item-icons');
      const [ renameIcon, removeIcon ] = iconsContainer
        .getElementsByTagName('img');
      
      expect(renameIcon).toHaveAttribute('src', renameSrc);
      expect(renameIcon).toHaveAttribute('title', `Rename: "${args.pathEntries[0].name}"`);
      expect(removeIcon).toHaveAttribute('src', removeSrc);
      expect(removeIcon).toHaveAttribute('title', `Remove: "${args.pathEntries[0].name}"`);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
