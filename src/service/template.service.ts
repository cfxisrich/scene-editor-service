import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import RESOURCES_PATH, { TEMPLATE_PATH } from '../constants/RESOURCES_PATH';
import path from 'path';
import fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import FileUtil from '../util/FileUtil';
import ImageUtil from '../util/ImageUtil';
import { AddClassifyDTO } from '../DTO/model.dto';
import { AppClassifyDetailVO, AppDetailVO } from '../VO/app.vo';
import { LogServerErrorException } from '../exception/LogServerErrorException';
import { Template } from '../entity/template.entity';
import { TemplateClassify } from '../entity/template-classify.entity';
import {
  AddTemplateDTO,
  TemplateClassifyDetailDTO,
  TemplateDetailDTO,
  TemplateModifyDTO,
} from '../DTO/template.dto';
import { TemplateDetailVO } from '../VO/template.vo';

@Injectable()
export class TemplateService {
  private rootPath = TEMPLATE_PATH;
  private packageStructure = {
    config: 'template.json',
    preview: 'preview.png',
  };

  constructor(
    @InjectRepository(Template) private tplRepo: Repository<Template>,
    @InjectRepository(TemplateClassify)
    private tplClassifyRepo: Repository<TemplateClassify>,
    private logger: Logger,
  ) {}

  private transPath(url: string) {
    return url
      .replace(/\\/g, '/')
      .replace(new RegExp(RESOURCES_PATH.replace(/\\/g, '/'), 'g'), '');
  }

  // 添加一个应用
  async addTemplate(template: AddTemplateDTO) {
    const newOne = await this.tplRepo.insert(
      new Template({
        classifyId: template.classifyId,
        templateName: template.templateName,
        packagePath: this.rootPath,
        previewName: this.packageStructure.preview,
      }),
    );

    if (!newOne.identifiers.length) {
      throw new InternalServerErrorException('添加失败！');
    }

    const resultTpl = newOne.identifiers[0];

    // 创建应用文件夹
    const tplDir = path.resolve(this.rootPath, `./${resultTpl.id}`);

    if (fs.existsSync(tplDir)) {
      await this.tplRepo.update(
        { id: resultTpl.id },
        {
          delete: true,
        },
      );

      throw new LogServerErrorException(
        '已经存在相关模板, 请重试',
        `${resultTpl.id}：{packagePath: ${tplDir}, previewName: 'preview.png'}`,
        this,
        'addTemplate',
      );
    }

    await FileUtil.mkdir(tplDir);

    const createFilePromiseList = [];

    Object.values(this.packageStructure).forEach((filename) => {
      const url = path.resolve(tplDir, `./${filename}`);
      createFilePromiseList.push(FileUtil.writeFile(url, ''));
    });

    await Promise.all(createFilePromiseList);

    if (template.preview.length) {
      await FileUtil.writeFile(
        `${tplDir}/${this.packageStructure.preview}`,
        ImageUtil.decodeBase64(template.preview),
      );
    }

    const result = await this.tplRepo.update(
      { id: resultTpl.id },
      {
        packagePath: tplDir,
        previewName: this.packageStructure.preview,
      },
    );

    if (!result.affected) {
      throw new LogServerErrorException(
        '更新失败！',
        `${resultTpl.id}：{packagePath: ${tplDir}, previewName: 'preview.png'}`,
        this,
        'addApps',
      );
    }

    return new AppDetailVO({
      id: resultTpl.id,
      name: template.templateName,
      classifyId: template.classifyId,
      modifyTime: new Date().toISOString(),
      preview: this.transPath(`${tplDir}/${this.packageStructure.preview}`),
      app: this.transPath(`${tplDir}/${this.packageStructure.config}`),
    });
  }

  // 获取结构
  async getStructure(classifyId: number | null) {
    const classify = await this.tplClassifyRepo.find({
      where: {
        parentId: classifyId || IsNull(),
        delete: false,
      },
    });

    const structureList: Array<TemplateDetailDTO | TemplateClassifyDetailDTO> =
      [];

    structureList.push(
      ...classify.map((elem) => {
        return new AppClassifyDetailVO({
          id: elem.id,
          name: elem.classifyName,
          dir: true,
          level: elem.level,
          parentId: elem.parentId,
        });
      }),
    );

    if (classifyId) {
      const models = await this.tplRepo.find({
        where: {
          classifyId,
          delete: false,
        },
      });

      structureList.push(
        ...models.map((elem) => {
          return new TemplateDetailVO({
            id: elem.id,
            name: elem.createTime,
            preview: this.transPath(
              `${elem.packagePath}/${this.packageStructure.preview}`,
            ),
            config: this.transPath(
              `${elem.packagePath}/${this.packageStructure.config}`,
            ),
            classifyId: elem.classifyId,
          });
        }),
      );
    }

    return structureList;
  }

  async getClassifyList(parentId: number | null) {
    const result = await this.tplClassifyRepo.find({
      where: {
        parentId: parentId ? parentId : IsNull(),
        delete: false,
      },
    });

    return result.map((elem) => {
      return new AppClassifyDetailVO({
        id: elem.id,
        name: elem.classifyName,
        dir: true,
        level: elem.level,
        parentId: elem.parentId,
      });
    });
  }

  // 获取一个模板
  async getTemplate(id: number) {
    const repo = await this.tplRepo.findOne({
      where: {
        id,
        delete: false,
      },
    });

    if (!repo) {
      throw new LogServerErrorException(
        '找不到相关项目',
        ` id:${id}`,
        this,
        'getApp',
      );
    }

    return new AppDetailVO({
      id: repo.id,
      name: repo.templateName,
      classifyId: repo.classifyId,
      modifyTime: repo.modifyTime,
      preview: this.transPath(
        `${repo.packagePath}/${this.packageStructure.preview}`,
      ),
      app: this.transPath(
        `${repo.packagePath}/${this.packageStructure.config}`,
      ),
    });
  }

  // 修改一个应用
  async modifyTemplate(modify: TemplateModifyDTO) {
    const appPath = path.resolve(this.rootPath, `./${modify.id}`);

    if (!fs.existsSync(appPath)) {
      throw new LogServerErrorException(
        '找不到相关路径！',
        appPath,
        this,
        'modifyTemplate',
      );
    }

    await Promise.all([
      FileUtil.writeFile(
        `${appPath}/${this.packageStructure.config}`,
        modify.config,
      ),
      FileUtil.writeFile(
        `${appPath}/${this.packageStructure.preview}`,
        ImageUtil.decodeBase64(modify.preview),
      ),
    ]);

    return true;
  }

  // 添加分类
  async addClassify(param: AddClassifyDTO) {
    const parentClassify = param.parentId
      ? await this.tplClassifyRepo.findOne({
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

    const result = await this.tplClassifyRepo.insert(
      new TemplateClassify({
        classifyName: param.name,
        parentId: param.parentId,
        level: parentClassify.level + 1,
      }),
    );

    if (result.identifiers.length) {
      return new AppClassifyDetailVO({
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

  // 删除分类
  async removeClassify(id: number, userId: number) {
    // 分类下没东西才删除
    const childClassifyCount = await this.tplClassifyRepo.count({
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

    const appsCount = await this.tplRepo.count({
      where: {
        classifyId: id,
        delete: false,
      },
    });

    if (appsCount) {
      this.logger.error(
        `存在项目 ---> id：${id}， userId：${userId}`,
        '',
        this.constructor.name + '.removeClassify',
      );
      throw new InternalServerErrorException('存在项目');
    }

    const result = await this.tplClassifyRepo.update(
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
}
