import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import COMPRESS_EXT from '../constants/COMPRESS_EXT';
import RESOURCES_PATH, { MODEL_PATH } from '../constants/RESOURCES_PATH';
import { AddClassifyDTO, UploadModelDTO } from '../DTO/model.dto';
import path from 'path';
import { Cache } from 'cache-manager';
import fs from 'fs';
import FileUtil from '../util/FileUtil';
import MODEL_EXT from '../constants/MODEL_EXT';
import { ModelClassifyDetailVO, ModelDetailVO } from '../VO/model.vo';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from '../entity/model.entiry';
import { IsNull, Repository } from 'typeorm';
import { ModelClassify } from '../entity/model-classify.entity';
import IMAGE_EXT from '../constants/IMAGE_EXT';

@Injectable()
export class ModelService {
  private cacheTime = 30000;
  private rootPath = MODEL_PATH;

  constructor(
    private logger: Logger,
    @InjectRepository(Model) private modelsRepository: Repository<Model>,
    @InjectRepository(ModelClassify)
    private modelClassifyRepo: Repository<ModelClassify>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 存key
  private getCacheKey(id: number) {
    return `MODEL_PACKAGE--${id}`;
  }

  private transPath(url: string) {
    return url.replace(new RegExp(RESOURCES_PATH.replace(/\\/g, '/'), 'g'), '');
  }
  /**
   * 上传模型
   * @param uploadFile
   */
  async uploadModel(uploadFile: UploadModelDTO): Promise<ModelDetailVO> {
    // 文件格式校验
    const ext = path.extname(uploadFile.originalname);
    const base = path.basename(uploadFile.originalname, ext);

    if (!(ext.toLocaleLowerCase() in COMPRESS_EXT)) {
      this.logger.error(
        `文件格式有误: ---> ${uploadFile.originalname}`,
        '',
        this.constructor.name + '.uploadModel',
      );
      throw new InternalServerErrorException('文件格式有误！');
    }

    const tempFilePath = uploadFile.uploadPath;
    const targetDirPath = path.resolve(
      this.rootPath,
      `./${base}-${new Date().getTime()}`,
    );

    // 临时文件存在校验
    if (!fs.existsSync(tempFilePath)) {
      this.logger.error(
        `文件路径有误: ---> ${tempFilePath}`,
        '',
        this.constructor.name + '.uploadModel',
      );

      throw new InternalServerErrorException('文件路径有误！');
    }

    // 目标文件夹校验
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

    // 新建目标文件夹
    await FileUtil.mkdir(targetDirPath);

    // 解压文件
    await FileUtil.uncompress(ext, tempFilePath, targetDirPath);

    // 删除压缩包
    await FileUtil.unlink(tempFilePath);

    // 检测模型文件的格式
    const files = await FileUtil.readdir(targetDirPath);

    const modelFile = files.find(
      (file) => path.extname(file).toLocaleLowerCase() in MODEL_EXT,
    );

    if (!modelFile) {
      // 删除文件夹
      await FileUtil.rmdir(targetDirPath);

      this.logger.error(
        `数据库插入失败: ---> ${JSON.stringify(files, null, '\t')}`,
        '',
        this.constructor.name + '.uploadModel',
      );
      throw new InternalServerErrorException(
        '压缩文件根目录未找到有效模型文件！',
      );
    }

    const filesStats = await FileUtil.readdirStats(files, targetDirPath);

    // 模型文件尺寸
    const size = filesStats
      .map((stats) => stats.size)
      .reduce((sum, item) => sum + item);

    // 检查预览图
    let preview = '';

    for (const key in IMAGE_EXT) {
      const url = `${targetDirPath}/preview${key}`;

      if (fs.existsSync(url)) {
        preview = `preview${key}`;
        break;
      }
    }

    // 插入数据库
    const modelsEntity = new Model({
      classifyId: uploadFile.classifyId,
      packageName: uploadFile.packageName,
      modelName: modelFile,
      previewName: preview || null,
      packagePath: targetDirPath
        .replace(/\\/g, '/')
        .replace(new RegExp(this.rootPath, 'g'), '/'),
      size,
      ext,
    });

    try {
      const insertResult = await this.modelsRepository.insert(modelsEntity);
      if (!insertResult.identifiers.length) {
        // 删除文件夹
        await FileUtil.rmdir(targetDirPath);

        this.logger.error(
          `数据库插入失败: ---> ${JSON.stringify(modelsEntity)}`,
          '',
          this.constructor.name + '.uploadModel',
        );
        throw new InternalServerErrorException(`服务器有误！`);
      }

      const id = insertResult.identifiers[0].id;

      return new ModelDetailVO({
        id,
        size,
        name: uploadFile.packageName,
        model: this.transPath(
          `${modelsEntity.packagePath}/${modelsEntity.modelName}`,
        ),
        preview: modelsEntity.previewName
          ? this.transPath(
              `${modelsEntity.packagePath}/${modelsEntity.previewName}`,
            )
          : '',
        classifyId: uploadFile.classifyId,
        ext,
      });
    } catch (error) {
      // 删除文件夹
      await FileUtil.rmdir(targetDirPath);
      // 删除临时文件
      await FileUtil.unlink(tempFilePath);
      throw error;
    }
  }

  // 获取结构
  async getStructure(classifyId: number | null) {
    const classify = await this.modelClassifyRepo.find({
      where: {
        parentId: classifyId || IsNull(),
        delete: false,
      },
    });

    const structureList: Array<ModelDetailVO | ModelClassifyDetailVO> = [];

    structureList.push(
      ...classify.map((elem) => {
        return new ModelClassifyDetailVO({
          id: elem.id,
          name: elem.classifyName,
          dir: true,
          level: elem.level,
          parentId: elem.parentId,
        });
      }),
    );

    if (classifyId) {
      const models = await this.modelsRepository.find({
        where: {
          classifyId,
          delete: false,
        },
      });

      structureList.push(
        ...models.map((elem) => {
          return new ModelDetailVO({
            id: elem.id,
            name: elem.packageName,
            model: this.transPath(`${elem.packagePath}/${elem.modelName}`),
            preview: elem.previewName
              ? this.transPath(`${elem.packagePath}/${elem.previewName}`)
              : '',
            classifyId: elem.classifyId,
            ext: elem.ext,
          });
        }),
      );
    }

    return structureList;
  }

  /**
   * 获取预览流
   * @param param0
   * @returns
   */
  async getPreviewStreamableFile(userId: number, id: number) {
    let models = (await this.cacheManager.get(this.getCacheKey(id))) as Model;

    if (!models) {
      models = await this.modelsRepository.findOne({
        where: {
          id,
          delete: false,
        },
      });

      this.cacheManager.set(this.getCacheKey(id), models, {
        ttl: this.cacheTime,
      });
    }

    const filePath = `${models.packagePath}/${models.previewName}`;

    if (!fs.existsSync(filePath)) {
      this.logger.error(
        `文件不存在 ---> ${filePath}`,
        '',
        this.constructor.name + '.getPreviewStreamableFile',
      );
      throw new InternalServerErrorException('文件不存在！');
    }

    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }

  /**
   * 获取模型文件流
   * @param userId
   * @param id
   * @returns
   */
  async getModelStreamableFile(userId: number, id: number, url: string) {
    let models = (await this.cacheManager.get(this.getCacheKey(id))) as Model;

    if (!models) {
      models = await this.modelsRepository.findOne({
        where: {
          id,
          delete: false,
        },
      });

      this.cacheManager.set(this.getCacheKey(id), models, {
        ttl: this.cacheTime,
      });
    }

    const filePath = `${models.packagePath}/${url}`;

    if (!fs.existsSync(filePath)) {
      this.logger.error(
        `文件不存在 ---> ${filePath}`,
        '',
        this.constructor.name + '.getModelStreamableFile',
      );
      throw new InternalServerErrorException('文件不存在！');
    }

    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }

  /**
   * 添加分了
   * @param param
   * @returns
   */
  async addClassify(param: AddClassifyDTO) {
    const parentClassify = param.parentId
      ? await this.modelClassifyRepo.findOne({
          where: {
            id: param.parentId,
            delete: false,
          },
        })
      : {
          level: -1,
        };

    if (!parentClassify) {
      throw new InternalServerErrorException('不存在此父级！');
    }

    const result = await this.modelClassifyRepo.insert(
      new ModelClassify({
        classifyName: param.name,
        parentId: param.parentId,
        level: parentClassify.level + 1,
      }),
    );

    if (result.identifiers.length) {
      return new ModelClassifyDetailVO({
        id: result.identifiers[0].id,
        name: param.name,
        dir: true,
        level: parentClassify.level + 1,
        parentId: param.parentId,
      });
    } else {
      this.logger.error(
        `分类创建失败: ---> ${JSON.stringify(param, null, '\t')}`,
        '',
        this.constructor.name + '.addClassify',
      );
      throw new InternalServerErrorException('分类创建失败！');
    }
  }

  /**
   * 删除模型
   */
  async removeModel(id: number) {
    const models = await this.modelsRepository.findOne({
      where: {
        id,
        delete: false,
      },
    });

    if (!models) {
      return true;
    }

    // 数据库删除
    const result = await this.modelsRepository.update(
      { id, delete: false },
      {
        delete: true,
      },
    );

    if (!result.affected) {
      this.logger.error(
        `删除模型失败！ ---> id：${id}`,
        '',
        this.constructor.name + '.removeModel',
      );
      throw new InternalServerErrorException('删除模型失败！');
    }

    // 删除本地文件
    await FileUtil.rmdir(models.packagePath);

    return true;
  }

  /**
   * 删除分类
   */
  async removeClassify(id: number) {
    // 分类下没东西才删除
    const childClassifyCount = await this.modelClassifyRepo.count({
      where: {
        parentId: id,
        delete: false,
      },
    });

    if (childClassifyCount) {
      this.logger.error(
        `存在子分类，请先删除子分类 ---> id：${id}`,
        '',
        this.constructor.name + '.removeClassify',
      );
      throw new InternalServerErrorException('存在子分类，请先删除子分类！');
    }

    const modelsCount = await this.modelsRepository.count({
      where: {
        classifyId: id,
        delete: false,
      },
    });

    if (modelsCount) {
      this.logger.error(
        `存在子模型，请先删除子模型 ---> id：${id}`,
        '',
        this.constructor.name + '.removeClassify',
      );
      throw new InternalServerErrorException('存在子模型，请先删除子模型！');
    }

    const result = await this.modelClassifyRepo.update(
      {
        id,
        delete: false,
      },
      {
        delete: true,
      },
    );

    return Boolean(result.affected);
  }

  async getModelDetail(id: number) {
    return await this.modelsRepository.findOne({
      where: {
        id,
        delete: false,
      },
    });
  }
}
