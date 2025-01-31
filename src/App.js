import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import EloRankingPage from "./EloRankingPage";
import HomePage from "./HomePage";
import IMDBImportPage from "./IMDBImportPage";
import RankingResultsPage from "./RankingResultsPage";
import "./styles/scrollbar.css";
import "./styles/themes.css";

function App() {
  const [theme, setTheme] = useState("dark");
  const [fontTheme, setFontTheme] = useState("modern");
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [rankedMovies, setRankedMovies] = useState([]);
  const [importedMovies, setImportedMovies] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.add("custom-scrollbar");

    return () => {
      document.documentElement.classList.remove("custom-scrollbar");
    };
  }, [theme]);

  useEffect(() => {
    document.body.className = `font-theme-${fontTheme} custom-scrollbar`;
  }, [fontTheme]);

  const handleMoviesSelected = (movies) => {
    setSelectedMovies(movies);
    setCurrentPage("ranking");
  };

  const handleRankingComplete = (rankedMovies) => {
    setRankedMovies(rankedMovies);
    setCurrentPage("results");
  };

  const handleImportPage = () => {
    setCurrentPage("import");
  };

  const handleImportComplete = (movies) => {
    setImportedMovies(movies);
    setCurrentPage("home");
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            onMoviesSelected={handleMoviesSelected}
            onImportClick={handleImportPage}
            initialMovies={importedMovies}
          />
        );
      case "import":
        return <IMDBImportPage onMoviesImported={handleImportComplete} />;
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
              setImportedMovies([]);
              setCurrentPage("home");
            }}
          />
        );
      default:
        return (
          <HomePage
            onMoviesSelected={handleMoviesSelected}
            onImportClick={handleImportPage}
            initialMovies={importedMovies}
          />
        );
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-text custom-scrollbar"
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
