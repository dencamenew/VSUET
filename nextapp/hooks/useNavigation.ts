import { useEffect, useState } from "react";
import { useRole } from "@/components/security/useRole";

type TeacherNav = "schedule" | "rating" | "attendance" | "statements";
type StudentNav = "schedule" | "rating";
export type Nav = TeacherNav | StudentNav;

const DEFAULT_PAGES: Record<string, Nav> = {
  teacher: "schedule",
  student: "schedule",
};

const VALID_PAGES: Record<string, Nav[]> = {
  teacher: ["schedule", "attendance", "rating", "statements"],
  student: ["schedule", "rating"],
};

export function useNavigation() {
  const { role } = useRole();
  
  const getInitialModule = (): Nav => {
    const stored = localStorage.getItem("currentModule") as Nav;
    
    if (role && stored && VALID_PAGES[role]?.includes(stored)) {
      return stored;
    }
    
    return role ? DEFAULT_PAGES[role] : "schedule";
  };

  const [currentModule, setCurrentModule] = useState<Nav>(getInitialModule());

  useEffect(() => {
    if (role && !VALID_PAGES[role]?.includes(currentModule)) {
      const newModule = DEFAULT_PAGES[role];
      setCurrentModule(newModule);
      localStorage.setItem("currentModule", newModule);
    }
  }, [role, currentModule]);

  useEffect(() => {
    localStorage.setItem("currentModule", currentModule);
  }, [currentModule]);

  const navigateTo = (module: Nav) => {
    if (role && VALID_PAGES[role]?.includes(module)) {
      setCurrentModule(module);
    }
  };

  return {
    currentModule,
    setCurrentModule: navigateTo,
    availablePages: role ? VALID_PAGES[role] : [],
  };
}
