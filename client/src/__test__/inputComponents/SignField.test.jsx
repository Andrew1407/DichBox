import React from 'react';
import { render } from '@testing-library/react';
import SignField from '../../components/inputFields/SignField';

describe('Sign field tests', () => {
  const getField = props => {
    const { getByTestId } = render(<SignField { ...props } />);
    return getByTestId('sign-field-test');
  };
  const testProps = {
    handleOnChange: jest.fn(),
    type: 'password',
    label: 'metasecret'
  };

  const tests = {
    'hasn\'t warning': () => {
      const field = getField(testProps);
      const input = field.querySelector('input');
      const warning = field.querySelector('i');
      expect(field).toHaveTextContent(testProps.label);
      expect(input).toHaveAttribute('spellCheck', 'false');
      expect(input).toHaveAttribute('type', testProps.type);
      expect(warning).toBeEmptyDOMElement();
    },
    'has warning': () => {
      const warning = { borderColor: '#ffffff', text: 'dichpuffer' };
      const field = getField({ ...testProps, warning });
      const inputEl = field.querySelector('input');
      const warningEl = field.querySelector('i');
      expect(inputEl).toHaveStyle(`borderBottomColor: ${warning.borderColor}`);
      expect(warningEl).toHaveTextContent(warning.text);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
