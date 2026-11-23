
import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = process.env.PORT || 7000;

// MongoDB Atlas connection
const mongoUrl = process.env.MONGO_URI;
const databaseName = "library_db";

if (!mongoUrl) {
  console.error("MONGO_URI environment variable is missing");
  process.exit(1);
}

const client = new MongoClient(mongoUrl);

let db;

// Connect to MongoDB
try {
  await client.connect();
  db = client.db(databaseName);
  console.log("Connected to MongoDB Atlas successfully");
} catch (err) {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CREATE a new book
app.post("/api/v1/books", async (req, res) => {
  try {
    const { title, author, category, price } = req.body;

    if (!title || !author || !category || price == null) {
      return res.status(400).json({
        message: "All book fields are required",
      });
    }

    const result = await db.collection("books").insertOne({
      title,
      author,
      category,
      price,
    });

    res.status(201).json({
      message: "Book created successfully",
      data: {
        _id: result.insertedId,
        title,
        author,
        category,
        price,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all books or books by category
app.get("/api/v1/books", async (req, res) => {
  try {
    const category = req.query.category;
    const query = category ? { category } : {};

    const books = await db.collection("books").find(query).toArray();

    res.status(200).json({
      message: "Books fetched successfully",
      data: books,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single book by ID
app.get("/api/v1/books/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await db.collection("books").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book fetched successfully",
      data: book,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a book by ID
app.put("/api/v1/books/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const { title, author, category, price } = req.body;

    if (!title || !author || !category || price == null) {
      return res.status(400).json({
        message: "All book fields are required",
      });
    }

    const book = { title, author, category, price };

    const result = await db.collection("books").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: book }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book updated successfully",
      data: { _id: new ObjectId(req.params.id), ...book },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a book by ID
app.delete("/api/v1/books/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const result = await db.collection("books").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
