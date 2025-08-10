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

    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
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
