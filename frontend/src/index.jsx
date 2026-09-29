import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { backendApi } from './config/instance';

const root = ReactDOM.createRoot(document.getElementById('root'));
const renderApp = () => root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Inline env check + dynamic import let the production build drop the whole mocks tree.
// Render waits for the install, so no request can reach the real backend in mock mode.
if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_MOCK === 'true') {
  import('./mocks').then(({ installMockMode }) => {
    installMockMode(backendApi);
    renderApp();
  });
} else {
  renderApp();
}

reportWebVitals();
