import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Layout from './Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; // Import Bootstrap JS
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import 'nprogress/nprogress.css';
import { persistor, store } from './redux/store';
import './tailwind.css'
import { SocketProvider } from './SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      {/* <SocketContextProvider> */}
      <SocketProvider>
        <Layout />
      </SocketProvider>
      {/* </SocketContextProvider> */}

    </PersistGate>
  </Provider>
);

// Optional: If you want to start measuring performance in your app
// reportWebVitals(console.log);
reportWebVitals();
