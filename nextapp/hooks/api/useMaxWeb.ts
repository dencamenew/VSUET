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

interface MaxWebAppChat {
    id: number;
    type: string;
}

interface ParsedInitData {
    user?: MaxWebAppUser;
    chat?: MaxWebAppChat;
    auth_date?: string;
    hash?: string;
    query_id?: string;
    ip?: string;
}

export function useMaxWebApp() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [webApp, setWebApp] = useState<any>(null);
    const [initData, setInitData] = useState<MaxWebAppData | null>(null);
    const [startParam, setStartParam] = useState<string | null>(null);
    const [rawData, setRawData] = useState<string | null>(null);
    const [parsedRawData, setParsedRawData] = useState<ParsedInitData | null>(null);

    useEffect(() => {
        const checkWebApp = () => {
            if (typeof window !== 'undefined' && window.WebApp) {
                setWebApp(window.WebApp);

                const rawInitData = window.WebApp.initDataManager?.rawInitData;
                console.log('Raw init data:', rawInitData);
                setRawData(rawInitData);

                if (rawInitData) {
                    const params = new URLSearchParams(rawInitData);
                    const parsed: Record<string, any> = {};

                    for (const [key, value] of params.entries()) {
                        try {
                            parsed[key] = JSON.parse(value);
                        } catch {
                            parsed[key] = value;
                        }
                    }

                    console.log('Parsed raw data:', parsed);
                    setParsedRawData(parsed as ParsedInitData);
                }

                setInitData(window.WebApp.initDataUnsafe);
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

    return { webApp, initData, startParam, rawData, parsedRawData };
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WebApp: any;
    }
}
