import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import generateUniqueId from 'generate-unique-id';


const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    let notes = [];
    try {
        notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
    } catch (err) {
        notes = []; // fallback if file missing or broken
    }
    res.render('index', {notes});
});


app.get('/createNote', (req, res) => {
    res.render('createNote');
});
app.get('/cancel', (req, res) => {
    res.render('index');
});


app.post('/save', (req, res) => {
    const newNote = {
      title: req.body.title,
      content: req.body.content,
      id: generateUniqueId({
        length: 32,
        useLetters: true,
        useNumbers: true
      })
    };
  
    // Load existing notes
    let notes = [];
    try {
      notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
    } catch (err) {
      // If file doesn't exist or is empty, start fresh
      notes = [];
    }
  
    // Add the new note
    notes.push(newNote);
  
    // Save back to the file
    fs.writeFileSync('notes.json', JSON.stringify(notes, null, 2));
  
    res.redirect('/'); // or wherever you want to go after saving
  });

app.get('/clickedCard/id', (req, res) => {
    const noteId = req.params.id;
    const notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
    const note = notes.find(n => n.id === noteId);

    if (!note) return res.status(404).send('Note not found');

    res.render('/createNote', { note });
  });


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});