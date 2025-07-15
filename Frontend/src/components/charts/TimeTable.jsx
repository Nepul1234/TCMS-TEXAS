import React, { useState, useEffect, useRef } from 'react';

const TimetableManagement = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [timetableTitle, setTimetableTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTimetableId, setCurrentTimetableId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);

  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  useEffect(() => {
    // Add TinyMCE script to the document
    const script = document.createElement('script');
    script.src = 'https://cdn.tiny.cloud/1/sqvcazzz04ynd69a8vz7rvtg34uc58br0798xgt6lf0f7bl5/tinymce/6/tinymce.min.js';
    script.referrerPolicy = 'origin';
    script.onload = () => initTinyMCE();
    document.head.appendChild(script);

    return () => {
      if (window.tinymce) {
        window.tinymce.remove('#timetable-editor');
      }
      document.head.removeChild(script);
    };
  }, []);

  const initTinyMCE = () => {
    if (window.tinymce) {
      window.tinymce.init({
        selector: '#timetable-editor',
        height: 400,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
        'bold italic backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        setup: (editor) => {
          editorRef.current = editor;
          
          editor.on('Change', () => {
            setEditorContent(editor.getContent());
          });

          editor.on('init', () => {
            if (editorContent) {
              editor.setContent(editorContent);
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    if (editorRef.current && editorContent) {
      editorRef.current.setContent(editorContent);
    }
  }, [isEditing]);

  // Fetch all timetables
  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/timetables/getTimetable',
        {method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch timetables');
      }
      
      const data = await response.json();
      setTimetables(data.timetable);
      console.log(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const content = editorRef.current ? editorRef.current.getContent() : editorContent;
    
    if (!selectedGrade || !timetableTitle || !content) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const timetableData = {
        grade: selectedGrade,
        title: timetableTitle,
        content: content
      };

      let url = '/api/timetables/setTimetable';
      let method = 'POST';

      if (isEditing && currentTimetableId) {
        url = `/api/timetables/updateTimetable/${currentTimetableId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(timetableData)
      });

      if (!response.ok) {
        alert("Error uploading timetable: " + response.message);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Show success message and reset form
      setSuccessMessage(isEditing ? 'Timetable updated successfully!' : 'Timetable added successfully!');
      resetForm();
      fetchTimetables(); 

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedGrade('');
    setTimetableTitle('');
    setEditorContent('');
    
    // Reset TinyMCE content
    if (editorRef.current) {
      editorRef.current.setContent('');
    }
    
    setIsEditing(false);
    setCurrentTimetableId(null);
    setError(null);
  };

  // Handle edit timetable
  const handleEdit = (timetable) => {
    setSelectedGrade(timetable.grade);
    setTimetableTitle(timetable.title);
    setEditorContent(timetable.content);
    setIsEditing(true);
    setCurrentTimetableId(timetable.id);
    
    if (editorRef.current) {
      editorRef.current.setContent(timetable.content);
    }
    
    // Scroll to the top 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) {
      return;
    }

    try {
      const response = await fetch(`/api/timetables/deleteTimetable/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete timetable');
      }

      setSuccessMessage('Timetable deleted successfully!');
      fetchTimetables(); 

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="timetable-management-container">
      <div className="justify-items-center">
         <h1 className="text-2xl font-bold mb-6">Add TimeTables</h1>
      </div>
      
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
          <button 
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Timetable Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Timetable' : 'Add New Timetable'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Timetable Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              value={timetableTitle}
              onChange={(e) => setTimetableTitle(e.target.value)}
              placeholder="Enter timetable title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Select Grade
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              required
            >
              <option value="">Select a grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Timetable Content
            </label>
            {/* TinyMCE Editor Container */}
            <div ref={editorContainerRef}>
              <textarea id="timetable-editor"></textarea>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              {isEditing ? 'Update Timetable' : 'Add Timetable'}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Timetable List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Timetable List</h2>
        
        {loading ? (
          <p>Loading timetables...</p>
        ) : timetables.length === 0 ? (
          <p>No timetables found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Title</th>
                  <th className="py-2 px-4 border-b text-left">Grade</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timetables.map((timetable) => (
                  <tr key={timetable.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{timetable.title}</td>
                    <td className="py-2 px-4 border-b">{timetable.grade}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(timetable)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(timetable.id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            const newWindow = window.open('', '_blank');
                            if (newWindow) {
                              newWindow.document.write(
                                `<html>
                                  <head>
                                    <title>Timetable View</title>
                                    <style>
                                      body {
                                        font-family: Arial, sans-serif;
                                        padding: 20px;
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    ${timetable.content}
                                  </body>
                                </html>`
                              );
                              newWindow.document.close();
                            }
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableManagement;