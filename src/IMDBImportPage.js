import { AlertCircle, Upload } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const IMDBImportPage = ({ onMoviesImported }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [totalMovies, setTotalMovies] = useState(0);
  const [processedMovies, setProcessedMovies] = useState(0);
  const [unmatchedMovies, setUnmatchedMovies] = useState([]);

  const processCSV = async (file) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setUnmatchedMovies([]);

    try {
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",");

      // Find required column indices
      const titleIndex = headers.indexOf("Title");
      const yearIndex = headers.indexOf("Year");
      const titleTypeIndex = headers.indexOf("Title Type");

      if (titleIndex === -1) {
        throw new Error("Invalid IMDB CSV format: Missing Title column");
      }

      // Filter out header and empty lines, and only keep movies
      const movieLines = lines.slice(1).filter((line) => {
        const columns = line.split(",");
        return (
          line.trim() &&
          (!titleTypeIndex ||
            columns[titleTypeIndex].toLowerCase().includes("movie"))
        );
      });

      console.log(`Total movies found in CSV: ${movieLines.length}`);
      setTotalMovies(movieLines.length);
      const movies = [];
      const unmatched = [];

      for (let i = 0; i < movieLines.length; i++) {
        const columns = movieLines[i].split(",");
        const title = columns[titleIndex].replace(/"/g, "").trim();
        const year =
          yearIndex !== -1 ? columns[yearIndex].replace(/"/g, "").trim() : "";

        if (title) {
          try {
            const searchQuery = year ? `${title} ${year}` : title;

            const searchResponse = await fetch(
              `https://api.themoviedb.org/3/search/movie?api_key=${
                process.env.REACT_APP_TMDB_API_KEY
              }&query=${encodeURIComponent(searchQuery)}&include_adult=false${
                year ? `&year=${year}` : ""
              }`
            );

            if (!searchResponse.ok) {
              throw new Error(`TMDB API error: ${searchResponse.status}`);
            }

            const searchData = await searchResponse.json();

            if (searchData.results && searchData.results[0]) {
              const movie = searchData.results[0];
              movies.push({
                id: movie.id,
                title: movie.title,
                year: movie.release_date
                  ? movie.release_date.split("-")[0]
                  : year,
                poster: movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/api/placeholder/200/300",
              });
              console.log(`✓ Matched: ${title} (${year})`);
            } else {
              console.log(`✗ No match: ${title} (${year})`);
              unmatched.push({ title, year });
            }
          } catch (error) {
            console.error(`Error processing movie "${title}":`, error);
            unmatched.push({ title, year });
          }
        }

        setProcessedMovies(i + 1);
        setProgress(((i + 1) / movieLines.length) * 100);

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      setUnmatchedMovies(unmatched);
      console.log(
        `Matched ${movies.length} out of ${movieLines.length} movies`
      );
      console.log("Unmatched movies:", unmatched);

      if (movies.length === 0) {
        throw new Error("No movies were found in the TMDB database");
      }

      onMoviesImported(movies);
    } catch (error) {
      setError(error.message);
      console.error("Error processing CSV:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      processCSV(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
    disabled: isProcessing,
  });

  const goBack = () => {
    if (!isProcessing) {
      onMoviesImported([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Import Movies from IMDB</h2>

        <button
          onClick={goBack}
          disabled={isProcessing}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isProcessing
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-secondary hover:bg-secondary-hover"
          }`}
        >
          Back to Movie List
        </button>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div className="space-y-1">
              <p>
                Fetching details for a large list of movies may take several
                minutes. Please be patient during the import process.
              </p>
              <p className="text-sm">
                Note: Only movies that can be found in the TMDB database will be
                imported.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "border-secondary"}
          ${
            isProcessing
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-primary"
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 mb-4 text-text-secondary" />
        <p className="text-lg mb-2">
          {isDragActive
            ? "Drop the IMDB CSV file here"
            : "Drag and drop your IMDB CSV file here"}
        </p>
        <p className="text-sm text-text-secondary">or click to browse files</p>
      </div>

      {isProcessing && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-text-secondary">
              Processing: {Math.round(progress)}% ({processedMovies} of{" "}
              {totalMovies} movies)
            </p>
          </div>
          <p className="text-center text-sm text-text-secondary">
            This process may take several minutes. Please don't close the
            window.
          </p>
        </div>
      )}

      {unmatchedMovies.length > 0 && !isProcessing && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p className="font-semibold mb-2">
            Some movies couldn't be found in TMDB:
          </p>
          <div className="max-h-40 overflow-y-auto">
            {unmatchedMovies.map((movie, index) => (
              <p key={index} className="text-sm">
                • {movie.title} {movie.year ? `(${movie.year})` : ""}
              </p>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default IMDBImportPage;
