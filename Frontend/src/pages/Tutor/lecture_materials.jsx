import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Save, Eye, EyeOff, FileText, Image, BookOpen, AlertCircle, CheckCircle, Loader, Plus, Edit, Trash2, Calendar, Clock, Users, Download } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';
import Header from '../../components/Header/TutorHeader';
import Sidebar from '../../components/Sidebar/TutorSidebar';
import { apiHelpers } from '../../utils/apiHelpers';

const TeacherMaterialUpload = () => {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'materials', 'assignments'
  
  // Existing states
  const [selectedCourse, setSelectedCourse] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileType, setFileType] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  
  // Loading and status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [submitMessage, setSubmitMessage] = useState('');
  
  // Assignment-specific states
  const [isAssignment, setIsAssignment] = useState(false);
  const [assignmentSettings, setAssignmentSettings] = useState({
    dueDate: '',
    dueTime: '',
    maxPoints: 100,
    allowedFileTypes: [],
    maxFileSize: 10,
    maxFiles: 1,
    instructions: '',
    allowLateSubmission: false,
    latePenalty: 10,
  });

  // New states for viewing materials and assignments
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // New state for publish/unpublish loading
  const [toggleStatusLoading, setToggleStatusLoading] = useState({});
  
  const editorRef = useRef(null);

  // Fetch teacher's courses on component mount using apiHelpers
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await apiHelpers.getCourses();
        
        if (response.success) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setSubmitStatus('error');
        setSubmitMessage(apiHelpers.handleError(error));
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch materials when materials tab is active
  useEffect(() => {
    if (activeTab === 'materials') {
      fetchMaterials();
    }
  }, [activeTab, selectedCourse]);

  // Fetch assignments when assignments tab is active
  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchAssignments();
    }
  }, [activeTab, selectedCourse]);

  // Fetch materials function
  const fetchMaterials = async () => {
    try {
      setMaterialsLoading(true);
      const currentUser = apiHelpers.getCurrentUser();
      
      const response = await apiHelpers.getMaterials({
        teacherId: currentUser?.id,
        courseId: selectedCourse || undefined,
        type: 'material'
      });
      
      if (response.success) {
        setMaterials(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // Fetch assignments function
  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const currentUser = apiHelpers.getCurrentUser();
      
      const response = await apiHelpers.getAssignments({
        teacherId: currentUser?.id,
        courseId: selectedCourse || undefined
      });
      
      if (response.success) {
        setAssignments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  // NEW: Toggle publish/unpublish status
  const handleToggleStatus = async (id, type, currentStatus) => {
    try {
      setToggleStatusLoading(prev => ({ ...prev, [id]: true }));
      
      const response = await apiHelpers.toggleMaterialStatus(id);
      
      if (response.success) {
        setSubmitStatus('success');
        setSubmitMessage(response.message);
        
        // Update the local state
        if (type === 'assignment') {
          setAssignments(prev => prev.map(item => 
            item.id === id 
              ? { ...item, is_published: response.data.is_published }
              : item
          ));
        } else {
          setMaterials(prev => prev.map(item => 
            item.id === id 
              ? { ...item, is_published: response.data.is_published }
              : item
          ));
        }
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      setSubmitStatus('error');
      setSubmitMessage(apiHelpers.handleError(error));
    } finally {
      setToggleStatusLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Delete material/assignment
  const handleDelete = async (id, type) => {
    try {
      const response = type === 'assignment' 
        ? await apiHelpers.deleteAssignment(id)
        : await apiHelpers.deleteMaterial(id);
      
      if (response.success) {
        setSubmitStatus('success');
        setSubmitMessage(`${type === 'assignment' ? 'Assignment' : 'Material'} deleted successfully`);
        
        // Refresh the appropriate list
        if (type === 'assignment') {
          fetchAssignments();
        } else {
          fetchMaterials();
        }
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(apiHelpers.handleError(error));
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Start editing a material/assignment
  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setActiveTab('create');
    
    setSelectedCourse(item.course_id);
    setTitle(item.title);
    setContent(item.content || '');
    setFileType(item.material_type || (type === 'assignment' ? 'assignment' : 'lesson'));
    
    if (type === 'assignment' && item.assignmentSettings) {
      setIsAssignment(true);
      setAssignmentSettings(item.assignmentSettings);
    } else if (item.is_assignment) {
      setIsAssignment(true);
      setAssignmentSettings({
        dueDate: item.due_date ? item.due_date.split('T')[0] : '',
        dueTime: item.due_date ? item.due_date.split('T')[1]?.slice(0, 5) : '',
        maxPoints: item.max_points || 100,
        allowedFileTypes: item.allowed_file_types ? (typeof item.allowed_file_types === 'string' ? JSON.parse(item.allowed_file_types) : item.allowed_file_types) : [],
        maxFileSize: item.max_file_size_mb || 10,
        maxFiles: item.max_files || 1,
        instructions: item.instructions || '',
        allowLateSubmission: item.allow_late_submission || false,
        latePenalty: item.late_penalty_percent || 0,
      });
    } else {
      setIsAssignment(false);
    }
  };

  // Clear status messages after 5 seconds
  useEffect(() => {
    if (submitStatus) {
      const timer = setTimeout(() => {
        setSubmitStatus(null);
        setSubmitMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const fileTypes = [
    { value: 'lesson', label: 'Lesson Content', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'assignment', label: 'Assignment', icon: <FileText className="w-4 h-4" /> },
    { value: 'notes', label: 'Study Notes', icon: <FileText className="w-4 h-4" /> },
    { value: 'resource', label: 'Resource Material', icon: <Image className="w-4 h-4" /> }
  ];

  const availableFileTypes = [
    { value: 'pdf', label: 'PDF Documents', extension: '.pdf' },
    { value: 'doc', label: 'Word Documents', extension: '.doc,.docx' },
    { value: 'ppt', label: 'PowerPoint', extension: '.ppt,.pptx' },
    { value: 'excel', label: 'Excel Files', extension: '.xls,.xlsx' },
    { value: 'images', label: 'Images', extension: '.jpg,.jpeg,.png,.gif' },
    { value: 'videos', label: 'Videos', extension: '.mp4,.avi,.mov' },
    { value: 'text', label: 'Text Files', extension: '.txt' },
    { value: 'zip', label: 'Compressed Files', extension: '.zip,.rar' },
    { value: 'any', label: 'Any File Type', extension: '*' }
  ];

  const handleFileTypeChange = (type) => {
    setFileType(type);
    setIsAssignment(type === 'assignment');
  };

  const handleAssignmentSettingsChange = (field, value) => {
    setAssignmentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileTypeSelection = (fileTypeValue) => {
    const updatedTypes = assignmentSettings.allowedFileTypes.includes(fileTypeValue)
      ? assignmentSettings.allowedFileTypes.filter(type => type !== fileTypeValue)
      : [...assignmentSettings.allowedFileTypes, fileTypeValue];
    
    handleAssignmentSettingsChange('allowedFileTypes', updatedTypes);
  };

  // Enhanced file upload handler using apiHelpers
  const handleFileUpload = useCallback(async (blobInfo, progress) => {
    return new Promise(async (resolve, reject) => {
      try {
        const currentCourse = selectedCourse;
        
        if (!currentCourse || currentCourse.trim() === '') {
          reject('Please select a course first before uploading files');
          return;
        }
        
        const file = blobInfo.blob();
        const type = 'images';
        
        const result = await apiHelpers.uploadFileWithProgress(
          file,
          currentCourse,
          type,
          progress
        );
        
        if (result.success && result.data && result.data.length > 0) {
          resolve(result.data[0].url);
        } else {
          reject('Upload failed - no URL returned');
        }
        
      } catch (error) {
        reject(apiHelpers.handleError(error));
      }
    });
  }, [selectedCourse]);

  // File picker callback
  const handleFilePicker = useCallback((callback, value, meta) => {
    const currentCourse = selectedCourse;
    
    if (!currentCourse || currentCourse.trim() === '') {
      alert('Please select a course first');
      return;
    }
    
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    
    if (meta.filetype === 'image') {
      input.setAttribute('accept', 'image/*');
    } else if (meta.filetype === 'media') {
      input.setAttribute('accept', 'video/*,audio/*');
    } else {
      input.setAttribute('accept', '*/*');
    }
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        let type = 'documents';
        
        if (meta.filetype === 'image') {
          type = 'images';
        } else if (meta.filetype === 'media') {
          type = 'media';
        } else {
          if (file.type.startsWith('image/')) {
            type = 'images';
          } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
            type = 'media';
          } else {
            type = 'documents';
          }
        }
        
        const result = await apiHelpers.uploadFileWithProgress(
          file,
          currentCourse,
          type,
          (progress) => console.log(`Progress: ${progress}%`)
        );
        
        if (result.success && result.data?.[0]?.url) {
          const fileUrl = result.data[0].url;
          const fileName = result.data[0].filename || file.name;
          
          if (type === 'images') {
            callback(fileUrl, { title: fileName });
          } else if (type === 'media') {
            callback(fileUrl, { title: fileName });
          } else {
            const extension = fileName.split('.').pop()?.toLowerCase() || '';
            let icon = '📄';
            
            switch (extension) {
              case 'pdf': icon = '📕'; break;
              case 'doc':
              case 'docx': icon = '📘'; break;
              case 'xls':
              case 'xlsx': icon = '📊'; break;
              case 'ppt':
              case 'pptx': icon = '📋'; break;
              case 'zip':
              case 'rar': icon = '🗜️'; break;
              case 'txt': icon = '📝'; break;
            }
            
            const linkText = `${icon} ${fileName}`;
            
            const editor = editorRef.current;
            if (editor && editor.insertContent) {
              const linkHtml = `<a href="${fileUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>&nbsp;`;
              editor.insertContent(linkHtml);
            } else if (window.tinymce && window.tinymce.activeEditor) {
              const activeEditor = window.tinymce.activeEditor;
              const linkHtml = `<a href="${fileUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>&nbsp;`;
              activeEditor.insertContent(linkHtml);
            } else {
              callback(fileUrl, { 
                title: fileName,
                text: linkText
              });
            }
          }
          
        } else {
          alert('Upload failed: ' + (result.message || 'Unknown error'));
        }
      } catch (error) {
        alert('Upload error: ' + error.message);
      }
    };
    
    input.click();
  }, [selectedCourse]);

 
  const editorConfig = useMemo(() => {
    return {
      height: 600,
      plugins: [
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
        'checklist', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
      ],
      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
      tinycomments_mode: 'embedded',
      tinycomments_author: 'Teacher',
      mergetags_list: [
        { value: 'Student.Name', title: 'Student Name' },
        { value: 'Course.Name', title: 'Course Name' },
        { value: 'Assignment.Title', title: 'Assignment Title' },
        { value: 'Due.Date', title: 'Due Date' },
      ],
      menubar: 'file edit insert view format table tools help',
      images_upload_handler: handleFileUpload,
      file_picker_callback: handleFilePicker,
      file_picker_types: 'file image media',
      automatic_uploads: true,
      images_reuse_filename: true,
      file_browser_callback_types: 'file image media',
      images_file_types: 'jpg,jpeg,png,gif,bmp,webp,svg',
      paste_enable_default_filters: false,
      paste_data_images: true,
      paste_as_text: false,
      link_assume_external_targets: true,
      link_context_toolbar: false,
      mediaembed_max_width: 650,
      mediaembed_service_url: false,
      link_quicklink: false,
      images_upload_timeout: 0,
      file_picker_timeout: 0,
      autosave_interval: '30s',
      autosave_prefix: `course-material-${selectedCourse || 'default'}-`,
      autosave_restore_when_empty: true,
      setup: (editor) => {
        editor.on('dragover', (e) => {
          e.preventDefault();
        });
        
        editor.on('drop', async (e) => {
          e.preventDefault();
          
          const files = Array.from(e.dataTransfer.files);
          if (files.length === 0) return;
          
          if (!selectedCourse || selectedCourse.trim() === '') {
            alert('Please select a course first before uploading files');
            return;
          }
          
          for (const file of files) {
            try {
              let type = 'documents';
              if (file.type.startsWith('image/')) {
                type = 'images';
              } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                type = 'media';
              }
              
              const result = await apiHelpers.uploadFileWithProgress(
                file,
                selectedCourse,
                type,
                (progress) => console.log(`Drop upload progress: ${progress}%`)
              );
              
              if (result.success && result.data?.[0]?.url) {
                const fileUrl = result.data[0].url;
                const fileName = result.data[0].filename || file.name;
                
                if (type === 'images') {
                  const imgHtml = `<img src="${fileUrl}" alt="${fileName}" style="max-width: 100%; height: auto;" />`;
                  editor.insertContent(imgHtml);
                } else if (type === 'media') {
                  const mediaHtml = `<p><a href="${fileUrl}" target="_blank" rel="noopener noreferrer">🎥 ${fileName}</a></p>`;
                  editor.insertContent(mediaHtml);
                } else {
                  const extension = fileName.split('.').pop()?.toLowerCase() || '';
                  let icon = '📄';
                  
                  switch (extension) {
                    case 'pdf': icon = '📕'; break;
                    case 'doc':
                    case 'docx': icon = '📘'; break;
                    case 'xls':
                    case 'xlsx': icon = '📊'; break;
                    case 'ppt':
                    case 'pptx': icon = '📋'; break;
                    case 'zip':
                    case 'rar': icon = '🗜️'; break;
                    case 'txt': icon = '📝'; break;
                  }
                  
                  const linkHtml = `<p><a href="${fileUrl}" target="_blank" rel="noopener noreferrer">${icon} ${fileName}</a></p>`;
                  editor.insertContent(linkHtml);
                }
              }
            } catch (error) {
              alert(`Failed to upload ${file.name}: ${error.message}`);
            }
          }
        });
      },
      content_style: `
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
          font-size: 14px; 
          line-height: 1.6;
          color: #333;
          padding: 20px;
          max-width: none;
        }
        img { 
          max-width: 100%; 
          height: auto; 
          border-radius: 8px; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin: 10px 0;
        }
        a {
          color: #007bff;
          text-decoration: underline;
          font-weight: 500;
        }
        a:hover {
          color: #0056b3;
          text-decoration: none;
        }
        .document-link {
          display: inline-block;
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          color: #495057;
          text-decoration: none;
          margin: 5px 0;
        }
        .document-link:hover {
          background: #e9ecef;
          color: #495057;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 20px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 12px; text-align: left; }
        th { 
          background-color: #f8f9fa; 
          font-weight: 600;
          color: #2c3e50;
        }
        blockquote { 
          border-left: 4px solid #007bff; 
          margin: 20px 0; 
          padding: 15px 20px; 
          font-style: italic;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        pre { 
          background-color: #f8f9fa; 
          padding: 15px; 
          border-radius: 4px; 
          overflow-x: auto;
          border: 1px solid #e9ecef;
        }
        .mce-content-body h1, .mce-content-body h2, .mce-content-body h3 {
          color: #2c3e50;
          margin-top: 30px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .mce-content-body h1 { font-size: 2.2em; }
        .mce-content-body h2 { font-size: 1.8em; }
        .mce-content-body h3 { font-size: 1.4em; }
      `,
    };
  }, [selectedCourse, handleFileUpload, handleFilePicker]);

  // Enhanced submission using apiHelpers
  const handleSubmit = async () => {
    if (!selectedCourse || !title || !content.trim()) {
      setSubmitStatus('error');
      setSubmitMessage('Please fill in all required fields');
      return;
    }

    if (isAssignment && (!assignmentSettings.dueDate || !assignmentSettings.dueTime || assignmentSettings.allowedFileTypes.length === 0)) {
      setSubmitStatus('error');
      setSubmitMessage('Please complete all assignment settings: due date, due time, and allowed file types');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      setSubmitMessage('');

      const currentUser = apiHelpers.getCurrentUser();
      
      const materialData = {
        courseId: selectedCourse,
        title,
        content,
        fileType,
        teacherId: currentUser?.id,
        ...(isAssignment && {
          assignmentSettings: assignmentSettings
        })
      };

      let response;
      if (editingItem) {
        response = editingItem.type === 'assignment' 
          ? await apiHelpers.updateAssignment(editingItem.id, materialData)
          : await apiHelpers.updateMaterial(editingItem.id, materialData);
      } else {
        response = await apiHelpers.createMaterial(materialData);
      }

      if (response.success) {
        setSubmitStatus('success');
        setSubmitMessage(`${isAssignment ? 'Assignment' : 'Course material'} ${editingItem ? 'updated' : 'created'} successfully!`);
        
        // Reset form
        setSelectedCourse('');
        setTitle('');
        setContent('');
        setFileType('');
        setIsAssignment(false);
        setEditingItem(null);
        setAssignmentSettings({
          dueDate: '',
          dueTime: '',
          maxPoints: 100,
          allowedFileTypes: [],
          maxFileSize: 10,
          maxFiles: 1,
          instructions: '',
          allowLateSubmission: false,
          latePenalty: 10,
        });

        // Refresh the appropriate list if we're editing
        if (editingItem) {
          if (editingItem.type === 'assignment') {
            fetchAssignments();
          } else {
            fetchMaterials();
          }
        }
      }
      
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      setSubmitMessage(apiHelpers.handleError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save as draft using apiHelpers
  const handleSaveDraft = async () => {
    if (!selectedCourse || !title) {
      setSubmitStatus('error');
      setSubmitMessage('Please select a course and enter a title to save draft');
      return;
    }

    try {
      setIsSubmitting(true);
      const currentUser = apiHelpers.getCurrentUser();
      
      const materialData = {
        courseId: selectedCourse,
        title: title || 'Untitled Draft',
        content: content || '',
        fileType: fileType || 'lesson',
        teacherId: currentUser?.id,
        isPublished: false,
      };

      const response = await apiHelpers.createMaterial(materialData);

      if (response.success) {
        setSubmitStatus('success');
        setSubmitMessage('Draft saved successfully!');
      }
      
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(apiHelpers.handleError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setSelectedCourse('');
    setTitle('');
    setContent('');
    setFileType('');
    setIsAssignment(false);
    setAssignmentSettings({
      dueDate: '',
      dueTime: '',
      maxPoints: 100,
      allowedFileTypes: [],
      maxFileSize: 10,
      maxFiles: 1,
      instructions: '',
      allowLateSubmission: false,
      latePenalty: 10,
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get file type icon
  const getFileTypeIcon = (type) => {
    switch (type) {
      case 'assignment': return <FileText className="w-5 h-5" />;
      case 'lesson': return <BookOpen className="w-5 h-5" />;
      case 'notes': return <FileText className="w-5 h-5" />;
      case 'resource': return <Image className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // NEW: Get publish status badge
  const getPublishStatusBadge = (isPublished) => {
    return isPublished ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
        Published
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
        Draft
      </span>
    );
  };

  // Loading state
  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Sidebar />
        <div className="p-4 sm:ml-64">
          <div className="p-4 mt-14">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading your courses...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      
      {/* Status Messages */}
      {submitStatus && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
          submitStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {submitStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={submitStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
              {submitMessage}
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.type)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="p-4 sm:ml-64">
        <div className="p-4 mt-14">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg p-6 mb-8 shadow-lg">
              <h1 className="text-3xl font-bold text-white mb-2">Course Materials & Assignments</h1>
              <p className="text-blue-100">Create, manage, and view your course content with Azure Blob Storage integration</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'create'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      {editingItem ? 'Edit' : 'Create'} Content
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'materials'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Materials ({materials.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'assignments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Assignments ({assignments.length})
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Create/Edit Tab Content */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                {editingItem && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Edit className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-blue-800 font-medium">
                          Editing: {editingItem.title}
                        </span>
                      </div>
                      <button
                        onClick={cancelEdit}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  </div>
                )}

                {/* Course Selection */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course *
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name} - Grade {course.grade}
                      </option>
                    ))}
                  </select>
                  {courses.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No courses assigned to you yet. Contact administrator to create courses.
                    </p>
                  )}
                </div>

                {/* Material Details */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter material title..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {fileTypes.map(type => (
                        <label key={type.value} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                          <input
                            type="radio"
                            name="fileType"
                            value={type.value}
                            checked={fileType === type.value}
                            onChange={(e) => handleFileTypeChange(e.target.value)}
                            className="mr-3"
                            disabled={isSubmitting}
                          />
                          {type.icon}
                          <span className="ml-2 text-sm">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assignment Settings - Only show when Assignment is selected */}
                {isAssignment && (
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-medium text-gray-900">Assignment Settings</h3>
                      <p className="text-sm text-gray-500 mt-1">Configure submission requirements and grading options</p>
                    </div>

                    {/* Due Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date *
                        </label>
                        <input
                          type="date"
                          value={assignmentSettings.dueDate}
                          onChange={(e) => handleAssignmentSettingsChange('dueDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={isSubmitting}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Time *
                        </label>
                        <input
                          type="time"
                          value={assignmentSettings.dueTime}
                          onChange={(e) => handleAssignmentSettingsChange('dueTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Points
                        </label>
                        <input
                          type="number"
                          value={assignmentSettings.maxPoints}
                          onChange={(e) => handleAssignmentSettingsChange('maxPoints', parseInt(e.target.value) || 100)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                          max="1000"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* File Upload Settings */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">File Submission Settings</h4>
                      
                      {/* Allowed File Types */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Allowed File Types *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {availableFileTypes.map(type => (
                            <label key={type.value} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                              <input
                                type="checkbox"
                                checked={assignmentSettings.allowedFileTypes.includes(type.value)}
                                onChange={() => handleFileTypeSelection(type.value)}
                                className="mr-3"
                                disabled={isSubmitting}
                              />
                              <div>
                                <span className="text-sm font-medium">{type.label}</span>
                                <span className="text-xs text-gray-500 block">{type.extension}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                        {assignmentSettings.allowedFileTypes.length === 0 && (
                          <p className="text-sm text-red-500 mt-2">Please select at least one file type</p>
                        )}
                      </div>

                      {/* File Size and Count Limits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max File Size (MB)
                          </label>
                          <select
                            value={assignmentSettings.maxFileSize}
                            onChange={(e) => handleAssignmentSettingsChange('maxFileSize', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSubmitting}
                          >
                            <option value={1}>1 MB</option>
                            <option value={5}>5 MB</option>
                            <option value={10}>10 MB</option>
                            <option value={25}>25 MB</option>
                            <option value={50}>50 MB</option>
                            <option value={100}>100 MB</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Number of Files
                          </label>
                          <select
                            value={assignmentSettings.maxFiles}
                            onChange={(e) => handleAssignmentSettingsChange('maxFiles', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSubmitting}
                          >
                            <option value={1}>1 file</option>
                            <option value={2}>2 files</option>
                            <option value={3}>3 files</option>
                            <option value={5}>5 files</option>
                            <option value={10}>10 files</option>
                            <option value={0}>Unlimited</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Late Submission Settings */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">Late Submission Policy</h4>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="allowLateSubmission"
                          checked={assignmentSettings.allowLateSubmission}
                          onChange={(e) => handleAssignmentSettingsChange('allowLateSubmission', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                        <label htmlFor="allowLateSubmission" className="text-sm font-medium text-gray-700">
                          Allow late submissions
                        </label>
                      </div>

                      {assignmentSettings.allowLateSubmission && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Late Penalty (% per day)
                          </label>
                          <input
                            type="number"
                            value={assignmentSettings.latePenalty}
                            onChange={(e) => handleAssignmentSettingsChange('latePenalty', parseInt(e.target.value) || 0)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            max="100"
                            disabled={isSubmitting}
                          />
                          <span className="text-sm text-gray-500 ml-2">% deducted per day late</span>
                        </div>
                      )}
                    </div>

                    {/* Student Experience Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">📚 Student Experience</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Students will see this assignment in their course dashboard</li>
                        <li>• They can view instructions and submit files directly from their portal</li>
                        <li>• File uploads will be validated against your settings automatically</li>
                        <li>• Due dates and late penalties will be enforced by the system</li>
                        <li>• Files will be stored securely in Azure Blob Storage</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Rich Text Editor */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Content Editor</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Create rich content with embedded images, videos, and files. Files will be stored in Azure Blob Storage.
                    </p>
                    {!selectedCourse && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Please select a course first to enable file uploads in the editor
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {!isPreview ? (
                    <div className="p-4">
                      <Editor
                        key={`editor-${selectedCourse}`}
                        apiKey='mwtgs33oq0sn03gmjs8cw4kasb8l561k7mi3w86omtelzfdp'
                        value={content}
                        onEditorChange={setContent}
                        init={editorConfig}
                        ref={editorRef}
                      />
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="prose max-w-none">
                        <div className="bg-gray-50 p-6 rounded-lg border">
                          <h3 className="text-lg font-semibold mb-4 text-gray-900">Preview: {title || 'Untitled Material'}</h3>
                          <div 
                            className="text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: content }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex space-x-3">
                    <button
                      onClick={handlePreview}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                      disabled={isSubmitting}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {isPreview ? 'Edit' : 'Preview'}
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    {!editingItem && (
                      <button
                        onClick={handleSaveDraft}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Draft'}
                      </button>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedCourse || !title || !content.trim() || (isAssignment && (!assignmentSettings.dueDate || !assignmentSettings.dueTime || assignmentSettings.allowedFileTypes.length === 0)) || isSubmitting}
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="animate-spin w-4 h-4 mr-2" />
                          {editingItem ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingItem ? 'Update' : (isAssignment ? 'Create Assignment' : 'Publish Material')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Materials Tab Content */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                {/* Course Filter */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Courses</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name} - Grade {course.grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Materials List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Course Materials</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage your published course materials and lesson content
                    </p>
                  </div>

                  {materialsLoading ? (
                    <div className="p-6 text-center">
                      <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
                      <p className="mt-2 text-gray-600">Loading materials...</p>
                    </div>
                  ) : materials.length === 0 ? (
                    <div className="p-6 text-center">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {selectedCourse ? 'No materials found for the selected course.' : 'You haven\'t created any materials yet.'}
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => setActiveTab('create')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Material
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {materials.map((material) => (
                        <div key={material.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 text-gray-400">
                                  {getFileTypeIcon(material.material_type)}
                                </div>
                                <div className="ml-4">
                                  <div className="flex items-center space-x-3">
                                    <h4 className="text-lg font-medium text-gray-900">{material.title}</h4>
                                    {getPublishStatusBadge(material.is_published)}
                                  </div>
                                  <div className="mt-1 flex items-center text-sm text-gray-500">
                                    <span className="capitalize">{material.material_type || 'Material'}</span>
                                    <span className="mx-2">•</span>
                                    <span>{material.course_name || 'Unknown Course'}</span>
                                    <span className="mx-2">•</span>
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>{formatDate(material.created_at)}</span>
                                  </div>
                                  {material.content && (
                                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                      {material.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {/* NEW: Publish/Unpublish Toggle Button */}
                              <button
                                onClick={() => handleToggleStatus(material.id, 'material', material.is_published)}
                                disabled={toggleStatusLoading[material.id]}
                                className={`p-2 rounded-lg transition-colors ${
                                  material.is_published
                                    ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                                title={material.is_published ? 'Unpublish material' : 'Publish material'}
                              >
                                {toggleStatusLoading[material.id] ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : material.is_published ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleEdit(material, 'material')}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit material"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: material.id, title: material.title, type: 'material' })}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete material"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assignments Tab Content */}
            {activeTab === 'assignments' && (
              <div className="space-y-6">
                {/* Course Filter */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Courses</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name} - Grade {course.grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignments List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Assignments</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage your assignments and view submission requirements
                    </p>
                  </div>

                  {assignmentsLoading ? (
                    <div className="p-6 text-center">
                      <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
                      <p className="mt-2 text-gray-600">Loading assignments...</p>
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className="p-6 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {selectedCourse ? 'No assignments found for the selected course.' : 'You haven\'t created any assignments yet.'}
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            setActiveTab('create');
                            setFileType('assignment');
                            setIsAssignment(true);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Assignment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 text-gray-400 mt-1">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="ml-4 flex-1">
                                  <div className="flex items-center space-x-3">
                                    <h4 className="text-lg font-medium text-gray-900">{assignment.title}</h4>
                                    {getPublishStatusBadge(assignment.is_published)}
                                  </div>
                                  <div className="mt-1 flex items-center text-sm text-gray-500">
                                    <span>{assignment.course_name || 'Unknown Course'}</span>
                                    <span className="mx-2">•</span>
                                    <span>{assignment.assignmentSettings?.maxPoints || assignment.max_points || 100} points</span>
                                    {(assignment.assignmentSettings?.dueDate || assignment.due_date) && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>Due {formatDate(assignment.assignmentSettings?.dueDate || assignment.due_date)}</span>
                                        {(assignment.assignmentSettings?.dueTime || assignment.due_date) && (
                                          <>
                                            <Clock className="w-4 h-4 ml-2 mr-1" />
                                            <span>{assignment.assignmentSettings?.dueTime || assignment.due_date?.split('T')[1]?.slice(0, 5)}</span>
                                          </>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  
                                  {assignment.content && (
                                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                      {assignment.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                    </p>
                                  )}

                                  {/* Assignment Settings Summary */}
                                  {(assignment.assignmentSettings || assignment.is_assignment) && (
                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                                      <div className="flex items-center">
                                        <Download className="w-3 h-3 mr-1" />
                                        <span>
                                          {(assignment.assignmentSettings?.allowedFileTypes?.length || 
                                            (assignment.allowed_file_types ? JSON.parse(assignment.allowed_file_types).length : 0) || 0)} file types
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <span>Max: {assignment.assignmentSettings?.maxFileSize || assignment.max_file_size_mb || 10}MB</span>
                                      </div>
                                      <div className="flex items-center">
                                        <span>
                                          {(assignment.assignmentSettings?.maxFiles || assignment.max_files) === 0 
                                            ? 'Unlimited files' 
                                            : `${assignment.assignmentSettings?.maxFiles || assignment.max_files || 1} file${(assignment.assignmentSettings?.maxFiles || assignment.max_files) !== 1 ? 's' : ''}`
                                          }
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <span>
                                          {(assignment.assignmentSettings?.allowLateSubmission || assignment.allow_late_submission)
                                            ? `Late: -${assignment.assignmentSettings?.latePenalty || assignment.late_penalty_percent || 10}%/day`
                                            : 'No late submissions'
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {/* NEW: Publish/Unpublish Toggle Button for Assignments */}
                              <button
                                onClick={() => handleToggleStatus(assignment.id, 'assignment', assignment.is_published)}
                                disabled={toggleStatusLoading[assignment.id]}
                                className={`p-2 rounded-lg transition-colors ${
                                  assignment.is_published
                                    ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                                title={assignment.is_published ? 'Unpublish assignment' : 'Publish assignment'}
                              >
                                {toggleStatusLoading[assignment.id] ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : assignment.is_published ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleEdit(assignment, 'assignment')}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit assignment"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: assignment.id, title: assignment.title, type: 'assignment' })}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete assignment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherMaterialUpload;