import { TRoles, useMe } from "@/hooks/api/useMe";
import { atom, useAtom } from "jotai";
import { useLayoutEffect } from "react";

const roleAtom = atom<TRoles>(undefined);

export function useRole() {
    const [role, setRole] = useAtom(roleAtom);
    const user = useMe();

    useLayoutEffect(() => {
        if (user && user.role) {
            setRole(user.role);
        }
    }, [user]);

    return {
        role,
        setRole
    }
};