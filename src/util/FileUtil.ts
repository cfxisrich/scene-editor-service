import fs from 'fs';
import path from 'path';
import compressing from 'compressing';
import rimraf from 'rimraf';
import util from 'util';
import child_process from 'child_process';
import copydir from 'copy-dir';

const readdir = (path: string) => {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};

const readdirStats = (files: string[], rootPath: string) => {
  return Promise.all(
    files.map(
      (url) =>
        new Promise<fs.Stats>((resolve, reject) => {
          fs.stat(path.resolve(rootPath, `./${url}`), (err, stats) => {
            if (err) {
              reject(err);
            } else {
              resolve(stats);
            }
          });
        }),
    ),
  );
};

const copyFile = (originPath: string, targetPath: string) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(originPath, targetPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

const copyDir = (originPath: string, targetPath: string) => {
  return new Promise((resolve, reject) => {
    copydir(
      originPath,
      targetPath,
      {
        utimes: true, // keep add time and modify time
        mode: true, // keep file mode
        cover: true, // cover file when exists, default is true
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      },
    );
  });
};

const unlink = (path: string) => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

const rename = (oldPath: string, newPath: string) => {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

const uncompress = (ext: string, filePath: string, dirPath: string) => {
  return new Promise((resolve, reject) => {
    compressing[ext.slice(1)]
      .uncompress(filePath, dirPath)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const compress = (ext: string, dirPath: string, targetPath: string) => {
  return new Promise((resolve, reject) => {
    compressing[ext.slice(1)]
      .compressDir(dirPath, targetPath)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const rmdir = (path: string) => {
  return new Promise((resolve, reject) => {
    rimraf(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

const mkdir = (path: string) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      resolve(true);
    }
    fs.mkdir(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

const writeFile = (path: string, data, options?) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

const exec = util.promisify(child_process.exec);

export default {
  readdir,
  readdirStats,
  copyFile,
  copyDir,
  unlink,
  rename,
  uncompress,
  rmdir,
  mkdir,
  writeFile,
  exec,
  compress,
};
