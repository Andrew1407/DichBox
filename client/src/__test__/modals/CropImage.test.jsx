import React from 'react';
import { render } from '@testing-library/react';
import CropImage from '../../modals/CropImage';

describe('Crop image modal test', () => {
  const getModal = testId => {
    const { getByTestId } = render(
      <CropImage {...{
        ariaShowApp: true,
        cropModalHidden: false,
        setCropModalHidden: jest.fn(),
        setLogoEdited: jest.fn()
      }}/>
    );
    
    return getByTestId(testId);
  }

  const tests = {
    'has title attributes': () => {
      const foundModal = getModal('crop-input-title-test');
      const input = foundModal.querySelector('input');
      expect(foundModal).toHaveTextContent('file:');
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAttribute('accept', 'image/*');
    },
    'has confirm buttons': () => {
      const foundModal = getModal('crop-input-btns-test');
      const [ applyBtn, cancelBtn ] = foundModal
        .getElementsByTagName('input');
      
      expect(applyBtn).toHaveAttribute('type', 'button');
      expect(applyBtn).toHaveDisplayValue('apply');
      expect(cancelBtn).toHaveAttribute('type', 'button');
      expect(cancelBtn).toHaveDisplayValue('cancel');
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
