import { generateKeyPairSync, publicEncrypt, privateDecrypt } from 'crypto';
import fs from 'fs';
import path from 'path';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

fs.writeFile(new URL('./publicKey.pem', import.meta.url), publicKey, (err) => {
  err && console.log(err);
});
fs.writeFile(
  new URL('./privateKey.pem', import.meta.url),
  privateKey,
  (err) => {
    err && console.log(err);
  },
);
