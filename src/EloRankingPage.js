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
