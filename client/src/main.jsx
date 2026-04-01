import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { appStore } from "./store/appStore";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={appStore}>
      <Toaster 
        richColors 
        position="top-center"
       />
      <App />
    </Provider>
  </StrictMode>,
)
