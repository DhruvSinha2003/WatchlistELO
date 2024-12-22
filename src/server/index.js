const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Movie List Schema
const movieListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  movies: [
    {
      movieId: String,
      title: String,
      year: String,
      poster: String,
      rating: Number,
      rank: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MovieList = mongoose.model("MovieList", movieListSchema);

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Auth routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Movie list routes
app.post("/api/lists", authenticateToken, async (req, res) => {
  try {
    const { name, movies } = req.body;

    const movieList = new MovieList({
      userId: req.user.id,
      name,
      movies: movies.map((movie, index) => ({
        ...movie,
        rank: index + 1,
      })),
    });

    await movieList.save();
    res
      .status(201)
      .json({ message: "List saved successfully", listId: movieList._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/lists", authenticateToken, async (req, res) => {
  try {
    const lists = await MovieList.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/lists/:id", authenticateToken, async (req, res) => {
  try {
    const list = await MovieList.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
