import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { FontSwitcher } from '../components/common/FontSwitcher';

export const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
      <FontSwitcher />
    </>
  );
};

export default App;

