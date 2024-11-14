import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const HMAC_KEY = process.env.HMAC_KEY || 'myhmackey1234567890123456789012';

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  const hmac = crypto.createHmac('sha256', Buffer.from(HMAC_KEY, 'utf-8'));
  hmac.update(iv.toString('hex') + encrypted);
  const hmacDigest = hmac.digest('hex');

  return `${iv.toString('hex')}:${encrypted}:${hmacDigest}`;
};

const decrypt = (encryptedText) => {
  try {
    const [ivHex, encrypted, hmacDigest] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const hmac = crypto.createHmac('sha256', Buffer.from(HMAC_KEY, 'utf-8'));
    hmac.update(ivHex + encrypted);
    const calculatedHmacDigest = hmac.digest('hex');

    if (calculatedHmacDigest !== hmacDigest) {
      throw new Error('Data integrity check failed');
    }

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
};

const verifyData = (originalText, decryptedText) => {
  return originalText === decryptedText;
};

export { encrypt, decrypt, verifyData };
