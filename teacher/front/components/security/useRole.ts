import { TRoles } from "@/hooks/api/useMe";
import { atom, useAtom } from "jotai";

const roleAtom = atom<TRoles>(undefined);

export function useRole() {
    const [role, setRole] = useAtom(roleAtom);

    return {
        role,
        setRole
    }
};