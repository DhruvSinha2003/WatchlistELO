import { Search, X } from "lucide-react";
import React, { useState } from "react";

require("dotenv").config();

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchMovies = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}&include_adult=false`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error searching movies:", error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 3) {
      searchMovies(query);
    } else {
      setSearchResults([]);
    }
  };

  const addMovie = (movie) => {
    if (
      !selectedMovies.find((m) => m.id === movie.id) &&
      selectedMovies.length < 20
    ) {
      setSelectedMovies([
        ...selectedMovies,
        {
          id: movie.id,
          title: movie.title,
          year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
          poster: movie.poster_path
            ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
            : "/api/placeholder/200/300",
        },
      ]);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const removeMovie = (movieId) => {
    setSelectedMovies(selectedMovies.filter((m) => m.id !== movieId));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <h2
          className="text-xl font-bold text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Create Your Movie List
        </h2>
        <p className="text-text-secondary">
          Add at least 4 movies to start ranking (maximum 20)
        </p>
      </div>

      {/* Search Section */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for movies..."
            className="w-full px-10 py-3 bg-background border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ fontFamily: "var(--font-body)" }}
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-text-secondary" />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && searchQuery && (
          <div className="absolute z-10 w-full mt-2 bg-background border border-secondary rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                className="p-3 hover:bg-secondary cursor-pointer flex items-center gap-3 border-b border-secondary last:border-b-0"
                onClick={() => addMovie(movie)}
              >
                {movie.poster_path ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-16 bg-text-secondary rounded flex items-center justify-center text-background">
                    No Image
                  </div>
                )}
                <div>
                  <div className="font-semibold">{movie.title}</div>
                  <div className="text-sm text-text-secondary">
                    {movie.release_date
                      ? movie.release_date.split("-")[0]
                      : "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {selectedMovies.map((movie) => (
          <div key={movie.id} className="relative group">
            <div className="aspect-[2/3] rounded-lg overflow-hidden border border-secondary">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => removeMovie(movie.id)}
              className="absolute top-2 right-2 p-1 bg-text rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-background" />
            </button>
            <div className="mt-2 text-center">
              <div className="font-semibold truncate">{movie.title}</div>
              <div className="text-sm text-text-secondary">{movie.year}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Start Button */}
      {selectedMovies.length >= 4 && (
        <div className="text-center">
          <button
            className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-button-hover transition-colors"
            onClick={() => console.log("Start ranking")}
          >
            Start Ranking ({selectedMovies.length} movies)
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
