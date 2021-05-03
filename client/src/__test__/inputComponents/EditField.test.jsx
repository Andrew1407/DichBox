import React from 'react';
import { render } from '@testing-library/react';
import EditField from '../../components/inputFields/EditField';

describe('Edit field tests', () => {
  const getField = props => {
    const { getByTestId } = render(<EditField { ...props } />);
    return getByTestId('edit-field-test');
  };
  const testProps = { 
    handleOnChange: jest.fn(),
    label: 'metametal'
  };

  const tests = {
    'has textarea (default)': () => {
      const field = getField({ ...testProps, textarea: true });
      const textarea = field.querySelector('textarea');
      expect(textarea).toHaveAttribute('spellCheck', 'false');
      expect(textarea).toHaveAttribute('maxLength', '100');
      expect(textarea).toHaveValue('');
      expect(textarea).toHaveStyle('color: #00d9ff');
    },
    'has textarea (props and warning)': () => {
      const props = {
        ...testProps,
        inputValue: 'dichinput',
        inputColor: '#ffffff',
        textarea: true
      };
      const field = getField(props);
      const textarea = field.querySelector('textarea');
      expect(textarea).toHaveStyle(`color: ${props.inputColor}`);
      expect(textarea).toHaveValue(props.inputValue);
    },
    'has input (text-like)': () => {
      const props = { ...testProps, type: 'email', inputValue: 'dichduck' };
      const field = getField(props);
      const input = field.querySelector('input');
      expect(input).toHaveAttribute('spellCheck', 'false');
      expect(input).toHaveAttribute('type', props.type);
      expect(input).toHaveValue(props.inputValue);
      expect(input).toHaveStyle('color: #00d9ff');
    },
    'has input (color type) and warning': () => {
      const warning = { borderColor: '#ffffff', text: 'FOX_MINE_DEAD' };
      const props = { ...testProps, warning, type: 'color' };
      const field = getField(props);
      const inputEl = field.querySelector('input');
      const warningEl = field.querySelector('i');
      expect(inputEl).toHaveValue('#00d9ff');
      expect(inputEl).toHaveStyle(`borderBottomColor: ${warning.borderColor}`);
      expect(warningEl).toHaveTextContent(warning.text);
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
