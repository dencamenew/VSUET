import { useEffect, useState } from 'react';

interface MaxWebAppUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  photo_url: string;
}

interface MaxWebAppData {
  query_id?: string;
  auth_date?: number;
  hash?: string;
  start_param?: string;
  user?: MaxWebAppUser;
}

export function useMaxWebApp() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [webApp, setWebApp] = useState<any>(null);
  const [initData, setInitData] = useState<MaxWebAppData | null>(null);
  const [startParam, setStartParam] = useState<string | null>(null);

  useEffect(() => {
    const checkWebApp = () => {
      if (typeof window !== 'undefined' && window.WebApp) {
        console.log(window.WebApp);
        setWebApp(window.WebApp);
        console.log(initData);
        console.log(window.WebApp.initData);
        console.log(window.WebApp.initData);
        console.log(window.WebApp.initDataManager);
        console.log(window.WebApp.initDataManager.rawInitData);
        console.log(window.WebApp.initDataManager.rawPlatformData);


        setInitData(window.WebApp.initDataUnsafe);
        console.log(startParam);
        setStartParam(window.WebApp.initDataUnsafe?.start_param || null);
        
        window.WebApp.ready();
      }
    };

    if (document.readyState === 'complete') {
      checkWebApp();
    } else {
      window.addEventListener('load', checkWebApp);
      return () => window.removeEventListener('load', checkWebApp);
    }
  }, []);

  return { webApp, initData, startParam };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WebApp: any;
  }
}
