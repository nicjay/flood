import axios, {AxiosResponse} from 'axios';
import crypto from 'crypto';
import fs from 'fs';

import {getTempPath} from '../models/TemporaryStorage';

/**
 * Gets a randomly generated file path for temp file.
 *
 * @return {string} - path
 */
const getTempFilePath = (extension = 'tmp'): string => {
  return getTempPath(`${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`);
};

/**
 * Saves buffer to temporary storage as a file.
 *
 * @param {Buffer} buffer - buffer
 * @param {string} extension - file extension of temp file
 * @return {string} - path of saved temporary file. deleted after 5 minutes.
 */
export const saveBufferToTempFile = async (buffer: Buffer, extension?: string): Promise<string> => {
  const tempPath = getTempFilePath(extension);

  fs.writeFileSync(tempPath, buffer);

  setTimeout(() => fs.unlinkSync(tempPath), 1000 * 60 * 5);

  return tempPath;
};

/**
 * Fetches from URL to temporary storage.
 *
 * @param {string} url - URL
 * @param {string} extension - file extension of temp file
 * @return {string} - path of saved temporary file. deleted after 5 minutes.
 */
export const fetchURLToTempFile = async (url: string, extension?: string): Promise<string> => {
  const tempPath = getTempFilePath(extension);

  await new Promise((resolve) => {
    axios({
      method: 'GET',
      url,
      responseType: 'stream',
    }).then((res: AxiosResponse) => {
      res.data.pipe(fs.createWriteStream(tempPath)).on('finish', () => resolve());
    });
  });

  setTimeout(() => fs.unlinkSync(tempPath), 1000 * 60 * 5);

  return tempPath;
};
