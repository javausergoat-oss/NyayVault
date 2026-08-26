import crypto from 'crypto';

/**
 * Calculates SHA-256 hash for a given buffer.
 * @param {Buffer} buffer - File buffer
 * @returns {string} Hex-encoded SHA-256 checksum (64 chars)
 */
export function calculateBufferHash(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid input: Expected a Buffer to calculate hash.');
  }
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Calculates SHA-256 hash from a readable stream.
 * @param {import('stream').Readable} stream - Readable stream
 * @returns {Promise<string>} Hex-encoded SHA-256 checksum
 */
export function calculateStreamHash(stream) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

export default {
  calculateBufferHash,
  calculateStreamHash,
};
