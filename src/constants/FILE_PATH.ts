import path from 'path';

const cwd = process.cwd();

export const UPLOAD = path.resolve(cwd, './temp');

export default {
  UPLOAD,
};
