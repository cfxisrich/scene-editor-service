import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import COMPRESS_EXT from '../constants/COMPRESS_EXT';
import RESOURCES_PATH, { TEXTURE_PATH } from '../constants/RESOURCES_PATH';
import { AddClassifyDTO, UploadModelDTO } from '../DTO/model.dto';
import path from 'path';
import { Cache } from 'cache-manager';
import fs from 'fs';
import FileUtil from '../util/FileUtil';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import IMAGE_EXT from '../constants/IMAGE_EXT';
import { Texture } from '../entity/texture.entity';
import { TextureClassify } from '../entity/texture-classify.entity';
import { UploadTextureDTO } from '../DTO/texture.dto';
import { TextureClassifyDetailVO, TextureDetailVO } from '../VO/texture.vo';
import TEXTURE_EXT from '../constants/TEXTURE_EXT';

@Injectable()
export class TextureService {
  private cacheTime = 30000;
  private rootPath = TEXTURE_PATH;

  constructor(
    private logger: Logger,
    @InjectRepository(Texture) private textureRepository: Repository<Texture>,
    @InjectRepository(TextureClassify)
    private textureClassifyRepo: Repository<TextureClassify>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 存key
  private getCacheKey(id: number) {
    return `TEXTURE_PACKAGE--${id}`;
  }

  private transPath(url: string) {
    return url.replace(new RegExp(RESOURCES_PATH.replace(/\\/g, '/'), 'g'), '');
  }
  // 上传贴图
  async uploadTexture(
    uploadFiles: Array<UploadTextureDTO>,
  ): Promise<TextureDetailVO[]> {
    const result: TextureDetailVO[] = [];
    for (const uploadFile of uploadFiles) {
      // 文件格式校验
      const ext = path.extname(uploadFile.originalname);
      const base = path.basename(uploadFile.originalname, ext);

      const tempFilePath = uploadFile.uploadPath;

      if (!(ext.toLocaleLowerCase() in TEXTURE_EXT)) {
        this.logger.error(
          `文件格式有误: ---> ${uploadFile.originalname}`,
          '',
          this.constructor.name + '.uploadTexture',
        );
        await FileUtil.unlink(tempFilePath);
        throw new InternalServerErrorException('文件格式有误！');
      }

      // 临时文件存在校验
      if (!fs.existsSync(tempFilePath)) {
        this.logger.error(
          `文件路径有误: ---> ${tempFilePath}`,
          '',
          this.constructor.name + '.uploadTexture',
        );
        await FileUtil.unlink(tempFilePath);
        throw new InternalServerErrorException('文件路径有误！');
      }

      const resourceName = `${base}-${new Date().getTime()}${ext}`;
      const targetPath = path.resolve(this.rootPath, `./${resourceName}`);

      // 目标文件夹校验
      if (fs.existsSync(targetPath)) {
        this.logger.error(
          `文件重复: ---> ${targetPath}`,
          '',
          this.constructor.name + '.uploadTexture',
        );

        // 删除临时文件
        await FileUtil.unlink(tempFilePath);

        throw new InternalServerErrorException('文件重复！');
      }

      await FileUtil.copyFile(tempFilePath, targetPath);
      await FileUtil.unlink(tempFilePath);

      // 文件尺寸
      const size = fs.statSync(targetPath).size;

      // 检查预览图
      let preview = '';

      if (ext in IMAGE_EXT) {
        preview = resourceName;
      }

      // 插入数据库
      const textureEntity = new Texture({
        classifyId: uploadFile.classifyId,
        packageName: uploadFile.packageName,
        resourceName,
        previewName: preview || null,
        packagePath: this.rootPath.replace(/\\/g, '/'),
        size,
        ext,
      });

      try {
        const insertResult = await this.textureRepository.insert(textureEntity);
        if (!insertResult.identifiers.length) {
          // 删除文件
          await FileUtil.unlink(targetPath);

          this.logger.error(
            `数据库插入失败: ---> ${JSON.stringify(textureEntity)}`,
            '',
            this.constructor.name + '.uploadModel',
          );
          throw new InternalServerErrorException(`服务器有误！`);
        }

        const id = insertResult.identifiers[0].id;

        result.push(
          new TextureDetailVO({
            id,
            size,
            name: uploadFile.packageName,
            texture: this.transPath(
              `${textureEntity.packagePath}/${textureEntity.resourceName}`,
            ),
            preview: textureEntity.previewName
              ? this.transPath(
                  `${textureEntity.packagePath}/${textureEntity.previewName}`,
                )
              : '',
            classifyId: uploadFile.classifyId,
            ext,
          }),
        );
      } catch (error) {
        // 删除文件
        await FileUtil.unlink(targetPath);
        throw error;
      }
    }

    return result;
  }

  // 获取结构
  async getStructure(classifyId: number | null) {
    const classify = await this.textureClassifyRepo.find({
      where: {
        parentId: classifyId || IsNull(),
        delete: false,
      },
    });

    const structureList: Array<TextureDetailVO | TextureClassifyDetailVO> = [];

    structureList.push(
      ...classify.map((elem) => {
        return new TextureClassifyDetailVO({
          id: elem.id,
          name: elem.classifyName,
          dir: true,
          level: elem.level,
          parentId: elem.parentId,
        });
      }),
    );

    if (classifyId) {
      const models = await this.textureRepository.find({
        where: {
          classifyId,
          delete: false,
        },
      });

      structureList.push(
        ...models.map((elem) => {
          return new TextureDetailVO({
            id: elem.id,
            name: elem.packageName,
            texture: this.transPath(`${elem.packagePath}/${elem.resourceName}`),
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
    let models = (await this.cacheManager.get(this.getCacheKey(id))) as Texture;

    if (!models) {
      models = await this.textureRepository.findOne({
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
    let models = (await this.cacheManager.get(this.getCacheKey(id))) as Texture;

    if (!models) {
      models = await this.textureRepository.findOne({
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
      ? await this.textureClassifyRepo.findOne({
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

    const result = await this.textureClassifyRepo.insert(
      new TextureClassify({
        classifyName: param.name,
        parentId: param.parentId,
        level: parentClassify.level + 1,
      }),
    );

    if (result.identifiers.length) {
      return new TextureClassifyDetailVO({
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
    const models = await this.textureRepository.findOne({
      where: {
        id,
        delete: false,
      },
    });

    if (!models) {
      return true;
    }

    // 数据库删除
    const result = await this.textureRepository.update(
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
  async removeClassify(id: number, userId: number) {
    // 分类下没东西才删除
    const childClassifyCount = await this.textureClassifyRepo.count({
      where: {
        parentId: id,
        delete: false,
      },
    });

    if (childClassifyCount) {
      this.logger.error(
        `存在子分类，请先删除子分类 ---> id：${id}， userId：${userId}`,
        '',
        this.constructor.name + '.removeClassify',
      );
      throw new InternalServerErrorException('存在子分类，请先删除子分类！');
    }

    const modelsCount = await this.textureRepository.count({
      where: {
        classifyId: id,
        delete: false,
      },
    });

    if (modelsCount) {
      this.logger.error(
        `存在子模型，请先删除子模型 ---> id：${id}， userId：${userId}`,
        '',
        this.constructor.name + '.removeClassify',
      );
      throw new InternalServerErrorException('存在子模型，请先删除子模型！');
    }

    const result = await this.textureClassifyRepo.update(
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
    return await this.textureRepository.findOne({
      where: {
        id,
        delete: false,
      },
    });
  }
}
