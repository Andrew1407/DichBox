import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Loading from '../../components/Loading';
import loadingGif from '../../styles/imgs/loading.gif';

describe('Loading tests', () => {
  const { getByTestId } = render(<Loading />);
  const foundLoading = getByTestId('loading-test');

  const tests = {
    'has text content': () => {
      expect(foundLoading).toHaveTextContent('Loading...');
      expect(foundLoading).toHaveTextContent('Please, stand by');
    },
    'has image': () => {
      const loadingImg = foundLoading.querySelector('img');
      expect(loadingImg).toHaveAttribute('src', loadingGif);
    },
    'matches snapshot': () => {
      const tree = renderer.create(<Loading />).toJSON();
      expect(tree).toMatchSnapshot();
    }
  };

  for (const key in tests)
    it(key, tests[key]);
});
