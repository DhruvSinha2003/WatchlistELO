import React, { useEffect, useState } from "react";

const K_FACTOR = 32;
const RATING_DIFFERENCE_SCALE = 400;
const CONFIDENCE_THRESHOLD = 0.85;
const MIN_MATCHES_PER_ITEM = 3;
const RATING_CERTAINTY_THRESHOLD = 100;
const SMALL_COLLECTION_THRESHOLD = 10;

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

const calculateUncertainty = (movie, allMovies) => {
  if (movie.matches < MIN_MATCHES_PER_ITEM) return 1;

  const ratingDiffs = allMovies
    .filter((m) => m.id !== movie.id)
    .map((m) => Math.abs(movie.rating - m.rating));

  const avgRatingDiff =
    ratingDiffs.reduce((a, b) => a + b, 0) / ratingDiffs.length;
  return Math.min(1, RATING_CERTAINTY_THRESHOLD / avgRatingDiff);
};

const calculateSystemConfidence = (movies) => {
  const uncertainties = movies.map((movie) =>
    calculateUncertainty(movie, movies)
  );
  return 1 - uncertainties.reduce((a, b) => a + b, 0) / movies.length;
};

const getAllPossiblePairs = (movies) => {
  const pairs = [];
  for (let i = 0; i < movies.length; i++) {
    for (let j = i + 1; j < movies.length; j++) {
      pairs.push([movies[i], movies[j]]);
    }
  }
  return pairs;
};

const getOptimalNextPair = (rankedMovies, comparedPairs, isSmallCollection) => {
  if (isSmallCollection) {
    // For small collections, get all possible pairs that haven't been compared
    const allPairs = getAllPossiblePairs(rankedMovies);
    const remainingPairs = allPairs.filter(
      ([movieA, movieB]) => !comparedPairs.has(createPairKey(movieA, movieB))
    );
    if (remainingPairs.length === 0) return null;
    return remainingPairs[Math.floor(Math.random() * remainingPairs.length)];
  }

  // For larger collections, use the selective matching strategy
  const moviesByUncertainty = [...rankedMovies].sort(
    (a, b) =>
      calculateUncertainty(b, rankedMovies) -
      calculateUncertainty(a, rankedMovies)
  );

  const candidatePairs = [];
  const topUncertainMovies = moviesByUncertainty.slice(
    0,
    Math.ceil(rankedMovies.length * 0.3)
  );

  for (const movieA of topUncertainMovies) {
    const potentialOpponents = rankedMovies
      .filter((movieB) => {
        if (movieB.id === movieA.id) return false;
        const pairKey = createPairKey(movieA, movieB);
        if (comparedPairs.has(pairKey)) return false;

        const ratingDiff = Math.abs(movieA.rating - movieB.rating);
        return ratingDiff < RATING_DIFFERENCE_SCALE;
      })
      .sort(
        (a, b) =>
          Math.abs(a.rating - movieA.rating) -
          Math.abs(b.rating - movieA.rating)
      );

    if (potentialOpponents.length > 0) {
      candidatePairs.push([movieA, potentialOpponents[0]]);
    }
  }

  if (candidatePairs.length === 0) return null;
  return candidatePairs[Math.floor(Math.random() * candidatePairs.length)];
};

const getTargetComparisons = (movieCount) => {
  if (movieCount <= SMALL_COLLECTION_THRESHOLD) {
    // For small collections, compare all possible pairs
    return (movieCount * (movieCount - 1)) / 2;
  }
  if (movieCount <= 20) return 80;
  if (movieCount <= 50) return 150;
  return 250;
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

  const isSmallCollection = movies.length <= SMALL_COLLECTION_THRESHOLD;
  const targetComparisons = getTargetComparisons(movies.length);

  useEffect(() => {
    if (rankedMovies.length >= 2) {
      selectNewPair();
    }
  }, [rankedMovies]);

  const selectNewPair = () => {
    const systemConfidence = calculateSystemConfidence(rankedMovies);
    const hasReachedTargetComparisons = comparedPairs.size >= targetComparisons;
    const minMatchesReached = rankedMovies.every(
      (m) => m.matches >= MIN_MATCHES_PER_ITEM
    );

    if (
      (systemConfidence >= CONFIDENCE_THRESHOLD && minMatchesReached) ||
      hasReachedTargetComparisons
    ) {
      const sortedMovies = [...rankedMovies].sort(
        (a, b) => b.rating - a.rating
      );
      onRankingComplete?.(sortedMovies);
      return;
    }

    const nextPair = getOptimalNextPair(
      rankedMovies,
      comparedPairs,
      isSmallCollection
    );
    if (!nextPair) {
      const sortedMovies = [...rankedMovies].sort(
        (a, b) => b.rating - a.rating
      );
      onRankingComplete?.(sortedMovies);
      return;
    }

    if (Math.random() < 0.5) {
      nextPair.reverse();
    }

    setCurrentPair(nextPair);
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
        return {
          ...movie,
          rating: newLoserRating,
          matches: movie.matches + 1,
        };
      }
      return movie;
    });

    setRankedMovies(updatedMovies);
    setProgress(Math.min(comparedPairs.size / targetComparisons, 1));
    selectNewPair();
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
