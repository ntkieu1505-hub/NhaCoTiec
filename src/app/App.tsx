import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ChatBotWidget } from '../components/ChatBotWidget';

export const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
      <ChatBotWidget />
    </>
  );
};

export default App;
