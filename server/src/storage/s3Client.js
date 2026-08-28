import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localStorageRoot = path.resolve(__dirname, '../../../storage');

let s3Client = null;
let isLocalStorageFallback = false;

function getBucketName() {
  return process.env.AWS_S3_BUCKET_NAME || process.env.MINIO_BUCKET || 'sih-evidence-vault-2026';
}

function storageConfig() {
  const endpoint = process.env.AWS_S3_ENDPOINT || process.env.MINIO_ENDPOINT || 'http://localhost:9000';
  const port = process.env.MINIO_PORT;
  const endpointWithPort = port && !new URL(endpoint).port
    ? `${endpoint.replace(/\/$/, '')}:${port}`
    : endpoint;

  return {
    endpoint: endpointWithPort,
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadminpassword',
  };
}

function localObjectPath(key) {
  const bucketName = getBucketName();
  
  // 1. Primary path under configured bucket name
  const primaryPath = path.resolve(localStorageRoot, bucketName, key);
  if (fs.existsSync(primaryPath)) return primaryPath;

  // 2. Path directly under storage/
  const directPath = path.resolve(localStorageRoot, key);
  if (fs.existsSync(directPath)) return directPath;

  // 3. Known alternate bucket directories
  const altPath1 = path.resolve(localStorageRoot, 'sih-evidence-vault-2026', key);
  if (fs.existsSync(altPath1)) return altPath1;

  const altPath2 = path.resolve(localStorageRoot, 'sih26190-evidence', key);
  if (fs.existsSync(altPath2)) return altPath2;

  // Return primaryPath for creation
  return primaryPath;
}

export async function initStorage() {
  const config = storageConfig();
  const bucketName = getBucketName();
  const isAws = config.endpoint.includes('amazonaws.com');

  try {
    const clientParams = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      maxAttempts: 2,
    };

    if (!isAws) {
      clientParams.endpoint = config.endpoint;
      clientParams.forcePathStyle = true;
    }

    const client = new S3Client(clientParams);

    try {
      await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error) {
      if (!isAws && (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404)) {
        await client.send(new CreateBucketCommand({ Bucket: bucketName }));
      } else {
        throw error;
      }
    }

    s3Client = client;
    isLocalStorageFallback = false;
    console.log(`Connected to S3 storage at ${config.endpoint}; bucket: ${bucketName}`);
  } catch (error) {
    const bucketDir = path.resolve(localStorageRoot, bucketName);
    fs.mkdirSync(bucketDir, { recursive: true });
    isLocalStorageFallback = true;
    console.warn(`Object storage fallback active (${error.message}); using local storage at ${bucketDir}`);
  }
}

export async function uploadObject({ key, buffer, contentType }) {
  const bucketName = getBucketName();
  
  if (!isLocalStorageFallback && s3Client) {
    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));
      return { key, bucket: bucketName };
    } catch (err) {
      console.warn(`S3 uploadObject failed for ${key} (${err.message}). Saving to local storage...`);
    }
  }

  const target = localObjectPath(key);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, buffer);
  return { key, bucket: bucketName };
}

export async function getObjectStream({ key }) {
  const bucketName = getBucketName();

  if (!isLocalStorageFallback && s3Client) {
    try {
      const response = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: key }));
      return {
        stream: response.Body,
        contentType: response.ContentType || 'application/octet-stream',
        contentLength: response.ContentLength,
      };
    } catch (err) {
      console.warn(`S3 getObject failed for ${key} (${err.message}). Checking local fallback...`);
    }
  }

  const target = localObjectPath(key);
  if (fs.existsSync(target)) {
    const stat = fs.statSync(target);
    return {
      stream: fs.createReadStream(target),
      contentType: 'application/octet-stream',
      contentLength: stat.size,
    };
  }

  // Graceful Fallback: If file is not yet cached on disk, look up in database for extracted_text
  try {
    const { query } = await import('../config/db.js');
    const docRes = await query('SELECT filename, mime_type, extracted_text FROM documents WHERE storage_key = $1 LIMIT 1', [key]);
    if (docRes.rows.length > 0 && docRes.rows[0].extracted_text) {
      const doc = docRes.rows[0];
      const textContent = doc.extracted_text;
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, textContent, 'utf8');
      const stat = fs.statSync(target);
      return {
        stream: fs.createReadStream(target),
        contentType: doc.mime_type || 'text/plain',
        contentLength: stat.size,
      };
    }
  } catch (dbErr) {
    console.error('Error generating fallback file from extracted_text:', dbErr.message);
  }

  const error = new Error(`Object not found: ${key}`);
  error.code = 'NoSuchKey';
  throw error;
}

export async function deleteObject({ key }) {
  const bucketName = getBucketName();
  if (!isLocalStorageFallback && s3Client) {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
      return;
    } catch (err) {
      console.warn(`S3 deleteObject failed for ${key}: ${err.message}`);
    }
  }
  const target = localObjectPath(key);
  if (fs.existsSync(target)) fs.unlinkSync(target);
}

export async function objectExists({ key }) {
  const bucketName = getBucketName();
  if (!isLocalStorageFallback && s3Client) {
    try {
      await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
      return true;
    } catch {
      // Check local
    }
  }
  return fs.existsSync(localObjectPath(key));
}

export function getStorageStatus() {
  return {
    driver: isLocalStorageFallback ? 'Local Emulation' : 'MinIO S3 Client',
    bucket: getBucketName(),
    endpoint: storageConfig().endpoint,
    isLocal: isLocalStorageFallback,
  };
}

export default {
  initStorage,
  uploadObject,
  getObjectStream,
  deleteObject,
  objectExists,
  getStorageStatus,
};
