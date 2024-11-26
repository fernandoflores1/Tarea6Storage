import { DatabaseManager } from './indexedDB.js';

const colorInput = document.querySelector("#noteColor");
const addButton = document.querySelector("#addButton");
const mainElement = document.querySelector("main");

let counterID = 0;
let counterZindex = 1;
const dbManager = DatabaseManager.getInstance();

async function init() {
  await dbManager.open();
  await loadSavedNotes();
}

async function loadSavedNotes() {
  const notes = await dbManager.getAllNotes();
  notes.forEach(noteData => createNoteFromData(noteData));
  
  // Update counters based on existing notes
  if (notes.length > 0) {
    counterID = Math.max(...notes.map(note => parseInt(note.id.split('-')[1]))) + 1;
    counterZindex = Math.max(...notes.map(note => note.zIndex)) + 1;
  }
}

function createNoteFromData(noteData) {
  let newNote = document.createElement("div");
  newNote.classList.add("note");
  newNote.id = noteData.id;
  
  // Set position and z-index
  newNote.style.left = noteData.x + "px";
  newNote.style.top = noteData.y + "px";
  newNote.style.zIndex = noteData.zIndex;

  // Create note header with delete button
  let noteHeader = document.createElement("div");
  noteHeader.classList.add("noteHeader");
  noteHeader.innerHTML = `<button class="delete">X</button>`;
  noteHeader.style.background = noteData.color;
  newNote.append(noteHeader);

  // Create note content with textarea
  let noteContent = document.createElement("div");
  noteContent.classList.add("noteContent");
  noteContent.innerHTML = `<textarea name="noteText" id="noteText">${noteData.text}</textarea>`;
  newNote.append(noteContent);

  mainElement.appendChild(newNote);
}

async function saveNoteData(noteElement) {
  const noteData = {
    id: noteElement.id,
    x: parseInt(noteElement.style.left) || 0,
    y: parseInt(noteElement.style.top) || 0,
    zIndex: parseInt(noteElement.style.zIndex) || 1,
    color: noteElement.querySelector('.noteHeader').style.background,
    text: noteElement.querySelector('textarea').value
  };
  await dbManager.saveNote(noteData);
}

// Create new note
addButton.addEventListener("click", async () => {
  let newNote = document.createElement("div");
  const noteId = "note-" + counterID;
  newNote.classList.add("note");
  newNote.id = noteId;

  // Create note structure
  let noteHeader = document.createElement("div");
  noteHeader.classList.add("noteHeader");
  noteHeader.innerHTML = `<button class="delete">X</button>`;
  newNote.append(noteHeader);

  let noteContent = document.createElement("div");
  noteContent.classList.add("noteContent");
  noteContent.innerHTML = `<textarea name="noteText" id="noteText"></textarea>`;
  newNote.append(noteContent);

  noteHeader.style.background = colorInput.value;

  mainElement.appendChild(newNote);
  counterID++;

  
  await saveNoteData(newNote);
});

// Delete note
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("delete")) {
    const note = event.target.closest(".note");
    await dbManager.deleteNote(note.id);
    note.remove();
  }
});

// Drag and drop functionality
let cursor = { x: null, y: null };
let note = { dom: null, x: null, y: null };

// Start dragging
document.addEventListener("mousedown", (event) => {
  if (event.target.classList.contains("noteHeader")) {
    cursor = {
      x: event.clientX,
      y: event.clientY,
    };

    let current = event.target.closest(".note");
    note = {
      dom: current,
      x: parseInt(current.style.left) || 0,
      y: parseInt(current.style.top) || 0,
    };
    current.style.cursor = "grabbing";
    current.style.zIndex = counterZindex++;
  }
});

// During drag
document.addEventListener("mousemove", (event) => {
  if (note.dom == null) return;
  
  let currentCursor = {
    x: event.clientX,
    y: event.clientY,
  };

  let distance = {
    x: currentCursor.x - cursor.x,
    y: currentCursor.y - cursor.y,
  };

  note.dom.style.left = (note.x + distance.x) + "px";
  note.dom.style.top = (note.y + distance.y) + "px";
});

// End dragging
document.addEventListener("mouseup", async (event) => {
  if (note.dom) {
    await saveNoteData(note.dom);
    note.dom = null;
  }
});

// Save note content when typing
document.addEventListener("input", async (event) => {
  if (event.target.matches('textarea')) {
    const noteElement = event.target.closest('.note');
    await saveNoteData(noteElement);
  }
});

// Initialize the application
init();