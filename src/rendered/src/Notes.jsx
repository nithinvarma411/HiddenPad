import React, { useState, useEffect } from 'react'

function Notes() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false); // Start as opaque

  // Fetch notes titles from backend
  useEffect(() => {
    const fetchTitles = async () => {
      const deviceId = window.electronAPI?.getDeviceId?.();
      
      if (!deviceId) return; // Optionally handle missing deviceId
      const res = await fetch('http://localhost:3894/api/v1/notes/gettitle', {
        headers: { 'x-device-id': deviceId }
      });
      const data = await res.json();
      console.log("Fetched titles response:", data); // Debug log
      if (data.titles) {
        // Ensure notes is an array of objects with a title property
        const titlesArray = Array.isArray(data.titles)
          ? data.titles.map(t =>
              typeof t === "string"
                ? { title: t }
                : t
            )
          : [];
        setNotes(titlesArray);
        // Do NOT setActiveNote here
      }
    };    
    fetchTitles();
  }, []);

  useEffect(() => {
    // Get initial transparency state
    window.electronAPI?.getTransparency?.().then((val) => {
      // If the backend says true, set transparent, else opaque
      setIsTransparent(!!val);
    });
    // Listen for changes
    window.electronAPI?.onTransparencyChanged?.((val) => {
      setIsTransparent(!!val);
    });
  }, []);

  const addNewNote = () => {
    setShowTitleModal(true);
    setNewTitle('');
  };

  const handleTitleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const deviceId = window.electronAPI?.getDeviceId?.();
    
    if (!deviceId) return; // Optionally handle missing deviceId
    const res = await fetch('http://localhost:3894/api/v1/notes/addtitle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId
      },
      body: JSON.stringify({ title: newTitle })
    });
    if (res.ok) {
      // Refresh notes list
      const titlesRes = await fetch('http://localhost:3894/api/v1/notes/gettitle', {
        headers: { 'x-device-id': deviceId }
      });
      const data = await titlesRes.json();
      if (data.titles) {
        setNotes(data.titles);
        setActiveNote({ title: newTitle });
        setNoteContent('');
      }
      setShowTitleModal(false);
    } else {
      // Optionally handle error
      setShowTitleModal(false);
    }
  };

  const selectNote = async (note) => {
    setActiveNote(note);
    setNoteContent(''); // Clear while loading
    const deviceId = window.electronAPI?.getDeviceId?.();
    if (!deviceId || !note.title) return;
    try {
      const res = await fetch(
        `http://localhost:3894/api/v1/notes/getnote?title=${encodeURIComponent(note.title)}`,
        {
          headers: { 'x-device-id': deviceId }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setNoteContent(data.note?.notes || '');
      } else {
        setNoteContent('');
      }
    } catch {
      setNoteContent('');
    }
  };

  const updateNoteContent = (content) => {
    setNoteContent(content);
    // Optionally, implement saving notes to backend here
  };

  const deleteActiveNote = async () => {
    if (!activeNote || !activeNote.title) return;
    if (!window.confirm(`Delete note "${activeNote.title}"?`)) return;
    setIsDeleting(true);
    const deviceId = window.electronAPI?.getDeviceId?.();
    if (!deviceId) {
      setIsDeleting(false);
      return;
    }
    await fetch(
      `http://localhost:3894/api/v1/notes/deletenote?title=${encodeURIComponent(activeNote.title)}`,
      {
        method: 'DELETE',
        headers: { 'x-device-id': deviceId }
      }
    );
    // Refresh notes list
    const res = await fetch('http://localhost:3894/api/v1/notes/gettitle', {
      headers: { 'x-device-id': deviceId }
    });
    const data = await res.json();
    let titlesArray = [];
    if (data.titles) {
      titlesArray = Array.isArray(data.titles)
        ? data.titles.map(t =>
            typeof t === "string"
              ? { title: t }
              : t
          )
        : [];
      setNotes(titlesArray);
    }
    // Set new active note or clear
    if (titlesArray.length > 0) {
      setActiveNote(titlesArray[0]);
      // Optionally fetch its content
      selectNote(titlesArray[0]);
    } else {
      setActiveNote(null);
      setNoteContent('');
    }
    setIsDeleting(false);
  };

  return (
    <div className="flex h-screen bg-gray-700 drag-area">
      {/* Modal for new title */}
      {showTitleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 no-drag">
          <div className="bg-gray-800 p-8 rounded shadow-lg flex flex-col items-center">
            <h2 className="text-white text-xl mb-4">Enter Note Title</h2>
            <form onSubmit={handleTitleSubmit} className="flex flex-col items-center">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white mb-4 outline-none"
                autoFocus
                placeholder="Title"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 no-drag"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 no-drag"
                  onClick={() => setShowTitleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`w-80 flex flex-col no-drag ${
          isTransparent ? "bg-gray-900 bg-opacity-80" : "bg-gray-900"
        }`}
      >
        {/* Add New Notes Button */}
        <button
          onClick={addNewNote}
          className="p-6 text-white font-medium text-left hover:bg-gray-800 transition-colors border-b border-gray-700 no-drag"
        >
          ADD NEW NOTES
        </button>
        {/* Notes List */}
        <div className="flex-1 overflow-y-auto no-drag">
          {notes.map((note, idx) => (
            <button
              key={note._id || note.title || idx}
              onClick={() => selectNote(note)}
              className={`w-full p-6 text-white font-medium text-left hover:bg-gray-800 transition-colors border-b border-gray-700 no-drag ${
                activeNote && activeNote.title === note.title ? 'bg-gray-800' : ''
              }`}
            >
              {note.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col ${
          isTransparent ? "bg-gray-900 bg-opacity-80" : ""
        }`}
      >
        {/* Only show header/content if a note is selected */}
        {activeNote && activeNote.title ? (
          <>
            {/* Header */}
            <div className="p-8 border-b border-gray-600 flex items-center justify-between">
              <h1
                className="text-2xl font-medium text-white"
              >
                {activeNote.title}
              </h1>
              <button
                onClick={deleteActiveNote}
                disabled={isDeleting}
                className={`ml-4 px-4 py-2 rounded no-drag ${
                  isDeleting
                    ? "bg-red-300 cursor-wait"
                    : "bg-red-600 hover:bg-red-700"
                } ${
                  isTransparent
                    ? 'text-yellow-600'
                    : 'text-white'
                }`}
                title="Delete Note"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
            {/* Content Area */}
            <div className="flex-1 p-8 no-drag flex flex-col h-full">
              <textarea
                value={noteContent || ""}
                onChange={(e) => updateNoteContent(e.target.value)}
                placeholder="ENTER YOUR NOTES HERE ......."
                className="w-full flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none font-light"
                style={{ fontSize: "2rem" }}
                disabled={!activeNote || !activeNote.title}
              />
              <div className="flex justify-end mt-auto">
                <button
                  onClick={async () => {
                    if (!activeNote || !activeNote.title) return;
                    setIsSaving(true);
                    const deviceId = window.electronAPI?.getDeviceId?.();
                    if (!deviceId) {
                      setIsSaving(false);
                      return;
                    }
                    await fetch('http://localhost:3894/api/v1/notes/addnotes', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-device-id': deviceId
                      },
                      body: JSON.stringify({ title: activeNote.title, notes: noteContent })
                    });
                    setIsSaving(false);
                  }}
                  disabled={!activeNote || !activeNote.title || isSaving}
                  className={`px-6 py-2 rounded disabled:opacity-50 ${
                    isSaving
                      ? "bg-yellow-500 cursor-wait"
                      : "bg-green-600 hover:bg-green-700"
                  } ${
                    isTransparent
                      ? 'text-yellow-600'
                      : 'text-white'
                  }`}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Show nothing (or a placeholder if you want)
          <div className="flex-1 flex items-center justify-center text-gray-400 text-2xl select-none">
            {/* Nothing is shown by default */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes
