import { atom, useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";

const tokenAtom = atom<string | undefined>(undefined);

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