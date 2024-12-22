import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SavedListsPage = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/lists", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch lists");
      }

      const data = await response.json();
      setLists(data);
    } catch (err) {
      setError("Failed to load lists. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const viewFullList = async (listId) => {
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch list details");
      }

      const data = await response.json();
      setSelectedList(data);
    } catch (err) {
      setError("Failed to load list details. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">Loading lists...</div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (selectedList) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{selectedList.name}</h2>
          <button
            className="px-4 py-2 bg-secondary rounded-lg hover:bg-button-hover transition-colors"
            onClick={() => setSelectedList(null)}
          >
            Back to Lists
          </button>
        </div>
        <div className="space-y-4">
          {selectedList.movies.map((movie) => (
            <div
              key={movie.movieId}
              className="bg-background border border-secondary rounded-lg p-4 flex items-center gap-4"
            >
              <div className="font-bold text-2xl text-text-secondary w-8">
                {movie.rank}
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
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Your Saved Lists</h2>
        <button
          className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-button-hover transition-colors"
          onClick={() => navigate("/")}
        >
          Create New List
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center text-text-secondary">
          You haven't created any lists yet.
        </div>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <div
              key={list._id}
              className="bg-background border border-secondary rounded-lg p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{list.name}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-text-secondary">
                    {new Date(list.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-button-hover transition-colors"
                    onClick={() => viewFullList(list._id)}
                  >
                    View Full List
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {list.movies.slice(0, 5).map((movie) => (
                  <div
                    key={movie.movieId}
                    className="flex items-center gap-2 bg-secondary rounded-lg p-2"
                  >
                    <span className="text-sm font-bold">#{movie.rank}</span>
                    <span>{movie.title}</span>
                  </div>
                ))}
                {list.movies.length > 5 && (
                  <div className="flex items-center bg-secondary rounded-lg p-2">
                    <span className="text-sm">
                      +{list.movies.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedListsPage;
