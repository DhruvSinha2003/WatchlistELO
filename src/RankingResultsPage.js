import { ArrowDown, ArrowUp, Download, Save } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RankingResultsPage = ({ movies, onStartOver }) => {
  const [sortOrder, setSortOrder] = useState("desc");
  const [listName, setListName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sortedMovies = [...movies].sort((a, b) => {
    return sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
  });

  const saveList = async () => {
    if (!listName.trim()) {
      setError("Please enter a name for your list");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: listName,
          movies: sortedMovies,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save list");
      }

      navigate("/lists");
    } catch (err) {
      setError("Failed to save list. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter a name for your list"
            className="px-4 py-2 bg-background border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="flex justify-between items-center gap-4">
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

          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-button-hover transition-colors"
              onClick={onStartOver}
            >
              Start Over
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-button-hover transition-colors"
              onClick={exportRankings}
            >
              <Download className="w-4 h-4" />
              Export List
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg hover:bg-button-hover transition-colors disabled:opacity-50"
              onClick={saveList}
              disabled={isSaving}
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save List"}
            </button>
          </div>
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
