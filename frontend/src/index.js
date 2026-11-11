import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

import './scss/index.scss';
import Navigation from './router';
import './scss/painelInterno.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Navigation />

    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={3500}
    />
  </React.StrictMode>
);
