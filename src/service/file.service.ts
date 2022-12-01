import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import path from 'path';
import fs, { createReadStream } from 'fs';
import {
  ModelFileDescDTO,
  FileDTO,
  ClassifyDTO,
  FileDescDTO,
  UploadFileDTO,
  ComponentFileDescDTO,
} from '../DTO/file.dto';

import FileUtil from '../util/FileUtil';
import MODEL_EXT from '../constants/MODEL_EXT';
import IMAGE_EXT from '../constants/IMAGE_EXT';
import COMPRESS_EXT from '../constants/COMPRESS_EXT';
import FILE_PATH from '../constants/FILE_PATH';

const cwd = process.cwd();
@Injectable()
export class FileService {
  private USER_PATH = path.resolve(cwd, './resources/user');
  private PLATFORM_PATH = path.resolve(cwd, './resources/platform');
  private COMMUNITY_PATH = path.resolve(cwd, './resources/community');
  private UPLOAD_PATH = FILE_PATH.UPLOAD;

  private spaceStructure = [
    { name: 'templates' },
    { name: 'components' },
    { name: 'materials' },
    { name: 'models' },
    { name: 'media' },
    { name: 'apps' },
    { name: 'widget3ds' },
  ];

  constructor(private logger: Logger) {
    logger.log(`USER_PATH --> ${this.USER_PATH}`, this.constructor.name);
    logger.log(
      `PLATFORM_PATH --> ${this.PLATFORM_PATH}`,
      this.constructor.name,
    );
    logger.log(
      `COMMUNITY_PATH --> ${this.COMMUNITY_PATH}`,
      this.constructor.name,
    );
  }

