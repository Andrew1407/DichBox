import React from 'react';
import { render } from '@testing-library/react';
import ConfirmModal from '../../modals/ConfirmModal';

describe('Confirm modal test', () => {
  const message = 'Harry Potter, do you want to use a gun';
  const getModal = testId => {
    const { getByTestId } = render(
      <ConfirmModal {...{
        message,
        ariaShowApp: true,
        isOpen: true,
        okClb: jest.fn(),
        setModalOptions: jest.fn()
      }}/>
    );
    
    return getByTestId(testId);
  }

  const tests = {
    'has title message': () => {
      const foundModal = getModal('confirm-modal-title-test');
      expect(foundModal).toHaveTextContent(`¿ ${message} ؟`);
    },
    'has confirm buttons': () => {
      const foundModal = getModal('confirm-modal-btns-test');
      const [ okBtn, cancelBtn ] = foundModal
        .getElementsByTagName('input');
      
      expect(okBtn).toHaveAttribute('type', 'button');
      expect(okBtn).toHaveDisplayValue('ok');
      expect(cancelBtn).toHaveAttribute('type', 'button');
      expect(cancelBtn).toHaveDisplayValue('cancel');
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
