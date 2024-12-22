import { ArrowDown, ArrowUp, Download, Share2 } from "lucide-react";
import React, { useState } from "react";

const RankingResultsPage = ({ movies, onStartOver }) => {
  const [sortOrder, setSortOrder] = useState("desc");

  const sortedMovies = [...movies].sort((a, b) => {
    return sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
  });

  const exportRankings = () => {
    const rankingsText = sortedMovies
      .map((movie, index) => `${index + 1}. ${movie.title} (${movie.year})`)
      .join("\n");

    const blob = new Blob([rankingsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "movie-rankings.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Your Ranked Movie List</h2>
        <p className="text-text-secondary">
          Here are your movies ranked according to your preferences
        </p>
      </div>

      <div className="flex justify-between items-center">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-button-hover transition-colors"
          onClick={() =>
            setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
          }
        >
          Sort{" "}
          {sortOrder === "desc" ? (
            <ArrowDown className="w-4 h-4" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </button>

        <div className="space-x-4">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-button-hover transition-colors"
            onClick={onStartOver}
          >
            Start Over
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg hover:bg-button-hover transition-colors"
            onClick={exportRankings}
          >
            <Download className="w-4 h-4" />
            Export List
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="bg-background border border-secondary rounded-lg p-4 flex items-center gap-4"
          >
            <div className="font-bold text-2xl text-text-secondary w-8">
              {index + 1}
            </div>
            <div className="w-16 h-24 flex-shrink-0">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold">{movie.title}</h3>
              <p className="text-text-secondary">{movie.year}</p>
            </div>
            <div className="text-text-secondary text-sm">
              Rating: {Math.round(movie.rating)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingResultsPage;
