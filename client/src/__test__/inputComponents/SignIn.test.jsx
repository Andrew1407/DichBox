import React from 'react';
import { render } from '@testing-library/react';
import SignIn from '../../components/SignForms/SignIn';

describe('Sign in tests', () => {
  const props = {
    submitSignIn: jest.fn(),
    getOnChangeVerifier: jest.fn(),
    warnings: { email: null, password: null },
    submitButton: {
      disabled: true,
      style: { borderColor: '#ffffff', color: '#000000' }
    }
  };
  const { getByTestId } = render(<SignIn { ...props } />);
  const foundForm = getByTestId('sign-in-test');

  const tests = {
    'has submit button': () => {
      const input = foundForm.querySelector('.sign-form > .form-submit');
      expect(input).toHaveAttribute('type', 'submit');
      expect(input).toHaveDisplayValue('sign in');
      expect(input).toHaveStyle(props.submitButton.style);
    },
    'has sign fields': () => {
      const expectedLength = 2;
      const signFields = foundForm.getElementsByClassName('sign-field');
      expect(signFields).toHaveLength(expectedLength);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
