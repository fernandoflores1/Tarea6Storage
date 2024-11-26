import { INDEXDB_NAME, INDEXDB_VERSION, NOTES_TABLE } from "./constants.js";

export class DatabaseManager {
  constructor() {
    this.db = null; // Database instance
  }

  // Singleton pattern to ensure only one database instance exists
  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseManager();
    }
    return this.instance;
  }

  // Opens the IndexedDB connection and creates the store if needed
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXDB_NAME, INDEXDB_VERSION);
      
      // Handle database errors
      request.onerror = (event) => reject(event.target.error);
      
      // Store database reference when successfully opened
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      
      // Create/update database structure when version changes
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(NOTES_TABLE)) {
          db.createObjectStore(NOTES_TABLE, { keyPath: "id" });
        }
      };
    });
  }

  // Save or update a note in the database
  async saveNote(noteData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTES_TABLE], "readwrite");
      const store = transaction.objectStore(NOTES_TABLE);
      const request = store.put(noteData);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Retrieve all notes from the database
  async getAllNotes() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTES_TABLE], "readonly");
      const store = transaction.objectStore(NOTES_TABLE);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete a note from the database
  async deleteNote(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTES_TABLE], "readwrite");
      const store = transaction.objectStore(NOTES_TABLE);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}