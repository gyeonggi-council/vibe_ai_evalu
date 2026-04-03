import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AssessmentProvider } from './context/AssessmentContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AssessmentProvider>
          <App />
        </AssessmentProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
