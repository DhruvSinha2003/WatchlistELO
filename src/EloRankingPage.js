import React, { useEffect, useState } from "react";

const K_FACTOR = 32;
const RATING_DIFFERENCE_SCALE = 400;

const calculateExpectedScore = (ratingA, ratingB) => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / RATING_DIFFERENCE_SCALE));
};

const calculateNewRating = (rating, expectedScore, actualScore) => {
  return Math.round(rating + K_FACTOR * (actualScore - expectedScore));
};

const createPairKey = (movieA, movieB) => {
  const ids = [movieA.id, movieB.id].sort();
  return ids.join("-");
};

const EloRankingPage = ({ movies = [], onRankingComplete }) => {
  const [rankedMovies, setRankedMovies] = useState(() =>
    movies.map((movie) => ({
      ...movie,
      rating: 1400,
      matches: 0,
    }))
  );

  const [currentPair, setCurrentPair] = useState([]);
  const [progress, setProgress] = useState(0);
  const [comparedPairs, setComparedPairs] = useState(new Set());

  const totalComparisons = Math.ceil((movies.length * (movies.length - 1)) / 2);
  useEffect(() => {
    if (rankedMovies.length >= 2) {
      selectNewPair();
    }
  }, [rankedMovies]);

  const selectNewPair = () => {
    const availablePairs = [];

    for (let i = 0; i < rankedMovies.length; i++) {
      for (let j = i + 1; j < rankedMovies.length; j++) {
        const pairKey = createPairKey(rankedMovies[i], rankedMovies[j]);
        if (!comparedPairs.has(pairKey)) {
          availablePairs.push([rankedMovies[i], rankedMovies[j]]);
        }
      }
    }

    if (availablePairs.length === 0) {
      const sortedMovies = [...rankedMovies].sort(
        (a, b) => b.rating - a.rating
      );
      onRankingComplete?.(sortedMovies);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availablePairs.length);
    const selectedPair = availablePairs[randomIndex];

    if (Math.random() < 0.5) {
      selectedPair.reverse();
    }

    setCurrentPair(selectedPair);
  };

  const handleChoice = (winner, loser) => {
    const pairKey = createPairKey(winner, loser);
    setComparedPairs((prev) => new Set([...prev, pairKey]));

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

    const newProgress = (comparedPairs.size + 1) / totalComparisons;
    setProgress(Math.min(newProgress, 1));

    if (comparedPairs.size + 1 >= totalComparisons) {
      const sortedMovies = [...updatedMovies].sort(
        (a, b) => b.rating - a.rating
      );
      onRankingComplete?.(sortedMovies);
    } else {
      selectNewPair();
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="text-center space-y-2 p-4">
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
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="grid grid-cols-2 gap-4 p-4 w-full max-w-3xl h-full max-h-full">
            {currentPair.map((movie) => (
              <div
                key={movie.id}
                onClick={() =>
                  handleChoice(
                    movie,
                    currentPair.find((m) => m.id !== movie.id)
                  )
                }
                className="flex flex-col h-full bg-background border border-secondary rounded-lg p-3 cursor-pointer transform transition-transform hover:scale-105"
              >
                <div className="relative flex-1 min-h-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full max-h-full rounded-lg overflow-hidden border border-secondary">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-bold text-lg text-center line-clamp-1">
                    {movie.title}
                  </h3>
                  <p className="text-text-secondary text-center">
                    {movie.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EloRankingPage;
