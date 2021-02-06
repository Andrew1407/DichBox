import React from 'react';
import { render } from '@testing-library/react';
import SignUp from '../../components/SignForms/SignUp';

describe('Sign up tests', () => {
  const props = {
    submitSignUp: jest.fn(),
    getOnChangeVerifier: jest.fn(),
    warnings: { email: null, password: null },
    submitButton: {
      disabled: true,
      style: { borderColor: '#ffffff', color: '#000000' }
    }
  };
  const { getByTestId } = render(<SignUp { ...props } />);
  const foundForm = getByTestId('sign-up-test');

  const tests = {
    'has submit button': () => {
      const input = foundForm.querySelector('.sign-form > .form-submit');
      expect(input).toHaveAttribute('type', 'submit');
      expect(input).toHaveDisplayValue('create account');
      expect(input).toHaveStyle(props.submitButton.style);
    },
    'has sign fields': () => {
      const expectedLength = 3;
      const signFields = foundForm.getElementsByClassName('sign-field');
      expect(signFields).toHaveLength(expectedLength);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
