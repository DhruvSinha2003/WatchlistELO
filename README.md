# Movie Ranker

A web application that helps you create ranked lists of movies using the Elo rating system.

## Tech Stack

- React
- Tailwind CSS
- TMDB API for movie data

## Features

### Movie Selection

- Search and add movies using TMDB database
- Import movies from IMDB watchlist CSV exports
- Image previews and basic movie info display

### Ranking System

Uses Elo rating system with the following parameters:

- Starting rating: 1400
- K-factor: 32
- Rating difference scale: 400
- Expected score formula: `1 / (1 + 10^((rating B - rating A) / 400))`
- New rating formula: `rating + K * (actualScore - expectedScore)`
- Confidence threshold of 85%
- Automatic pair selection optimized for uncertain ratings
- Dynamic comparison count based on collection size
  - For ≤10 movies: All possible pairs
  - 11-20 movies: 80 comparisons
  - 21-50 movies: 150 comparisons
  - 50 or more movies: 250 comparisons

### Additional Features

- Multiple theme support
- Font options
- Export rankings to text file
- Automatic movie details fetching when using IMDB csv files

## Installation

1. Clone the repository:

```bash
git clone https://github.com/DhruvSinha2003/WatchlistELO
cd WatchlistELO
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your TMDB API key:

```
REACT_APP_TMDB_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm start
```

## Required Environment Variables

- `REACT_APP_TMDB_API_KEY`: Your TMDB API key (get one at https://www.themoviedb.org/settings/api)

## Usage

1. Start by adding movies through the search function or import from IMDB
2. Once you have at least 4 movies, click "Start Ranking"
3. Choose your preferred movie in each pair
4. View your final ranked list when complete
5. Export rankings or start over as needed
