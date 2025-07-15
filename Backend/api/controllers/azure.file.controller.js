import multer from 'multer';
import { 
  containerClient, 
  generateBlobName, 
  getBlobUrl 
} from '../config/azureStorage.js';

// Configure multer for memory storage (upload directly to Azure)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'document': [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    'video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    'audio': ['audio/mp3', 'audio/wav', 'audio/ogg'],
    'compressed': ['application/zip', 'application/x-rar-compressed']
  };
  
  const { type = 'document' } = req.body;
  const allowedMimeTypes = allowedTypes[type] || Object.values(allowedTypes).flat();
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed for ${type} uploads`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Upload files to Azure Blob Storage
export const uploadFilesToAzure = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const { courseId, type = 'general' } = req.body;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }
    
    const uploadPromises = req.files.map(async (file) => {
      try {
        // Generate unique blob name
        const blobName = generateBlobName(courseId, type, file.originalname);
        
        // Get block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        // Set blob HTTP headers and metadata
        const uploadOptions = {
          blobHTTPHeaders: {
            blobContentType: file.mimetype,
            blobContentDisposition: `inline; filename="${file.originalname}"`
          },
          metadata: {
            courseId: courseId,
            type: type,
            originalName: file.originalname,
            uploadedBy: req.user?.id.toString() || 'unknown',
            uploadDate: new Date().toISOString()
          }
        };
        
        // Upload file buffer to Azure Blob Storage
        const uploadResponse = await blockBlobClient.upload(
          file.buffer, 
          file.buffer.length, 
          uploadOptions
        );
        
        if (uploadResponse.errorCode) {
          throw new Error(`Upload failed: ${uploadResponse.errorCode}`);
        }
        
        // Return file information
        return {
          blobName: blobName,
          filename: file.originalname,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: getBlobUrl(blobName),
          courseId: courseId,
          type: type,
          uploadDate: new Date().toISOString(),
          etag: uploadResponse.etag
        };
        
      } catch (error) {
        console.error(`Failed to upload ${file.originalname}:`, error);
        throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
      }
    });
    
    // Wait for all uploads to complete
    const uploadedFiles = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully to Azure Blob Storage`
    });
    
  } catch (error) {
    console.error('Azure upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files to Azure Blob Storage',
      error: error.message
    });
  }
};

// Delete file from Azure Blob Storage
export const deleteFileFromAzure = async (req, res) => {
  try {
    const { blobName } = req.body;
    
    if (!blobName) {
      return res.status(400).json({
        success: false,
        message: 'Blob name is required'
      });
    }
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found in Azure Blob Storage'
      });
    }
    
    // Delete the blob
    const deleteResponse = await blockBlobClient.delete();
    
    res.json({
      success: true,
      message: 'File deleted successfully from Azure Blob Storage'
    });
    
  } catch (error) {
    console.error('Azure delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file from Azure Blob Storage',
      error: error.message
    });
  }
};

// List files in Azure Blob Storage for a course
export const listCourseFiles = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type } = req.query;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }
    
    // List blobs with prefix
    const prefix = type ? `${courseId}/${type}/` : `${courseId}/`;
    const blobIterator = containerClient.listBlobsFlat({ prefix });
    
    const files = [];
    for await (const blob of blobIterator) {
      // Get blob metadata
      const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
      const properties = await blockBlobClient.getProperties();
      
      files.push({
        blobName: blob.name,
        filename: properties.metadata?.originalName || blob.name.split('/').pop(),
        size: blob.properties.contentLength,
        contentType: blob.properties.contentType,
        lastModified: blob.properties.lastModified,
        url: getBlobUrl(blob.name),
        metadata: properties.metadata
      });
    }
    
    res.json({
      success: true,
      data: files,
      message: `Found ${files.length} file(s) for course ${courseId}`
    });
    
  } catch (error) {
    console.error('Azure list files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files from Azure Blob Storage',
      error: error.message
    });
  }
};