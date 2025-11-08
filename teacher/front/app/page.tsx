"use client"

import { useAuth } from "@/hooks/useAuth"
import { AuthGuard } from "@/components/security/AuthGuard"
import AuthModule from "@/components/modules/Auth"
import { useRole } from "@/components/security/useRole"
import { TeacherHandler } from "@/components/modules/teacher/TeacherHandler"
import { StudentHandler } from "@/components/modules/student/StudentHandler"

// const URL = "https://teacherbackend.cloudpub.ru/api"

function App() {
  const { isAuth } = useAuth();
  const { role } = useRole();

  if (!isAuth) {
    return <AuthModule />
  };

  if (role === "teacher") {
    return (
      <AuthGuard>
        <TeacherHandler />
      </AuthGuard>
    );
  };

  if (role === "student") {
    return (
      <AuthGuard>
        <StudentHandler />
      </AuthGuard>
    )
  };

  if (role === "admin") {
    <AuthGuard>
      <div>
        Появится здесь позже
      </div>
    </AuthGuard>
  };

  return null;
}

export default App;