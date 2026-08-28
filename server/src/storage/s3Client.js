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

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.MINIO_BUCKET || 'sih26190-evidence';
const localStorageRoot = path.resolve(__dirname, '../../../storage');

let s3Client = null;
let isLocalStorageFallback = false;

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
  const bucketRoot = path.resolve(localStorageRoot, BUCKET_NAME);
  const target = path.resolve(bucketRoot, key);
  if (target !== bucketRoot && !target.startsWith(`${bucketRoot}${path.sep}`)) {
    throw new Error('Invalid storage key');
  }
  return target;
}

export async function initStorage() {
  const config = storageConfig();
  try {
    const client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
      maxAttempts: 2,
    });

    try {
      await client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        await client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      } else {
        throw error;
      }
    }

    s3Client = client;
    isLocalStorageFallback = false;
    console.log(`Connected to S3-compatible storage at ${config.endpoint}; bucket: ${BUCKET_NAME}`);
  } catch (error) {
    const bucketDir = path.resolve(localStorageRoot, BUCKET_NAME);
    fs.mkdirSync(bucketDir, { recursive: true });
    isLocalStorageFallback = true;
    console.warn(`Object storage unavailable (${error.message}); using local storage at ${bucketDir}`);
  }
}

export async function uploadObject({ key, buffer, contentType }) {
  if (!isLocalStorageFallback && s3Client) {
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    return { key, bucket: BUCKET_NAME };
  }

  const target = localObjectPath(key);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, buffer);
  return { key, bucket: BUCKET_NAME };
}

export async function getObjectStream({ key }) {
  if (!isLocalStorageFallback && s3Client) {
    const response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    return {
      stream: response.Body,
      contentType: response.ContentType || 'application/octet-stream',
      contentLength: response.ContentLength,
    };
  }

  const target = localObjectPath(key);
  if (!fs.existsSync(target)) {
    const error = new Error(`Object not found: ${key}`);
    error.code = 'NoSuchKey';
    throw error;
  }
  const stat = fs.statSync(target);
  return {
    stream: fs.createReadStream(target),
    contentType: 'application/octet-stream',
    contentLength: stat.size,
  };
}

export async function deleteObject({ key }) {
  if (!isLocalStorageFallback && s3Client) {
    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    return;
  }
  const target = localObjectPath(key);
  if (fs.existsSync(target)) fs.unlinkSync(target);
}

export async function objectExists({ key }) {
  if (!isLocalStorageFallback && s3Client) {
    try {
      await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
  return fs.existsSync(localObjectPath(key));
}

export function getStorageStatus() {
  return {
    driver: isLocalStorageFallback ? 'Local Emulation' : 'MinIO S3 Client',
    bucket: BUCKET_NAME,
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
