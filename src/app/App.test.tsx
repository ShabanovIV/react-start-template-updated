import { render, screen } from '@testing-library/react';
import App from './App';

test('mounts app root', () => {
  render(<App />);
  expect(screen.getByTestId('app-root')).toBeInTheDocument();
});
