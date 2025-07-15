import { useState, useEffect } from 'react';
import { BookOpen, FileText, CheckSquare, Upload, X, Plus, Save, Clock, AlertCircle, CheckCircle, Download, Loader } from 'lucide-react';
import { studentCourseApiHelpers } from '../../utils/studentCourseApiHelpers';

// Enhanced Materials Section with downloadable content
const MaterialsSection = ({ courseId }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingFiles, setDownloadingFiles] = useState({});
  
  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await studentCourseApiHelpers.getCourseMaterials(courseId);
      if (response.success) {
        setMaterials(response.data);
      }
    } catch (error) {
      setError(studentCourseApiHelpers.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
        );
      case 'video':
      case 'mp4':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        );
      case 'doc':
      case 'docx':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'ppt':
      case 'pptx':
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
        );
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'lesson':
        return 'bg-green-100 text-green-800';
      case 'resource':
        return 'bg-blue-100 text-blue-800';
      case 'notes':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Extract file links from HTML content
  const extractFilesFromContent = (htmlContent) => {
    if (!htmlContent) return [];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const links = doc.querySelectorAll('a[href]');
    
    const files = [];
    links.forEach((link, index) => {
      const href = link.getAttribute('href');
      const text = link.textContent.trim();
      
      // Check if it's a file link (contains blob storage or has file extension)
      if (href && (href.includes('blob.core.windows.net') || href.match(/\.[a-zA-Z0-9]+$/))) {
        const fileName = text.replace(/^📕\s*/, '') || href.split('/').pop() || `file-${index + 1}`;
        files.push({
          url: href,
          name: fileName,
          originalName: fileName
        });
      }
    });
    
    return files;
  };

  const handleDownload = async (materialId, fileIndex, fileName, fileUrl) => {
    const downloadKey = `${materialId}-${fileIndex}`;
    try {
      setDownloadingFiles(prev => ({ ...prev, [downloadKey]: true }));
      
      if (fileUrl) {
        await studentCourseApiHelpers.downloadFromAzureUrl(fileUrl, fileName);
      } else {
        await studentCourseApiHelpers.downloadMaterialFile(materialId, fileIndex);
      }
    } catch (error) {
      alert(studentCourseApiHelpers.handleError(error));
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [downloadKey]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader className="animate-spin h-6 w-6 text-blue-600 mx-auto" />
        <p className="mt-2 text-gray-600">Loading materials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
        <p className="mt-2 text-red-600">{error}</p>
        <button 
          onClick={fetchMaterials}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Materials</h2>
        <p className="text-gray-600">Download course materials, lectures, and resources uploaded by your instructor.</p>
      </div>

      <div className="space-y-4">
        {materials.map((material) => (
          <div key={material.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
            <div className="flex items-start space-x-4">
              {getFileIcon(material.material_type)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {material.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeBadge(material.material_type)}`}>
                        {material.material_type}
                      </span>
                    </div>
                    
                    {material.content && (
                      <div className="text-gray-600 text-sm mb-4">
                        <div dangerouslySetInnerHTML={{ __html: material.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' }} />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {material.material_type.toUpperCase()} Material
                      </span>
                      <span>•</span>
                      <span>Uploaded {formatDate(material.created_at)}</span>
                      {(() => {
                        const contentFiles = extractFilesFromContent(material.content);
                        const allFiles = [...(material.file_attachments || []), ...contentFiles];
                        return allFiles.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{allFiles.length} file{allFiles.length !== 1 ? 's' : ''}</span>
                          </>
                        );
                      })()}
                    </div>
                    
                    {(() => {
                      // Combine file_attachments with files extracted from content
                      const contentFiles = extractFilesFromContent(material.content);
                      const allFiles = [...(material.file_attachments || []), ...contentFiles];
                      
                      return allFiles.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900">Attachments:</h4>
                          {allFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-700">{file.originalName || file.name}</span>
                                {file.size && (
                                  <span className="text-xs text-gray-500">
                                    ({Math.round(file.size / 1024)} KB)
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleDownload(material.id, index, file.originalName || file.name, file.url)}
                                disabled={downloadingFiles[`${material.id}-${index}`]}
                                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                              >
                                {downloadingFiles[`${material.id}-${index}`] ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {materials.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No materials yet</h3>
          <p className="text-gray-500">Your instructor hasn't uploaded any course materials yet. Check back later!</p>
        </div>
      )}
    </div>
  );
};

// Submission Form Component
const SubmissionForm = ({ assignment, onCancel, onSubmit }) => {
  const [submissionText, setSubmissionText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && uploadedFiles.length === 0) {
      alert('Please add some content or upload files before submitting');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      const submissionData = {
        submissionText: submissionText.trim()
      };

      const result = await studentCourseApiHelpers.submitAssignmentWithProgress(
        assignment.assignment_id,
        submissionData,
        uploadedFiles,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        onSubmit(result.data);
      }
      
    } catch (error) {
      alert(studentCourseApiHelpers.handleError(error));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const getDaysRemaining = () => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining < 0;
  const isDueSoon = daysRemaining <= 2 && daysRemaining > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h2>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">
                Due: {new Date(assignment.due_date).toLocaleDateString()} at {new Date(assignment.due_date).toLocaleTimeString()}
              </span>
              <span className="text-gray-600">Max Points: {assignment.max_points}</span>
            </div>
          </div>
          <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
            isOverdue 
              ? 'bg-red-100 text-red-800' 
              : isDueSoon 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
          }`}>
            <Clock className="w-4 h-4 mr-1.5" />
            {isOverdue 
              ? `Overdue by ${Math.abs(daysRemaining)} days` 
              : isDueSoon 
                ? `Due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`
                : `${daysRemaining} days remaining`
            }
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Assignment Instructions</h3>
        <div 
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: assignment.content || assignment.instructions }}
        />
      </div>

      {assignment.allowed_file_types && assignment.allowed_file_types.length > 0 && (
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Submission Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Allowed File Types:</span>
              <p className="text-blue-700 mt-1">{assignment.allowed_file_types.join(', ')}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Max File Size:</span>
              <p className="text-blue-700 mt-1">{assignment.max_file_size_mb} MB</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Max Files:</span>
              <p className="text-blue-700 mt-1">{assignment.max_files === 0 ? 'Unlimited' : assignment.max_files}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Submission</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Written Response
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Editor
              apiKey='mwtgs33oq0sn03gmjs8cw4kasb8l561k7mi3w86omtelzfdp'
              value={submissionText}
              onEditorChange={setSubmissionText}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                  'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'table', 'wordcount', 'paste', 'emoticons'
                ],
                toolbar: 'undo redo | blocks fontsize | ' +
                  'bold italic underline | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | table | emoticons charmap',
                content_style: `
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                    font-size: 14px; 
                    line-height: 1.6;
                    color: #333;
                    padding: 15px;
                  }
                  table { border-collapse: collapse; width: 100%; }
                  table, th, td { border: 1px solid #ddd; }
                  th, td { padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                `,
                paste_data_images: true,
                paste_as_text: false
              }}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Files (Optional)
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">
              Drag files here or click to browse
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
              accept={assignment.allowed_file_types ? assignment.allowed_file_types.map(type => `.${type}`).join(',') : '*'}
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Uploaded Files ({uploadedFiles.length})
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isSubmitting && uploadProgress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!submissionText.trim() && uploadedFiles.length === 0)}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assignment Section
const AssignmentSection = ({ courseId }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await studentCourseApiHelpers.getCourseAssignments(courseId);
      if (response.success) {
        setAssignments(response.data);
      }
    } catch (error) {
      setError(studentCourseApiHelpers.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentClick = async (assignment) => {
    if (assignment.submitted) {
      alert('This assignment has already been submitted.');
      return;
    }
    
    try {
      const response = await studentCourseApiHelpers.getAssignmentDetails(assignment.assignment_id);
      if (response.success) {
        setSelectedAssignment(response.data);
      }
    } catch (error) {
      alert(studentCourseApiHelpers.handleError(error));
    }
  };

  const handleSubmission = (submissionData) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.assignment_id === selectedAssignment.assignment_id
        ? { ...assignment, submitted: true, submission: submissionData }
        : assignment
    ));

    setSelectedAssignment(null);
    alert('Assignment submitted successfully!');
  };

  const handleCancelSubmission = () => {
    setSelectedAssignment(null);
  };

  if (selectedAssignment) {
    return (
      <div className="p-6">
        <SubmissionForm
          assignment={selectedAssignment}
          onCancel={handleCancelSubmission}
          onSubmit={handleSubmission}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader className="animate-spin h-6 w-6 text-blue-600 mx-auto" />
        <p className="mt-2 text-gray-600">Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
        <p className="mt-2 text-red-600">{error}</p>
        <button 
          onClick={fetchAssignments}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Assignments</h2>
      <div className="space-y-4">
        {assignments.map(assignment => (
          <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{assignment.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span>Due: {new Date(assignment.due_date).toLocaleDateString()} at {new Date(assignment.due_date).toLocaleTimeString()}</span>
                  <span>Points: {assignment.max_points}</span>
                </div>
                <div className="text-sm text-gray-700">
                  <div dangerouslySetInnerHTML={{ __html: (assignment.content || assignment.instructions || '').substring(0, 150) + '...' }} />
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2 ml-4">
                {assignment.submitted ? (
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Submitted
                  </div>
                ) : (
                  <>
                    <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full text-sm">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      Pending
                    </div>
                    <button
                      onClick={() => handleAssignmentClick(assignment)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Submit Assignment
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-gray-500">Your instructor hasn't posted any assignments yet. Check back later!</p>
        </div>
      )}
    </div>
  );
};

// Submissions Section
const SubmissionsSection = ({ courseId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [courseId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await studentCourseApiHelpers.getStudentSubmissions(courseId);
      if (response.success) {
        setSubmissions(response.data);
      }
    } catch (error) {
      setError(studentCourseApiHelpers.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status, grade) => {
    if (grade !== null) {
      return 'bg-green-50 border-green-200 text-green-900';
    }
    switch (status) {
      case 'submitted':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'graded':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'returned':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getStatusIcon = (status, grade) => {
    if (grade !== null) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    switch (status) {
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'returned':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader className="animate-spin h-6 w-6 text-blue-600 mx-auto" />
        <p className="mt-2 text-gray-600">Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
        <p className="mt-2 text-red-600">{error}</p>
        <button 
          onClick={fetchSubmissions}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">My Submissions</h2>
      <div className="space-y-4">
        {submissions.map(submission => (
          <div key={submission.id} className={`border rounded-lg p-4 ${getStatusColor(submission.status, submission.grade)}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-lg">{submission.assignment_title}</h3>
                <p className="text-sm mt-1">
                  Submitted on {formatDate(submission.submitted_at)}
                  {submission.is_late && (
                    <span className="ml-2 text-red-600 font-medium">(Late)</span>
                  )}
                </p>
                {submission.grade !== null && (
                  <p className="text-sm mt-2">
                    Grade: <span className="font-medium text-lg">{submission.grade}/{submission.max_points}</span>
                    {submission.percentage && (
                      <span className="ml-2">({submission.percentage}%)</span>
                    )}
                  </p>
                )}
                {submission.feedback && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                    <p className="text-sm text-gray-600">{submission.feedback}</p>
                  </div>
                )}
                {submission.submitted_files && submission.submitted_files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Submitted Files:</p>
                    <div className="space-y-1">
                      {submission.submitted_files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                          <span className="text-gray-600 truncate">{file.originalName || file.filename}</span>
                          <button
                            onClick={() => studentCourseApiHelpers.downloadSubmissionFile(file.url, file.originalName || file.filename)}
                            className="text-blue-600 hover:text-blue-800 ml-2 font-medium"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {submission.graded_at && (
                  <p className="text-sm text-gray-600 mt-2">
                    Graded on {formatDate(submission.graded_at)} by {submission.graded_by_name}
                  </p>
                )}
              </div>
              <div className="flex items-center ml-4">
                {getStatusIcon(submission.status, submission.grade)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-500">You haven't submitted any assignments yet.</p>
        </div>
      )}
    </div>
  );
};

// Main Course Section Component
export default function CourseSection({ courseId: propCourseId, course }) {
  const [activeTab, setActiveTab] = useState('materials');
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const courseId = propCourseId || course?.course_id || 'C005';

  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  const fetchCourseInfo = async () => {
    try {
      setLoading(true);
      
      if (course && course.course_name) {
        setCourseInfo({
          ...course,
          teacher_name: course.instructor || course.teacher_name || course.fname || 'Unknown',
          course_name: course.course_name,
          statistics: {
            material_count: 0,
            assignment_count: 0,
            submitted_count: 0
          }
        });
        setLoading(false);
        return;
      }
      
      const response = await studentCourseApiHelpers.getCourseInfo(courseId);
      if (response.success) {
        setCourseInfo(response.data);
      }
    } catch (error) {
      setError(studentCourseApiHelpers.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'materials':
        return <MaterialsSection courseId={courseId} />;
      case 'assignments':
        return <AssignmentSection courseId={courseId} />;
      case 'submissions':
        return <SubmissionsSection courseId={courseId} />;
      default:
        return <MaterialsSection courseId={courseId} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-blue-100">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-8 max-w-lg mx-auto shadow-xl">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-700">Error Loading Course</h2>
        </div>
        <p className="text-gray-700 mb-6">{error}</p>
        <button 
          onClick={fetchCourseInfo}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-100">
      {/* Course Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {courseInfo?.course_name || 'Course'}
            </h1>
            <div className="flex items-center text-sm text-gray-600 space-x-3">
              <span>Instructor: {courseInfo?.teacher_name || courseInfo?.fname || 'Unknown'}</span>
              <span>•</span>
              <span>Grade {courseInfo?.grade || 'N/A'}</span>
              {courseInfo?.statistics && (
                <>
                  <span>•</span>
                  <span>{courseInfo.statistics.material_count} Materials</span>
                  <span>•</span>
                  <span>{courseInfo.statistics.assignment_count} Assignments</span>
                </>
              )}
            </div>
          </div>
          <div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
              Enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 px-6" aria-label="Tabs">
          {[
            { id: 'materials', label: 'Course Materials', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'assignments', label: 'Assignments', icon: <FileText className="w-4 h-4" /> },
            { id: 'submissions', label: 'Submissions', icon: <CheckSquare className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
}