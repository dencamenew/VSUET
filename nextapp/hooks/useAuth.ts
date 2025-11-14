import { atom, useAtom } from "jotai";
import { useEffect, useLayoutEffect, useState } from "react";

const tokenAtom = atom<string | undefined>(undefined);

export function useTokenInit() {
    const { setToken } = useToken();

    useLayoutEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setToken(token);
        }
    }, []);
}

export function useToken() {
    const [token, setToken] = useAtom(tokenAtom);

    return {
        token,
        setToken
    }
};

export function useAuth() {
    const { token } = useToken();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        if (token) {
            setIsAuth(true);
        } else {
            setIsAuth(false);
        }
    }, [token]);

    return { isAuth };
};