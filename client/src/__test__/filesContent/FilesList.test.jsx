import React from 'react';
import { render } from '@testing-library/react';
import FilesList from '../../components/FilesContent/FilesList';
import { MenuContext } from '../../contexts/MenuContext';
import crossSrc from '../../styles/imgs/file-close.png';

describe('Files list tests', () => {
  const openedFiles = [
    { opened: true, name: 'file1', filePath: [] },
    { opened: false, name: 'file2', filePath: ['p1', 'p2'] }
  ];
  const foundList = render(
    <MenuContext.Provider value={{ openedFiles, dispatchOpenedFiles: jest.fn() }}>
      <FilesList />
    </MenuContext.Provider>
  ).getByTestId('files-list-test');
  const containedFiles = foundList.getElementsByClassName('opened-file');
  const elementsFiles = Array.from(containedFiles);
  const checkFile = (el, obj) => {
    expect(el).toHaveTextContent(obj.name);
    expect(el).toHaveStyle(obj.style);
  };

  const tests = {
    'contain files': () => {
      expect(foundList).not.toBeEmptyDOMElement();
      expect(containedFiles).toHaveLength(openedFiles.length);
    },
    'has valid files': () => {
      const expectedArr = [
        {
          name: openedFiles[0].name,
          style: { color: 'black', backgroundColor: 'rgb(0, 217, 255)' }
        },
        {
          name: openedFiles[1].name,
          style: { color: 'rgb(0, 217, 255)', backgroundColor: 'black' }
        }
      ];

      for (const i in expectedArr) 
        checkFile(elementsFiles[i], expectedArr[i]);
    },
    'has cross image': () => {
      const [ fileElement ] = elementsFiles;
      const crossImg = fileElement.querySelector('img');
      expect(crossImg).toHaveAttribute('src', crossSrc);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
