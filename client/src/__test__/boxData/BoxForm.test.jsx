import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import BoxForm from '../../components/BoxData/BoxForm';
import MenuContextProvider from '../../contexts/MenuContext';
import UserContextProvider from '../../contexts/UserContext';
import VerifiersContextProvider from '../../contexts/VerifiersContext';
import BoxesContextProvider from '../../contexts/BoxesContext';
import testImgSrc from '../../styles/imgs/dich-icon.png';

describe('Box form tests', () => {
  const getComponent = editProps => {
    const { getByTestId } = render(
      <Router history={{ push: jest.fn(), location: { pathname: '' }, listen: jest.fn() }}>
        <MenuContextProvider>
        <UserContextProvider>
        <VerifiersContextProvider>
        <BoxesContextProvider>
          <BoxForm editParametrs={{ ...editProps, setEditBoxState: jest.fn() }} />
        </BoxesContextProvider>
        </VerifiersContextProvider>
        </UserContextProvider>
        </MenuContextProvider>
      </Router>
    );
    
    return getByTestId('box-form-test');
  };

  const tests = {
    'handles create state, empty box properties': () => {
      const props = { boxDetails: {} };
      const foundForm = getComponent(props);
      const [ handleLogoBtn, submitBtn, cancelBtn ] = foundForm
        .getElementsByClassName('edit-btn');
      const submitStyle = {
        borderColor: 'rgb(0, 217, 255)',
        color: 'rgb(0, 217, 255)'
      };

      expect(foundForm).toHaveTextContent('Create new box');
      expect(foundForm).toHaveTextContent('*allow users to view/edit/remove/create directories and files:');
      expect(handleLogoBtn).toHaveAttribute('type', 'button');
      expect(handleLogoBtn).toHaveDisplayValue('*set logo');
      expect(submitBtn).toHaveAttribute('type', 'submit');
      expect(submitBtn).toHaveDisplayValue('create box');
      expect(submitBtn).toHaveStyle(submitStyle);
      expect(cancelBtn).toHaveAttribute('type', 'button');
      expect(cancelBtn).toHaveDisplayValue('cancel');
    },
    'has correct edit fields': () => {
      const props = { boxDetails: {} };
      const editFieldsAmount = 5;
      const foundForm = getComponent(props);
      const editFields = foundForm.getElementsByClassName('edit-field');
      const expectedEFLengths = [2, 2, 1, 1];
      const entriesClasses = ['edit-name', 'edit-name', 'box-privacy', 'box-limited'];
      const logoEF = editFields[0];
      const logoEFEntry = logoEF.querySelector('#box-form-crop');

      expect(editFields).toHaveLength(editFieldsAmount);
      expect(logoEFEntry).toBeTruthy();
      
      for (const i in expectedEFLengths) {
        const collection = editFields[Number(i) + 1]
          .getElementsByClassName(entriesClasses[i]);
        expect(collection).toHaveLength(expectedEFLengths[i])
      }
    },
    'handles edit state with box properties': () => {
      const props = { boxDetails: { logo: testImgSrc }, edit: true };
      const foundForm = getComponent(props);
      const submitBtn = foundForm
        .querySelector('input[type=submit]');
      const boxLogo = foundForm.querySelector('#box-logo');
            
      expect(foundForm).toHaveTextContent('Edit box');
      expect(submitBtn).toHaveDisplayValue('edit box');
      expect(boxLogo).toHaveAttribute('src', props.boxDetails.logo);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});

