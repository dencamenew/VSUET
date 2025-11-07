"use client"

import { useState } from "react"

import type { Language } from "../lib/translations"
import { useAuth } from "@/hooks/useAuth"
import { AuthGuard } from "@/components/security/AuthGuard"
import AuthModule from "@/modules/AuthModule"
import { useRole } from "@/components/security/useRole"
import { TeacherHandler } from "@/modules/teacher/Handler"

// Интерфейс для данных групп и предметов
export interface GroupSubjects {
  [groupName: string]: string[]
}

function App() {
  const { isAuth } = useAuth();
  const { role } = useRole();

  const [groupsSubjects, setGroupsSubjects] = useState<GroupSubjects>({})
  const [showProfile, setShowProfile] = useState(false);
  const [language, setLanguage] = useState<Language>("ru")

  // const URL = "https://teacherbackend.cloudpub.ru/api"

  if (!isAuth) {
    return <AuthModule language={language} />
  };

  if (role === "teacher") {
    return (
      <AuthGuard>
        <TeacherHandler />
      </AuthGuard>
    );
  }

  return null;
}

export default App;