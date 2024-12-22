import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import EloRankingPage from "./EloRankingPage";
import HomePage from "./HomePage";
import RankingResultsPage from "./RankingResultsPage.js";
import "./styles/themes.css";

function App() {
  const [theme, setTheme] = useState("dark");
  const [fontTheme, setFontTheme] = useState("modern");
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [rankedMovies, setRankedMovies] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.className = `font-theme-${fontTheme}`;
  }, [fontTheme]);

  const handleMoviesSelected = (movies) => {
    setSelectedMovies(movies);
    setCurrentPage("ranking");
  };

  const handleRankingComplete = (rankedMovies) => {
    setRankedMovies(rankedMovies);
    setCurrentPage("results");
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onMoviesSelected={handleMoviesSelected} />;
      case "ranking":
        return (
          <EloRankingPage
            movies={selectedMovies}
            onRankingComplete={handleRankingComplete}
          />
        );
      case "results":
        return (
          <RankingResultsPage
            movies={rankedMovies}
            onStartOver={() => {
              setSelectedMovies([]);
              setRankedMovies([]);
              setCurrentPage("home");
            }}
          />
        );
      default:
        return <HomePage onMoviesSelected={handleMoviesSelected} />;
    }
  };

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
      {renderCurrentPage()}
    </div>
  );
}

export default App;
