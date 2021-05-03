import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import BoxEntries from '../../components/BoxData/BoxEntries';
import MenuContextProvider from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import testImgSrc from '../../styles/imgs/dich-icon.png';
import trashBinSrc from '../../styles/imgs/trash-bin.png';
import addFileLogoSrc from '../../styles/imgs/add-file.png';
import addFolderLogoSrc from '../../styles/imgs/add-folder.png';
import boxMoreLogoSrc from '../../styles/imgs/box-more.png';
import boxEditLogoSrc from '../../styles/imgs/box-edit.png';
import addImageSrc from '../../styles/imgs/add-image.png';

describe('Box entries tests', () => {
  const pathname = 'testPath/testDir/testDir26';
  const getComponent = (ownPage, boxDetails) => {
    const userProps = {
      userData: { ownPage },
      dispatchUserData: jest.fn(),
      pathName: 'gofocide',
      username: 'gofocide'
    };
    const boxProps = {
      boxDetails,
      pathEntries: [],
      setBoxHiddenState: jest.fn(),
      setBoxesList: jest.fn(),
      setBoxDetails: jest.fn(),
      setEditBoxState: jest.fn(),
      setPathEntries: jest.fn(),
      fetchEntries: jest.fn()
    };

    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname }, listen: jest.fn() }}>
        <MenuContextProvider>
        <UserContext.Provider value={ userProps }>
        <BoxesContext.Provider value={ boxProps }>
          <BoxEntries />
        </BoxesContext.Provider>
        </UserContext.Provider>
        </MenuContextProvider>
      </Router>
    );
    
    return getByTestId('box-entries-test');
  };

  const boxDetails = {
    name: 'embeddedSystems',
    owner_name: 'mrPoison',
    access_level: 'private',
    reg_date: '30.11.2000',
    last_edited: '14.07.2001',
    description: 'pls feed me with carrot'
  };

  const checkOptions = (editor, ownPage, optionsProperties) => {
    const boxData = { ...boxDetails, editor };
    const boxEntries = getComponent(ownPage, boxData);
    const optionsAmount = optionsProperties.length;
    const entriesOptions = boxEntries
      .getElementsByClassName('entries-imgs');

    expect(entriesOptions).toHaveLength(optionsAmount);
    for (const i in optionsProperties) {
      const option = entriesOptions[i];
      const [ title, src ] = optionsProperties[i];
      expect(option).toHaveAttribute('title', title);
      expect(option).toHaveAttribute('src', src);
    }
  } 

  const tests = {
    'has box data with logo': () => {
      const ownPage = false;
      const boxData = {
        ...boxDetails,
        editor: false,
        logo: testImgSrc,
        name_color: '#dddddd',
        owner_nc: '#ffffff',
        description_color: '#000000'
      };
      const boxEntries = getComponent(ownPage, boxData);
      const entriesLogo = boxEntries.querySelector('#entries-logo');
      const detailsFields = 6;
      const detailsContainer = boxEntries
        .querySelectorAll('.name-desc :first-child > p');
      const [ name, desc, creator, type, created, edited ] = detailsContainer;

      expect(entriesLogo).toHaveAttribute('src', testImgSrc);
      expect(detailsContainer).toHaveLength(detailsFields);
      expect(name).toHaveTextContent(boxData.name);
      expect(name).toHaveStyle(`color: ${boxData.name_color}`);
      expect(desc).toHaveTextContent(boxData.description);
      expect(desc).toHaveStyle(`color: ${boxData.description_color}`);
      expect(creator).toHaveTextContent(`Creator: ${boxData.owner_name}`);
      expect(creator.querySelector('span'))
        .toHaveStyle(`color: ${boxData.owner_nc}`);
      expect(type).toHaveTextContent(`Type: ${boxData.access_level}`);
      expect(created).toHaveTextContent(`Created: ${boxData.reg_date}`);
      expect(edited).toHaveTextContent(`Last edited: ${boxData.last_edited}`);
    },
    'has box data without logo': () => {
      const ownPage = false;
      const boxData = { ...boxDetails, editor: false };
      const boxEntries = getComponent(ownPage, boxData);
      const entriesLogo = boxEntries.querySelector('#entries-logo');
      expect(entriesLogo).toBeNull();
    },
    'has entries options (editor and own page mode)': () => {
      const [ editor, ownPage ] = [true, true];
      const optionsProperties = [
        ['Add image', addImageSrc],
        ['Add file', addFileLogoSrc],
        ['Add directory', addFolderLogoSrc],
        ['Edit box info', boxEditLogoSrc],
        [`Remove "${boxDetails.name}" box`, trashBinSrc],
        ['Hide box description', boxMoreLogoSrc]
      ];
      checkOptions(editor, ownPage, optionsProperties);
    },
    'has entries options (editor mode only)': () => {
      const [ editor, ownPage ] = [true, false];
      const optionsProperties = [
        ['Add image', addImageSrc],
        ['Add file', addFileLogoSrc],
        ['Add directory', addFolderLogoSrc],
        ['Hide box description', boxMoreLogoSrc]
      ];
      checkOptions(editor, ownPage, optionsProperties);
    },
    'has entries options (own page mode only)': () => {
      const [ editor, ownPage ] = [false, true];
      const optionsProperties = [
        ['Edit box info', boxEditLogoSrc],
        [`Remove "${boxDetails.name}" box`, trashBinSrc],
        ['Hide box description', boxMoreLogoSrc]
      ];
      checkOptions(editor, ownPage, optionsProperties);
    },
    'has entries options (neither owner nor editor)': () => {
      const [ editor, ownPage ] = [false, false];
      const optionsProperties = [
        ['Hide box description', boxMoreLogoSrc]
      ];
      checkOptions(editor, ownPage, optionsProperties);
    },
    'has control elements': () => {
      const ownPage = false;
      const boxData = { ...boxDetails, editor: false };
      const boxEntries = getComponent(ownPage, boxData);
      const [ searchLabel, searchInput ] = boxEntries
        .querySelectorAll('#entries-search > *');
      const entriesPathStr = pathname.split('/').slice(1);
      const entriesPath = boxEntries
        .querySelectorAll('#box-entries-path > span');
      const backBtn = boxEntries
        .querySelector('#box-entries-back-btn');

      expect(searchLabel).toHaveTextContent('search:');
      expect(searchInput).toHaveAttribute('spellCheck', 'false');
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('name', 'entriesSearch');
      expect(searchInput).toHaveValue('');
      expect(entriesPath).toHaveLength(entriesPathStr.length);
      expect(backBtn).toHaveAttribute('type', 'button');
      expect(backBtn).toHaveDisplayValue('view other boxes');
      
      for (const i in entriesPathStr) {
        const prefix = Number(i) ? '/ ': ''; 
        expect(entriesPath[i]).toHaveTextContent(prefix + entriesPathStr[i]);
      }
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
