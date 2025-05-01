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

function todayDate() {
  const date = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}
// Routes
app.get('/', (req, res) => {
  let notes = [];
  try {
    notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
  } catch (err) {
    notes = []; // fallback if file missing or broken
  }
  res.render('index', { notes });
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
    date: todayDate(),
    id: generateUniqueId({
      length: 32,
      useLetters: true,
      useNumbers: true,
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

app.get('/clickedCard/:id', (req, res) => {
  const notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
  const note = notes.find((n) => n.id === req.params.id); // Get the note using the ID from the URL

  if (!note) {
    console.log('Note not found for ID:', req.params.id);
    return res.status(404).send('Note not found');
  }

  // console.log('Note found:', note); // Check entire object
  res.render('createNote', { note });
});

app.post('/saveEditedNote', (req, res) => {
  const { id, title, content,date, action } = req.body;

  if(action ==='save'){
    const updatedNote = {
      title: req.body.title,
      content: req.body.content,
      id: req.body.id,
      date: req.body.date // You can now access the ID
    };
    
    console.log(updatedNote); // Check if the ID is coming through
    let notes = [];
    let noteIndex = -1; // Initialize noteIndex to -1
    try{
      notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
      noteIndex = notes.findIndex((n) => n.id === updatedNote.id); // Find the index of the note to update
    }catch (err) {
      notes = []; // fallback if file missing or broken
    }
  
     // Find and update the note
     if (noteIndex !== -1) {
       notes[noteIndex] = updatedNote; // Update the note in the array
       fs.writeFileSync('notes.json', JSON.stringify(notes, null, 2)); // Save back to the file
     }
    // Add your logic to save or update the note
    res.redirect('/'); // Or render another view
  }else if(action==='delete'){
    const noteId = req.body.id; 
    let notes = [];
    try {
      notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8')); 
    } catch (err) {
      notes = [];  // Fallback if the file is missing or broken
    }

    // Filter out the note to delete
    notes = notes.filter(note => note.id !== noteId);

    // Save the updated notes back to the file
    fs.writeFileSync('notes.json', JSON.stringify(notes, null, 2));

    // res.sendStatus(200);  // Send a success status
    res.redirect('/'); // Redirect to the main page
    };
});
app.get('/credits', (req, res) => {
  res.render('credits');
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
