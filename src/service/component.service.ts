import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UploadComponentDTO } from '../DTO/component.dto';
import { ComponentClassify } from '../entity/component-classify.entity';
import { Component } from '../entity/component.entity';
import { Cache } from 'cache-manager';

import {
  ComponentClassifyDetailVO,
  ComponentDetailVO,
} from '../VO/component.vo';

import path from 'path';
import fs from 'fs';

import COMPRESS_EXT from '../constants/COMPRESS_EXT';
import RESOURCES_PATH, { COMPONENT_PATH } from '../constants/RESOURCES_PATH';
import FileUtil from '../util/FileUtil';
import IMAGE_EXT from '../constants/IMAGE_EXT';
import { AddClassifyDTO } from '../DTO/model.dto';

@Injectable()
export class ComponentService {
  private sizeLimit = 31457280;

  private cacheTime = 30000;

  private rootPath = COMPONENT_PATH;
  constructor(
    @InjectRepository(Component)
    private ComponentRepo: Repository<Component>,
    @InjectRepository(ComponentClassify)
    private componentClassifyRepo: Repository<ComponentClassify>,
    private logger: Logger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKey(id: number) {
    return `COMPONENT_PACKAGE--${id}`;
  }

  private transPath(url: string) {
    return url.replace(new RegExp(RESOURCES_PATH.replace(/\\/g, '/'), 'g'), '');
  }

  /**
   * 上传组件
   * @param uploadFile
   */
  async uploadComponent(
    uploadFile: UploadComponentDTO,
  ): Promise<ComponentDetailVO> {
    // 文件格式校验
    const ext = path.extname(uploadFile.originalname);
    const base = path.basename(uploadFile.originalname, ext);

    if (!(ext.toLocaleLowerCase() in COMPRESS_EXT)) {
      this.logger.error(
        `文件格式有误: ---> ${uploadFile.originalname}`,
        '',
        this.constructor.name + '.uploadComponent',
      );
      throw new InternalServerErrorException('文件格式有误！');
    }

    const tempFilePath = uploadFile.uploadPath;
    const targetDirPath = this.rootPath + `/${base}-${new Date().getTime()}`;

    // 临时文件存在校验
    if (!fs.existsSync(tempFilePath)) {
      this.logger.error(
        `文件路径有误: ---> ${tempFilePath}`,
        '',
        this.constructor.name + '.uploadComponent',
      );

      throw new InternalServerErrorException('文件路径有误！');
    }

    // 目标文件夹校验
    if (fs.existsSync(targetDirPath)) {
      this.logger.error(
        `文件重复: ---> ${targetDirPath}`,
        '',
        this.constructor.name + '.uploadComponent',
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

    const pkgPath = files.find((file) => file === 'package.json');

    if (!pkgPath) {
      // 删除文件夹
      await FileUtil.rmdir(targetDirPath);

      this.logger.error(
        `压缩文件根目录未找到有效包文件: ---> ${JSON.stringify(
          files,
          null,
          '\t',
        )}`,
        '',
        this.constructor.name + '.uploadComponent',
      );
      throw new InternalServerErrorException(
        '压缩文件根目录未找到有效包文件！',
      );
    }

    const packageJSON = JSON.parse(
      fs.readFileSync(path.resolve(targetDirPath, `./${pkgPath}`)).toString(),
    );

    const filesStats = await FileUtil.readdirStats(files, targetDirPath);

    // 包文件尺寸
    const size = filesStats
      .map((stats) => stats.size)
      .reduce((sum, item) => sum + item);

    if (size > this.sizeLimit) {
      // 删除文件夹
      await FileUtil.rmdir(targetDirPath);

      throw new InternalServerErrorException(`解压包文件过大: ${size}`);
    }

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
    const ComponentEntity = new Component({
      classifyId: uploadFile.classifyId,
      packageDesp: packageJSON.description,
      packageName: packageJSON.name,
      packageEntry: packageJSON.module || packageJSON.main,
      packageVersion: packageJSON.version,
      previewName: preview || null,
      packagePath: targetDirPath.replace(/\\/g, '/'),
      size,
    });

    ComponentEntity.packageEntry = ComponentEntity.packageEntry.startsWith('/')
      ? ComponentEntity.packageEntry.slice(1)
      : ComponentEntity.packageEntry;

    try {
      const insertResult = await this.ComponentRepo.insert(ComponentEntity);
      if (!insertResult.identifiers.length) {
        // 删除文件夹
        await FileUtil.rmdir(targetDirPath);

        this.logger.error(
          `数据库插入失败: ---> ${JSON.stringify(ComponentEntity, null, '\t')}`,
          '',
          this.constructor.name + '.uploadComponent',
        );
        throw new InternalServerErrorException(`服务器有误！`);
      }

      const id = insertResult.identifiers[0].id;

      return new ComponentDetailVO({
        id,
        size,
        name: ComponentEntity.packageName,
        desp: ComponentEntity.packageDesp,
        entry: this.transPath(
          `${ComponentEntity.packagePath}/${
            ComponentEntity.packageEntry.startsWith('/')
              ? ComponentEntity.packageEntry.slice(1)
              : ComponentEntity.packageEntry
          }`,
        ),
        preview: this.transPath(
          `${ComponentEntity.packagePath}/${ComponentEntity.previewName}`,
        ),
        pkg: this.transPath(`${ComponentEntity.packagePath}/package.json`),
        classifyId: uploadFile.classifyId,
      });
    } catch (error) {
      // 删除文件夹
      await FileUtil.rmdir(targetDirPath);
      throw error;
    }
  }

  /**
   * 获取结构
   * @param userId
   * @param classifyId
   * @returns
   */
  async getStructure(classifyId: number | null) {
    const classify = await this.componentClassifyRepo.find({
      where: {
        parentId: classifyId || IsNull(),
        delete: false,
      },
    });

    const structureList: Array<ComponentDetailVO | ComponentClassifyDetailVO> =
      [];

    structureList.push(
      ...classify.map((elem) => {
        return new ComponentClassifyDetailVO({
          id: elem.id,
          name: elem.classifyName,
          dir: true,
          level: elem.level,
          parentId: elem.parentId,
        });
      }),
    );

    if (classifyId) {
      const models = await this.ComponentRepo.find({
        where: {
          classifyId,
          delete: false,
        },
      });

      structureList.push(
        ...models.map((elem) => {
          return new ComponentDetailVO({
            id: elem.id,
            name: elem.packageName,
            desp: elem.packageDesp,
            entry: this.transPath(
              `${elem.packagePath}/${
                elem.packageEntry.startsWith('/')
                  ? elem.packageEntry.slice(1)
                  : elem.packageEntry
              }`,
            ),
            preview: this.transPath(`${elem.packagePath}/${elem.previewName}`),
            pkg: this.transPath(`${elem.packagePath}/package.json`),
            classifyId: elem.classifyId,
          });
        }),
      );
    }

    return structureList;
  }

  /**
   * 添加分类
   * @param param
   * @returns
   */
  async addClassify(param: AddClassifyDTO) {
    const parentClassify = param.parentId
      ? await this.componentClassifyRepo.findOne({
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

    const result = await this.componentClassifyRepo.insert(
      new ComponentClassify({
        classifyName: param.name,
        parentId: param.parentId,
        level: parentClassify.level + 1,
      }),
    );

    if (result.identifiers.length) {
      return new ComponentClassifyDetailVO({
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
   * 删除分类
   */
  async removeClassify(id: number) {
    // 分类下没东西才删除
    const childClassifyCount = await this.componentClassifyRepo.count({
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

    const modelsCount = await this.ComponentRepo.count({
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

    const result = await this.componentClassifyRepo.update(
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

  /**
   * 获取预览流
   * @param param0
   * @returns
   */
  async getPreviewStreamableFile(userId: number, id: number) {
    let Component = (await this.cacheManager.get(
      this.getCacheKey(id),
    )) as Component;

    if (!Component) {
      Component = await this.ComponentRepo.findOne({
        where: {
          id,
          delete: false,
        },
      });

      this.cacheManager.set(this.getCacheKey(id), Component, {
        ttl: this.cacheTime,
      });
    }

    const filePath = `${Component.packagePath}/${Component.previewName}`;

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

  async getComponentDetail(id: number, userId: number) {
    const Component = await this.ComponentRepo.findOne({
      where: {
        id,
        delete: false,
      },
    });

    if (!Component) {
      this.logger.error(
        `不存在此组件 ---> id：${id}， userId：${userId}`,
        '',
        this.constructor.name + '.getComponentDetail',
      );
      throw new InternalServerErrorException('不存在此组件！');
    }

    return new ComponentDetailVO({
      id: Component.id,
      name: Component.packageDesp,
      entry: `/Component/component/${Component.id}/${Component.packageEntry}`,
      preview: `/Component/preview/${Component.id}`,
      pkg: `/Component/pkg/${Component.id}`,
      classifyId: Component.classifyId,
    });
  }

  async getComponentEntity(id: number) {
    return await this.ComponentRepo.findOne({
      where: {
        id,
        delete: false,
      },
    });
  }

  /**
   * 删除模型
   */
  async removeComponent(id: number) {
    const Component = await this.ComponentRepo.findOne({
      where: {
        id,
        delete: false,
      },
    });

    if (!Component) {
      return true;
    }

    // 数据库删除
    const result = await this.ComponentRepo.update(
      { id, delete: false },
      {
        delete: true,
      },
    );

    if (!result.affected) {
      this.logger.error(
        `删除模型失败！ ---> id：${id}`,
        '',
        this.constructor.name + '.removeComponent',
      );
      throw new InternalServerErrorException('删除组件包失败！');
    }

    // 删除本地文件
    await FileUtil.rmdir(Component.packagePath);

    return true;
  }
}
