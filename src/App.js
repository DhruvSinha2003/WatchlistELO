import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import HomePage from "./HomePage";
import "./styles/themes.css";

function App() {
  const [theme, setTheme] = useState("default");
  const [fontTheme, setFontTheme] = useState("modern");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.className = `font-theme-${fontTheme}`;
  }, [fontTheme]);

  return (
    <div
      className="min-h-screen bg-background text-text"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <Header
        currentTheme={theme}
        onThemeChange={setTheme}
        currentFont={fontTheme}
        onFontChange={setFontTheme}
      />
      <HomePage />
    </div>
  );
}

export default App;
