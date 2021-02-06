import React from 'react';
import { Router } from 'react-router-dom';
import { render, cleanup } from '@testing-library/react';
import ShowArea from '../../components/FilesContent/ShowArea';
import { MenuContext } from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import BoxesContextProvider from '../../contexts/BoxesContext';
import testImgSrc from '../../styles/imgs/dich-icon.png';
import editLogo from '../../styles/imgs/file-edit.png';
import saveLogo from '../../styles/imgs/file-save.png';
import saveAllLogo from '../../styles/imgs/file-save-all.png';
import zoomInLogo from '../../styles/imgs/file-zoom-in.png';
import zoomOutLogo from '../../styles/imgs/file-zoom-out.png';
import downloadLogo from '../../styles/imgs/file-download.png';

describe('Show area tests', () => {
  const isEditor = true;
  const testFileSrc = 'MetaDichBox MetaUniverse';
  const testData = [
    { name: 'filename', type: 'file', src: testFileSrc },
    { name: 'imageName', type: 'image', src: testImgSrc }
  ];
  const copyData = data => data.map(x => ({ ...x }));
  const getShowArea = (openedFiles, editor) => {
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: '' }, listen: jest.fn() }}>
        <MenuContext.Provider value={{
          openedFiles,
          setUsersList: jest.fn(),
          usersList: [],
          dispatchOpenedFiles: jest.fn()
        }}>
        <UserContext.Provider value={{ userData: { editor } }}>
        <BoxesContextProvider>
          <ShowArea />
        </BoxesContextProvider>
        </UserContext.Provider>
        </MenuContext.Provider>
      </Router>
    );

    return getByTestId('show-area-test');
  };
  
  const tests = {
    'has valid icons entries': () => {
      const openedFiles = copyData(testData);
      openedFiles[0].opened = true;
      const filename = openedFiles[0].name;
      const foundArea = getShowArea(openedFiles, isEditor);
      const editIcons = foundArea.querySelectorAll('#edit-menu > img');
      const expectedEntries = [
        ['Set edit mode', editLogo],
        [`Save changes into "${filename}"`, saveLogo],
        ['Save changes into all opened files', saveAllLogo],
        ['Zoom in', zoomInLogo],
        ['Zoom out', zoomOutLogo],
        [`Download "${filename}"`, downloadLogo]
      ];

      for (const i in expectedEntries) {
        const icon = editIcons[i];
        const [ title, src ] = expectedEntries[i];
        expect(icon).toHaveAttribute('title', title);
        expect(icon).toHaveAttribute('src', src);
      }
    },
    'has valid icons quantity': () => {
      const variants = [
        [0, isEditor, 6],
        [0, !isEditor, 3],
        [1, isEditor, 2],
        [1, !isEditor, 2]
      ];

      for (const i in variants) {
        const [ fileIndex, editorMode, expectedLength ] = variants[i];
        const openedFiles = copyData(testData);
        openedFiles[fileIndex].opened = true;
        const foundArea = getShowArea(openedFiles, editorMode);
        const editIcons = foundArea.querySelectorAll('#edit-menu > img');
        expect(editIcons).toHaveLength(expectedLength);
        cleanup();
      }
    },
    'opened textfile': () => {
      const openedFiles = copyData(testData);
      openedFiles[0].opened = true;
      const foundArea = getShowArea(openedFiles, !isEditor);
      const textarea = foundArea.querySelector('textarea');
      expect(textarea).toHaveStyle('fontSize: 140%');
      expect(textarea).toHaveValue(openedFiles[0].src);
      expect(textarea).toHaveAttribute('spellCheck', 'false');
    },
    'opened image': () => {
      const openedFiles = copyData(testData);
      openedFiles[1].opened = true;
      const foundArea = getShowArea(openedFiles, !isEditor);
      const editMenu = foundArea.querySelector('#edit-menu');
      const image = foundArea.querySelector('#show-image > img');
      expect(editMenu).toHaveStyle({ width: '10%', marginLeft: '88%' });
      expect(image).toHaveStyle('width: 140%');
      expect(image).toHaveAttribute('src', testImgSrc);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
