import { useEffect } from 'react';
import { MainPage } from './components/main-page/main-page';
import './index.css';
import { ClipboardTrackerGlobal } from './services/clipboard-tracker';

function App() {
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') !== -1) {
      ClipboardTrackerGlobal.startTrackingFromElectronMain();
    }
  }, []);

  return <MainPage />;
}

export default App;
