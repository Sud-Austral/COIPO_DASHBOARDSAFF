import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './app/providers';
import { Router } from './app/router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <Router />
    </AppProviders>
  </React.StrictMode>,
);