  /**
   * 创建用户空间
   * @param id
   */
  createUserSpace(id: number) {
    const rootPath = path.resolve(this.USER_PATH, `./${id}`);

    if (fs.existsSync(rootPath)) {
      this.logger.error(
        `重复创建用户空间 --> ${rootPath}`,
        this.constructor.name,
      );
      throw new InternalServerErrorException('重复创建用户空间！');
    }

    try {
      fs.mkdirSync(rootPath);

      this.spaceStructure.forEach((structure) => {
        const url = path.resolve(rootPath, `./${structure.name}`);
        fs.mkdirSync(url);
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * 获取文件路径
   * @param param0
   * @returns
   */
  getFilePath({ role, type, id, url }: FileDTO) {
    const rolePathMap = {
      user: path.resolve(this.USER_PATH, `./${id}/${type}${url}`),
      platform: path.resolve(this.PLATFORM_PATH, `./${type}${url}`),
      community: path.resolve(this.COMMUNITY_PATH, `./${type}${url}`),
    };

    if (!rolePathMap[role]) {
      this.logger.error(
        `请求参数有误: role --> ${role}`,
        this.constructor.name,
      );
      throw new BadRequestException('请求参数有误！');
    }

    return rolePathMap[role];
  }

  // 获取根路径
  getFileRootPath({ role, type, id }: Omit<FileDTO, 'url'>) {
    const rolePathMap = {
      user: path.resolve(this.USER_PATH, `./${id}/${type}`),
      platform: path.resolve(this.PLATFORM_PATH, `./${type}`),
      community: path.resolve(this.COMMUNITY_PATH, `./${type}`),
    };

    if (!rolePathMap[role]) {
      this.logger.error(
        `请求参数有误: role --> ${role}`,
        this.constructor.name,
      );
      throw new BadRequestException('请求参数有误！');
    }

    return rolePathMap[role];
  }

  /**
   * 获取文件结构
   */
  async getFileStructure({ role, type, id, url }: FileDTO) {
    try {
      const filePath = this.getFilePath({ role, type, id, url });

      const files = await FileUtil.readdir(filePath);

      const statsFiles = await FileUtil.readdirStats(files, filePath);

      return statsFiles.map((stats, i, arr) => {
        return {
          dir: stats.isDirectory(),
          size: stats.size,
          ext: path.extname(files[i]),
          url: `${url}/${files[i]}`,
          name: files[i],
        };
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取模型结构
   * @param param0
   */
  async getModelStructure({ role, id, url }: Omit<FileDTO, 'type'>) {
    const filePath = this.getFilePath({ role, type: 'models', id, url });
    const fileRootPath = this.getFileRootPath({
      role,
      type: 'models',
      id,
    });

    if (!fs.existsSync(filePath)) {
      this.logger.error(
        `文件不存在 ---> ${filePath}`,
        '',
        this.constructor.name + '.getModelStructure',
      );
      throw new InternalServerErrorException('文件不存在！');
    }

    if (fs.statSync(filePath).isFile()) {
      this.logger.error(
        `无法获取结构 ---> ${filePath}`,
        '',
        this.constructor.name + '.getModelStructure',
      );
      throw new InternalServerErrorException('无法获取结构！');
    }

    const files = await FileUtil.readdir(filePath);
    const statsFiles = await FileUtil.readdirStats(files, filePath);

    const resultList: ModelFileDescDTO[] = [];

    let index = 0;
    for (const stats of statsFiles) {
      // 只要该路径下面的文件中有一个是非文件夹文件，就是非法的
      // 因为无法直接从服务中获取直接的模型包
      if (stats.isFile()) {
        this.logger.error(
          `非法的文件路径！ ---> ${filePath}`,
          '',
          this.constructor.name + '.getModelStructure',
        );
        throw new InternalServerErrorException('非法的文件路径！');
      }

      const fileDesc = new ModelFileDescDTO({
        dir: true,
        size: stats.size,
        ext: path.extname(files[index]),
        url: `${url}/${files[index]}`,
        name: files[index],
      });

      // 遍历所有的子文件夹
      const childFiles = await FileUtil.readdir(`${filePath}/${files[index]}`);
      const childStatsFiles = await FileUtil.readdirStats(
        childFiles,
        `${filePath}/${files[index]}`,
      );

      // 找子文件的模型和预览图
      for (const stats of childStatsFiles) {
        if (stats.isFile()) {
          // 有一个是文件，说明是模型文件夹
          fileDesc.dir = false;
          const model = childFiles.find(
            (file) => path.extname(file).toLocaleLowerCase() in MODEL_EXT,
          );

          if (!model) {
            this.logger.error(
              `文件解析出现错误 ---> ${childFiles.join(',')}`,
              '',
              this.constructor.name + '.getModelStructure',
            );
            throw new InternalServerErrorException('文件解析出现错误！');
          }
          let preview = '';

          for (const key in IMAGE_EXT) {
            const url = `${fileDesc.url}/preview${key}`;

            if (fs.existsSync(fileRootPath + url)) {
              preview = url;
              break;
            }
          }

          if (preview) {
            fileDesc.preview = preview;
          }

          fileDesc.model = `${fileDesc.url}/${model}`;
          fileDesc.url = `${fileDesc.url}/${model}`;
          fileDesc.name = model;
          fileDesc.ext = path.extname(model);
          fileDesc.size = stats.size;

          break;
        }
      }

      resultList.push(fileDesc);
      index += 1;
    }

    return resultList;
  }

  async getComponentStructure({ role, id, url }: Omit<FileDTO, 'type'>) {
    const filePath = this.getFilePath({ role, type: 'components', id, url });
    const fileRootPath = this.getFileRootPath({
      role,
      type: 'components',
      id,
    });

    if (!fs.existsSync(filePath)) {
      this.logger.error(
        `文件不存在 ---> ${filePath}`,
        '',
        this.constructor.name + '.getComponentStructure',
      );
      throw new InternalServerErrorException('文件不存在！');
    }

    if (fs.statSync(filePath).isFile()) {
      this.logger.error(
        `无法获取结构 ---> ${filePath}`,
        '',
        this.constructor.name + '.getComponentStructure',
      );
      throw new InternalServerErrorException('无法获取结构！');
    }

    const files = await FileUtil.readdir(filePath);
    const statsFiles = await FileUtil.readdirStats(files, filePath);

    const resultList: ComponentFileDescDTO[] = [];

    let index = 0;
    for (const stats of statsFiles) {
      // 只要该路径下面的文件中有一个是非文件夹文件，就是非法的
      // 因为无法直接从服务中获取直接的模型包
      if (stats.isFile()) {
        this.logger.error(
          `非法的文件路径！ ---> ${filePath}`,
          '',
          this.constructor.name + '.getComponentStructure',
        );
        throw new InternalServerErrorException('非法的文件路径！');
      }

      const fileDesc = new ComponentFileDescDTO({
        dir: true,
        size: stats.size,
        ext: path.extname(files[index]),
        url: `${url}/${files[index]}`,
        name: files[index],
      });

      // 遍历所有的子文件夹
      const childFiles = await FileUtil.readdir(`${filePath}/${files[index]}`);
      const childStatsFiles = await FileUtil.readdirStats(
        childFiles,
        `${filePath}/${files[index]}`,
      );

      // 找子文件的package.json和预览图
      for (const stats of childStatsFiles) {
        if (stats.isFile()) {
          // 有一个是文件，说明是模型文件夹
          fileDesc.dir = false;
          const isPackage = childFiles.find((file) => file === 'package.json');

          if (!isPackage) {
            this.logger.error(
              `文件解析出现错误 ---> ${childFiles.join(',')}`,
              '',
              this.constructor.name + '.getModelStructure',
            );
            throw new InternalServerErrorException('文件解析出现错误！');
          }

          let preview = '';

          for (const key in IMAGE_EXT) {
            const url = `${fileDesc.url}/preview${key}`;

            if (fs.existsSync(fileRootPath + url)) {
              preview = url;
              break;
            }
          }

          if (preview) {
            fileDesc.preview = preview;
          }

          const packageJSON = JSON.parse(
            fs
              .readFileSync(fileRootPath + fileDesc.url + '/package.json')
              .toString(),
          );

          fileDesc.packageJSON = packageJSON;
          fileDesc.url = `${fileDesc.url}${
            packageJSON.module || packageJSON.main
          }`;
          fileDesc.name = packageJSON.name;
          fileDesc.ext = 'component';
          fileDesc.size = stats.size;
          fileDesc.component = fileDesc.component;
          fileDesc.packageJSON = packageJSON;
          break;
        }
      }

      resultList.push(fileDesc);
      index += 1;
    }

    return resultList;
  }

  /**
   * 获取文件
   * @param param0
   * @returns
   */
  getStreamableFile({ role, type, id, url }: FileDTO) {
    const filePath = this.getFilePath({ role, type, id, url });

    if (!fs.existsSync(filePath)) {
      this.logger.error(
        `文件不存在 ---> ${filePath}`,
        '',
        this.constructor.name + '.getStreamableFile',
      );
      throw new InternalServerErrorException('文件不存在！');
    }

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  /**
   * 添加分类
   * @param classify
   * @returns
   */
  async addClassify(classify: ClassifyDTO) {
    const filePath = this.getFilePath(classify);
    const classifyPath = `${filePath}/${classify.classifyName}`;

    if (fs.existsSync(classifyPath)) {
      this.logger.error(
        `分类已经存: ---> ${classifyPath}`,
        '',
        this.constructor.name + '.addClassify',
      );
      throw new InternalServerErrorException('分类已经存在！');
    }

    try {
      fs.mkdirSync(classifyPath);
    } catch (error) {
      this.logger.error(
        `分类创建失败: ---> ${classifyPath}`,
        '',
        this.constructor.name + '.addClassify',
      );
      throw new InternalServerErrorException('分类创建失败！');
    }

    return new FileDescDTO({
      dir: true,
      size: 0,
      ext: '',
      url: `${classify.url}/${classify.classifyName}`,
      name: classify.classifyName,
    });
  }

  /**
   * 上传模型
   * @param uploadFile
   */
  async uploadModel(uploadFile: UploadFileDTO) {
    const tempFilePath = uploadFile.uploadPath;
    const targetFilePath =
      this.getFilePath(uploadFile) + `/${uploadFile.originalname}`;

    // 判断文件格式
    const ext = path.extname(uploadFile.originalname);

    if (!(ext.toLocaleLowerCase() in COMPRESS_EXT)) {
      this.logger.error(
        `文件格式有误: ---> ${uploadFile.originalname}`,
        '',
        this.constructor.name + '.uploadModel',
      );
      throw new InternalServerErrorException('文件格式有误！');
    }

    const base = path.basename(uploadFile.originalname, ext);
    const targetDirPath = this.getFilePath(uploadFile) + `/${base}`;

    if (!fs.existsSync(tempFilePath)) {
      this.logger.error(
        `文件路径有误: ---> ${tempFilePath}`,
        '',
        this.constructor.name + '.uploadModel',
      );

      // 删除临时文件
      await FileUtil.unlink(tempFilePath);

      throw new InternalServerErrorException('文件路径有误！');
    }

    if (fs.existsSync(targetDirPath)) {
      this.logger.error(
        `文件重复: ---> ${targetDirPath}`,
        '',
        this.constructor.name + '.uploadModel',
      );

      // 删除临时文件
      await FileUtil.unlink(tempFilePath);

      throw new InternalServerErrorException('文件重复！');
    }

    // 先转移文件
    await FileUtil.copyFile(tempFilePath, targetFilePath);
    // 删除临时文件
    await FileUtil.unlink(tempFilePath);

    const uncompressPath = this.getFilePath(uploadFile);
    // 解压文件
    await FileUtil.uncompress(ext, targetFilePath, uncompressPath);

    // 删除压缩包
    await FileUtil.unlink(targetFilePath);

    // 判断解压文件中是否有根文件夹
    if (!fs.existsSync(targetDirPath)) {
      await FileUtil.mkdir(targetDirPath);
      const files = await FileUtil.readdir(uncompressPath);
      files.forEach((file) => {
        if (file !== base) {
          fs.renameSync(
            path.resolve(uncompressPath, `./${file}`),
            path.resolve(targetDirPath, `./${file}`),
          );
        }
      });
    }

    // 检测模型文件的格式
    const files = await FileUtil.readdir(targetDirPath);

    const modelFile = files.find(
      (file) => path.extname(file).toLocaleLowerCase() in MODEL_EXT,
    );

    if (!modelFile) {
      // 删除文件夹
      await FileUtil.rmdir(targetDirPath);
      throw new InternalServerErrorException(
        '压缩文件根目录未找到有效模型文件！',
      );
    }

    const stats = fs.statSync(targetDirPath + `/${modelFile}`);

    const result = new ModelFileDescDTO({
      dir: false,
      size: stats.size,
      ext: path.extname(modelFile),
      url: `${uploadFile.url}/${base}/${modelFile}`,
      name: modelFile,
      model: `${uploadFile.url}/${base}/${modelFile}`,
    });

    let preview = '';

    for (const key in IMAGE_EXT) {
      const url = `${targetDirPath}/preview${key}`;

      if (fs.existsSync(url)) {
        preview = `${uploadFile.url}/${base}/preview${key}`;
        break;
      }
    }

    if (preview) {
      result.preview = preview;
    }

    return result;
  }

  /**
   * 上传模型
   * @param uploadFile
   */
  async uploadComponent(uploadFile: UploadFileDTO) {
    const tempFilePath = uploadFile.uploadPath;
    const targetFilePath =
      this.getFilePath(uploadFile) + `/${uploadFile.originalname}`;

    // 判断文件格式
    const ext = path.extname(uploadFile.originalname);

    if (!(ext.toLocaleLowerCase() in COMPRESS_EXT)) {
      this.logger.error(
        `文件格式有误: ---> ${uploadFile.originalname}`,
        '',
        this.constructor.name + '.uploadModel',
      );
      throw new InternalServerErrorException('文件格式有误！');
    }

    const base = path.basename(uploadFile.originalname, ext);
    const targetDirPath = this.getFilePath(uploadFile) + `/${base}`;

    if (!fs.existsSync(tempFilePath)) {
      this.logger.error(
        `文件路径有误: ---> ${tempFilePath}`,
        '',
        this.constructor.name + '.uploadModel',
      );

      // 删除临时文件
      await FileUtil.unlink(tempFilePath);

      throw new InternalServerErrorException('文件路径有误！');
    }

    if (fs.existsSync(targetDirPath)) {
      this.logger.error(
        `文件重复: ---> ${targetDirPath}`,
        '',
        this.constructor.name + '.uploadModel',
      );

      // 删除临时文件
      await FileUtil.unlink(tempFilePath);

      throw new InternalServerErrorException('文件重复！');
    }

    // 先转移文件
    await FileUtil.copyFile(tempFilePath, targetFilePath);
    // 删除临时文件
    await FileUtil.unlink(tempFilePath);

    const uncompressPath = this.getFilePath(uploadFile);
    // 解压文件
    await FileUtil.uncompress(ext, targetFilePath, uncompressPath);

    // 删除压缩包
    await FileUtil.unlink(targetFilePath);

    // 判断解压文件中是否有根文件夹
    if (!fs.existsSync(targetDirPath)) {
      await FileUtil.mkdir(targetDirPath);
      const files = await FileUtil.readdir(uncompressPath);
      files.forEach((file) => {
        if (file !== base) {
          fs.renameSync(
            path.resolve(uncompressPath, `./${file}`),
            path.resolve(targetDirPath, `./${file}`),
          );
        }
      });
    }

    // 检测模型文件的格式
    const files = await FileUtil.readdir(targetDirPath);

    const hasPackage = files.find((file) => file === 'package.json');

    if (!hasPackage) {
      // 删除文件夹
      await FileUtil.rmdir(targetDirPath);
      throw new InternalServerErrorException(
        '压缩文件根目录未找到有效npm文件！',
      );
    }

    const stats = fs.statSync(targetDirPath + `/${hasPackage}`);

    const packageJSON = JSON.parse(
      fs.readFileSync(targetDirPath + `/${hasPackage}`).toString(),
    );

    const result = new ComponentFileDescDTO({
      dir: false,
      size: stats.size,
      ext: 'component',
      url: `${uploadFile.url}/${base}/${
        packageJSON.module || packageJSON.main
      }`,
      component: `${uploadFile.url}/${base}/${
        packageJSON.module || packageJSON.main
      }`,
      name: packageJSON.name,
      packageJSON: packageJSON,
    });

    let preview = '';

    for (const key in IMAGE_EXT) {
      const url = `${targetDirPath}/preview${key}`;

      if (fs.existsSync(url)) {
        preview = `${uploadFile.url}/${base}/preview${key}`;
        break;
      }
    }

    if (preview) {
      result.preview = preview;
    }

    return result;
  }
}
