import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { TimerProvider } from './contexts/TimerContext';
import './styles/index.css';

const AppWithLoadingHandler: React.FC = () => {
  useEffect(() => {
    // Signal that React has mounted successfully
    document.documentElement.classList.add('react-loaded');
    document.body.classList.add('react-loaded');
  }, []);

  return (
    <TimerProvider>
      <App />
    </TimerProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<AppWithLoadingHandler />);
} else {
  console.error('Root container not found');
}