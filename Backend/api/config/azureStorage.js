import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Azure Blob Service Client
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME || 'course-materials';

if (!connectionString) {
  console.error('❌ Azure Storage connection string not found in environment variables');
  process.exit(1);
}

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
export const containerClient = blobServiceClient.getContainerClient(containerName);

// Initialize container (create if doesn't exist)
export const initializeAzureStorage = async () => {
  try {
    // Create container if it doesn't exist
    const createContainerResponse = await containerClient.createIfNotExists({
      access: 'blob', // Public read access for blobs
    });
    
    if (createContainerResponse.succeeded) {
      console.log(`✅ Azure Blob container "${containerName}" created successfully`);
    } else {
      console.log(`✅ Azure Blob container "${containerName}" already exists`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Azure Blob Storage:', error.message);
    return false;
  }
};

// Test Azure connection
export const testAzureConnection = async () => {
  try {
    await containerClient.exists();
    console.log('✅ Azure Blob Storage connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Azure Blob Storage connection failed:', error.message);
    return false;
  }
};

// Helper function to generate blob name
export const generateBlobName = (courseId, type, originalFilename) => {
  const timestamp = Date.now();
  const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${courseId}/${type}/${timestamp}_${sanitizedFilename}`;
};

// Helper function to get blob URL
export const getBlobUrl = (blobName) => {
  return `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blobName}`;
};
