import { Language } from "@/lib/translations"
import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const langAtom = atom<Language>("ru");

// TODO: переделать под i18n
export function useLanguage() {
    const [lang, setLang] = useAtom(langAtom);

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language") as Language;
        if (savedLanguage) {
            setLang(savedLanguage)
        } else {
            localStorage.setItem("language", "ru")
        }
    }, [lang]);

    return {
        lang,
        setLang
    }
};