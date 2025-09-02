"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import TeacherAuthPage from '../pages/TeacherAuthPage';
import TeacherSchedulePage from '../pages/TeacherSchedulePage';
import TeacherRatingPage from '../pages/TeacherRatingPage';
import TeacherAttendancePage from '../pages/TeacherAttendancePage';
import TeacherProfilePage from '../pages/TeacherProfilePage';
import { type Language } from '../lib/translations';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [currentPage, setCurrentPage] = useState<"schedule" | "rating" | "attendance">("schedule");
  const [showProfile, setShowProfile] = useState(false);
  const [language, setLanguage] = useState<Language>("ru");

  useEffect(() => {
    // Load saved language and theme
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLogin = (name: string) => {
    setTeacherName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTeacherName("");
    setCurrentPage("schedule");
    setShowProfile(false);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  if (!isAuthenticated) {
    return <TeacherAuthPage onLogin={handleLogin} language={language} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {currentPage === "schedule" && (
        <TeacherSchedulePage
          teacherName={teacherName}
          onNavigate={setCurrentPage}
          onShowProfile={() => setShowProfile(true)}
          language={language}
        />
      )}
      {currentPage === "rating" && (
        <TeacherRatingPage
          teacherName={teacherName}
          onNavigate={setCurrentPage}
          onShowProfile={() => setShowProfile(true)}
          language={language}
        />
      )}
      {currentPage === "attendance" && (
        <TeacherAttendancePage
          teacherName={teacherName}
          onNavigate={setCurrentPage}
          onShowProfile={() => setShowProfile(true)}
          language={language}
        />
      )}
      {showProfile && (
        <TeacherProfilePage
          teacherName={teacherName}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
          onLanguageChange={handleLanguageChange}
          language={language}
        />
      )}
    </div>
  );
}

export default App;
