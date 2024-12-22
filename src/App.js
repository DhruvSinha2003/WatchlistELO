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

  return (
    <Router>
      <div>
        <Header
          theme={theme}
          setTheme={setTheme}
          fontTheme={fontTheme}
          setFontTheme={setFontTheme}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage
                  onMoviesSelected={handleMoviesSelected}
                  initialMovies={importedMovies}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/ranking"
            element={
              <PrivateRoute>
                <EloRankingPage
                  movies={selectedMovies}
                  onRankingComplete={handleRankingComplete}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/results"
            element={
              <PrivateRoute>
                <RankingResultsPage
                  movies={rankedMovies}
                  onStartOver={() => {
                    setSelectedMovies([]);
                    setRankedMovies([]);
                    setImportedMovies([]);
                  }}
                />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
