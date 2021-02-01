import React from 'react';
import { render } from '@testing-library/react';
import Footer from '../../components/Footer';

describe('Footer tests', () => {
  const { getByTestId } = render(<Footer />);
  const foundFooter = getByTestId('footer-test');

  const tests = {
    'has version': () => {
      const version = /version: \d\.\d\.\d/;
      expect(foundFooter).toHaveTextContent(version);
    },
    'has title': () => {
      expect(foundFooter).toHaveTextContent('DichES');
    },
    'has href': () => {
      const [ srcRef ] = Array.from(foundFooter.getElementsByTagName('a'));
      expect(foundFooter).toHaveTextContent('git repo');
      expect(srcRef).toHaveAttribute('href', 'https://github.com/Andrew1407/DichBox');
      expect(srcRef).toHaveAttribute('target', '_blank');
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
