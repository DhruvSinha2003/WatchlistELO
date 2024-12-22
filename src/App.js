import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Header from "./components/Header";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import EloRankingPage from "./EloRankingPage";
import HomePage from "./HomePage";
import IMDBImportPage from "./IMDBImportPage";
import RankingResultsPage from "./RankingResultsPage";
import SavedListsPage from "./SavedListsPage";
import "./styles/themes.css";
import { auth } from "./utils/auth";

const PrivateRoute = ({ children }) => {
  const user = auth.getCurrentUser();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const [theme, setTheme] = useState("dark");
  const [fontTheme, setFontTheme] = useState("modern");
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [rankedMovies, setRankedMovies] = useState([]);
  const [importedMovies, setImportedMovies] = useState([]);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.className = `font-theme-${fontTheme}`;
  }, [fontTheme]);

  const handleMoviesSelected = (movies) => {
    setSelectedMovies(movies);
  };

  const handleRankingComplete = (rankedMovies) => {
    setRankedMovies(rankedMovies);
  };

  const handleImportComplete = (movies) => {
    setImportedMovies(movies);
    setShowImport(false);
  };

  const handleStartOver = () => {
    setSelectedMovies([]);
    setRankedMovies([]);
    setImportedMovies([]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-text">
        <Header
          theme={theme}
          setTheme={setTheme}
          fontTheme={fontTheme}
          setFontTheme={setFontTheme}
        />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  {showImport ? (
                    <IMDBImportPage
                      onImportComplete={handleImportComplete}
                      onCancel={() => setShowImport(false)}
                    />
                  ) : (
                    <HomePage
                      onMoviesSelected={handleMoviesSelected}
                      onImportClick={() => setShowImport(true)}
                      initialMovies={importedMovies}
                    />
                  )}
                </PrivateRoute>
              }
            />

            <Route
              path="/ranking"
              element={
                <PrivateRoute>
                  {selectedMovies.length > 0 ? (
                    <EloRankingPage
                      movies={selectedMovies}
                      onRankingComplete={handleRankingComplete}
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </PrivateRoute>
              }
            />

            <Route
              path="/results"
              element={
                <PrivateRoute>
                  {rankedMovies.length > 0 ? (
                    <RankingResultsPage
                      movies={rankedMovies}
                      onStartOver={handleStartOver}
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </PrivateRoute>
              }
            />

            <Route
              path="/lists"
              element={
                <PrivateRoute>
                  <SavedListsPage onCreateNew={handleStartOver} />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
