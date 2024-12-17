const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const filesDir = path.join(__dirname, 'files');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Ensure the files directory exists
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

// Route: Display tasks and their details
app.get('/', (req, res) => {
  fs.readdir(filesDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).send("Error reading files.");
    }

    // Fetch file contents
    const tasks = files.map((file) => {
      const filePath = path.join(filesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8'); // Read file synchronously
      return { name: file, details: content };
    });

    res.render('index', { tasks });
  });
});

// Route: Create a new task
app.post('/create', (req, res) => {
  const { title, details } = req.body;

  if (!title || !details) {
    return res.status(400).send("Title and Details are required.");
  }

  const sanitizedTitle = title.split(' ').join(''); // Remove spaces
  const filePath = path.join(filesDir, `${sanitizedTitle}.txt`);

  fs.writeFile(filePath, details, (err) => {
    if (err) {
      console.error("Error creating file:", err);
      return res.status(500).send("Error creating file.");
    }
    res.redirect('/');
  });
});

// Route: Delete a task
app.post('/delete/:name', (req, res) => {
  const filePath = path.join(filesDir, req.params.name);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).send("Error deleting task.");
    }
    res.redirect('/');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
