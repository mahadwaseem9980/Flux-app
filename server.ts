import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database setup (Offline-first feel)
  const db = new Database("lumina.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      title TEXT,
      author TEXT,
      cover_url TEXT,
      content TEXT,
      category TEXT,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      story_id TEXT,
      user_name TEXT,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(story_id) REFERENCES stories(id)
    );
  `);

  // Initial Data
  const count = db.prepare("SELECT COUNT(*) as count FROM stories").get() as { count: number };
  if (count.count === 0) {
    const stories = [
      {
        id: '1',
        title: 'The Echoes of Starlight',
        author: 'Aria Vance',
        cover_url: 'https://picsum.photos/seed/star/400/600',
        content: 'The stars didn\'t just shine; they whispered. Elara had spent her whole life listening to the faint hum of the cosmos, a melody only she could hear...',
        category: 'Sci-Fi'
      },
      {
        id: '2',
        title: 'Midnight in Kyoto',
        author: 'Kenji Sato',
        cover_url: 'https://picsum.photos/seed/kyoto/400/600',
        content: 'The rain in Kyoto had a rhythm, a soft tapping on the paper screens that felt like a secret code. In the heart of Gion, a small tea house held a mystery...',
        category: 'Mystery'
      }
    ];
    const insert = db.prepare("INSERT INTO stories (id, title, author, cover_url, content, category) VALUES (?, ?, ?, ?, ?, ?)");
    stories.forEach(s => insert.run(s.id, s.title, s.author, s.cover_url, s.content, s.category));
  }

  app.use(express.json());

  // API Routes
  app.get("/api/stories", (req, res) => {
    const stories = db.prepare("SELECT * FROM stories ORDER BY created_at DESC").all();
    res.json(stories);
  });

  app.get("/api/stories/:id", (req, res) => {
    const story = db.prepare("SELECT * FROM stories WHERE id = ?").get(req.params.id);
    if (story) {
      res.json(story);
    } else {
      res.status(404).json({ error: "Story not found" });
    }
  });

  app.post("/api/comments", (req, res) => {
    const { story_id, user_name, content } = req.body;
    const id = Math.random().toString(36).substring(7);
    db.prepare("INSERT INTO comments (id, story_id, user_name, content) VALUES (?, ?, ?, ?)").run(id, story_id, user_name, content);
    res.json({ success: true, id });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
