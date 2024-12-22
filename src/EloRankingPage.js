import { Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";

// ELO calculation constants
const K_FACTOR = 32;
const RATING_DIFFERENCE_SCALE = 400;

const calculateExpectedScore = (ratingA, ratingB) => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / RATING_DIFFERENCE_SCALE));
};

const calculateNewRating = (rating, expectedScore, actualScore) => {
  return Math.round(rating + K_FACTOR * (actualScore - expectedScore));
};

const EloRankingPage = ({ movies = [], onRankingComplete }) => {
  // Initialize movies with ELO ratings
  const [rankedMovies, setRankedMovies] = useState(() =>
    movies.map((movie) => ({
      ...movie,
      rating: 1400, // Starting ELO rating
      matches: 0,
    }))
  );

  const [currentPair, setCurrentPair] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate total needed comparisons (n * log n is usually sufficient)
  const totalComparisons = Math.ceil(movies.length * Math.log2(movies.length));
  const [comparisonsCount, setComparisonsCount] = useState(0);

  useEffect(() => {
    if (rankedMovies.length >= 2 && !isComplete) {
      selectNewPair();
    }
  }, [rankedMovies, isComplete]);

  const selectNewPair = () => {
    // Prioritize movies with fewer matches
    const sortedByMatches = [...rankedMovies].sort(
      (a, b) => a.matches - b.matches
    );

    // Select first movie from those with fewest matches
    const minMatches = sortedByMatches[0].matches;
    const candidatesA = sortedByMatches.filter((m) => m.matches === minMatches);
    const movieA = candidatesA[Math.floor(Math.random() * candidatesA.length)];

    // Find opponent close in rating
    const remainingMovies = rankedMovies.filter((m) => m.id !== movieA.id);
    const movieB =
      remainingMovies[Math.floor(Math.random() * remainingMovies.length)];

    setCurrentPair([movieA, movieB]);
  };

  const handleChoice = (winner, loser) => {
    const expectedScoreWinner = calculateExpectedScore(
      winner.rating,
      loser.rating
    );
    const newWinnerRating = calculateNewRating(
      winner.rating,
      expectedScoreWinner,
      1
    );
    const newLoserRating = calculateNewRating(
      loser.rating,
      1 - expectedScoreWinner,
      0
    );

    const updatedMovies = rankedMovies.map((movie) => {
      if (movie.id === winner.id) {
        return {
          ...movie,
          rating: newWinnerRating,
          matches: movie.matches + 1,
        };
      }
      if (movie.id === loser.id) {
        return { ...movie, rating: newLoserRating, matches: movie.matches + 1 };
      }
      return movie;
    });

    setRankedMovies(updatedMovies);
    setComparisonsCount((prev) => prev + 1);

    const newProgress = (comparisonsCount + 1) / totalComparisons;
    setProgress(Math.min(newProgress, 1));

    if (comparisonsCount + 1 >= totalComparisons) {
      setIsComplete(true);
      const sortedMovies = [...updatedMovies].sort(
        (a, b) => b.rating - a.rating
      );
      onRankingComplete?.(sortedMovies);
    } else {
      selectNewPair();
    }
  };

  if (isComplete) {
    return (
      <div className="text-center p-8">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">Ranking Complete!</h2>
        <p className="text-text-secondary mb-6">
          Your movies have been ranked based on your preferences.
        </p>
        <button
          className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-button-hover transition-colors"
          onClick={() =>
            onRankingComplete?.(
              rankedMovies.sort((a, b) => b.rating - a.rating)
            )
          }
        >
          View Results
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Choose Your Preferred Movie</h2>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-text-secondary">
          Progress: {Math.round(progress * 100)}%
        </p>
      </div>

      {currentPair.length === 2 && (
        <div className="grid md:grid-cols-2 gap-8">
          {currentPair.map((movie) => (
            <div
              key={movie.id}
              onClick={() =>
                handleChoice(
                  movie,
                  currentPair.find((m) => m.id !== movie.id)
                )
              }
              className="bg-background border border-secondary rounded-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden border border-secondary mb-4">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-lg mb-2 text-center">
                {movie.title}
              </h3>
              <p className="text-text-secondary text-center">{movie.year}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EloRankingPage;
