import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
          card: 'bg-white shadow-none rounded-none',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50 text-gray-600',
          formFieldInput: 'rounded-lg border-gray-200',
          footer: 'hidden',
          rootBox: 'w-full',
          card: 'w-full shadow-none'
        },
        layout: {
          socialButtonsPlacement: 'bottom',
          termsPageUrl: 'https://clerk.com/terms'
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);