import {
  Injectable,
  InternalServerErrorException,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import RESOURCES_PATH, {
  MODEL_PATH,
  TEXTURE_PATH,
} from '../constants/RESOURCES_PATH';
import { AppCreateDTO, AppDTO, AppModifyDTO } from '../DTO/app.dto';
import path from 'path';
import fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { App } from '../entity/app.entity';
import { AppClassify } from '../entity/app-classify.entity';
import { IsNull, Repository } from 'typeorm';
import FileUtil from '../util/FileUtil';
import ImageUtil from '../util/ImageUtil';
import { ModelService } from './model.service';
import { ComponentService } from './component.service';
import { AddClassifyDTO } from '../DTO/model.dto';
import { AppClassifyDetailVO, AppDetailVO } from '../VO/app.vo';
import { LogServerErrorException } from '../exception/LogServerErrorException';
import { LogBadRequestException } from '../exception/LogBadRequestException';

@Injectable()
export class AppService {
  private appsStructure = {
    config: 'app.json',
    preview: 'preview.png',
    dist: 'dist.zip',
  };

  private factoryPath = path.resolve(process.cwd(), `./packages/appFactory`);
  private rootPath = path.resolve(RESOURCES_PATH, './app');

  constructor(
    @InjectRepository(App) private appRepository: Repository<App>,
    @InjectRepository(AppClassify)
    private appClassifyRepo: Repository<AppClassify>,
    private logger: Logger,
    private modelService: ModelService,
    private componentService: ComponentService,
  ) {}

  private transPath(url: string) {
    return url
      .replace(/\\/g, '/')
      .replace(new RegExp(RESOURCES_PATH.replace(/\\/g, '/'), 'g'), '');
  }

  // 添加一个应用
  async addApp(app: AppCreateDTO) {
    const newOne = await this.appRepository.insert(
      new App({
        ...app,
        packagePath: this.rootPath,
        previewName: 'preview.png',
      }),
    );

    if (!newOne.identifiers.length) {
      throw new InternalServerErrorException('添加失败！');
    }

    const resultApp = newOne.identifiers[0];

    // 创建应用文件夹
    const appDir = path.resolve(this.rootPath, `./${resultApp.id}`);

    if (fs.existsSync(appDir)) {
      await this.appRepository.update(
        { id: resultApp.id },
        {
          delete: true,
        },
      );

      throw new LogServerErrorException(
        '已经存在相关项目, 请重试',
        `${resultApp.id}：{packagePath: ${appDir}, previewName: 'preview.png'}`,
        this,
        'addApps',
      );
    }

    await FileUtil.mkdir(appDir);

    const createFilePromiseList = [];

    Object.values(this.appsStructure).forEach((filename) => {
      const url = path.resolve(appDir, `./${filename}`);
      createFilePromiseList.push(FileUtil.writeFile(url, ''));
    });

    await Promise.all(createFilePromiseList);

    const result = await this.appRepository.update(
      { id: resultApp.id },
      {
        packagePath: appDir,
        previewName: this.appsStructure.preview,
      },
    );

    if (!result.affected) {
      throw new LogServerErrorException(
        '更新失败！',
        `${resultApp.id}：{packagePath: ${appDir}, previewName: 'preview.png'}`,
        this,
        'addApps',
      );
    }

    return new AppDetailVO({
      id: resultApp.id,
      name: app.appName,
      classifyId: app.classifyId,
      modifyTime: new Date().toISOString(),
      preview: this.transPath(`${appDir}/${this.appsStructure.preview}`),
      app: this.transPath(`${appDir}/${this.appsStructure.config}`),
    });
  }

  // 获取当前分类的所有应用
  async getAppList(userId: number, classifyId: number) {
    const result = await this.appRepository.find({
      where: {
        classifyId,
        delete: false,
      },
    });

    return result.map((elem) => {
      return new AppDetailVO({
        id: elem.id,
        name: elem.appName,
        classifyId: elem.classifyId,
        modifyTime: elem.modifyTime,
        preview: '',
        app: '',
      });
    });
  }

  // 获取结构
  async getStructure(classifyId: number | null) {
    const classify = await this.appClassifyRepo.find({
      where: {
        parentId: classifyId || IsNull(),
        delete: false,
      },
    });

    const structureList: Array<AppDetailVO | AppClassifyDetailVO> = [];

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
      const models = await this.appRepository.find({
        where: {
          classifyId,
          delete: false,
        },
      });

      structureList.push(
        ...models.map((elem) => {
          return new AppDetailVO({
            id: elem.id,
            name: elem.appName,
            preview: this.transPath(
              `${elem.packagePath}/${this.appsStructure.preview}`,
            ),
            app: this.transPath(
              `${elem.packagePath}/${this.appsStructure.config}`,
            ),
            classifyId: elem.classifyId,
          });
        }),
      );
    }

    return structureList;
  }

  async getClassifyList(userId: number, parentId: number | null) {
    const result = await this.appClassifyRepo.find({
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

  // 获取一个app
  async getApp(id: number) {
    const repo = await this.appRepository.findOne({
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
      name: repo.appName,
      classifyId: repo.classifyId,
      modifyTime: repo.modifyTime,
      preview: this.transPath(
        `${repo.packagePath}/${this.appsStructure.preview}`,
      ),
      app: this.transPath(`${repo.packagePath}/${this.appsStructure.config}`),
    });
  }

  // 修改一个应用
  async modifyApp(modify: AppModifyDTO) {
    const appPath = path.resolve(this.rootPath, `./${modify.id}`);

    if (!fs.existsSync(appPath)) {
      throw new LogServerErrorException(
        '找不到相关路径！',
        appPath,
        this,
        'modifyApp',
      );
    }

    await Promise.all([
      FileUtil.writeFile(
        `${appPath}/${this.appsStructure.config}`,
        modify.config,
      ),
      FileUtil.writeFile(
        `${appPath}/${this.appsStructure.preview}`,
        ImageUtil.decodeBase64(modify.preview),
      ),
    ]);

    return true;
  }

  // 打包app
  async buildApp(params: { id: number; publicPath: string; name: string }) {
    const appPath = path.resolve(this.rootPath, `./${params.id}`);

    const JSONConfig = fs
      .readFileSync(path.resolve(appPath, `./${this.appsStructure.config}`))
      .toString();

    const config = JSON.parse(JSONConfig);

    const buildModelPath = path.resolve(this.factoryPath, `./public/model`);

    const buildTexturePath = path.resolve(this.factoryPath, `./public/texture`);

    const buildComponentPath = path.resolve(
      this.factoryPath,
      `./public/component`,
    );

    const appConfigPath = path.resolve(this.factoryPath, './src/app.json');

    const buildConfigPath = path.resolve(this.factoryPath, './build.json');

    // 先清空standalone下的资源
    await Promise.all([
      FileUtil.rmdir(buildModelPath),
      FileUtil.rmdir(buildTexturePath),
      FileUtil.rmdir(buildComponentPath),
    ]);

    await Promise.all([
      FileUtil.mkdir(buildModelPath),
      FileUtil.mkdir(buildTexturePath),
      FileUtil.mkdir(buildComponentPath),
    ]);

    const copyDirPromiseList = [];

    // 复制assets
    const assets = config.assets as string[];

    for (const url of assets) {
      const dirName = url.split('/').slice(2, 3).join('/');
      if (url.startsWith('/model')) {
        copyDirPromiseList.push(
          FileUtil.copyDir(
            path.resolve(MODEL_PATH, `./${dirName}`),
            path.resolve(buildModelPath, `./${dirName}`),
          ),
        );
      } else if (url.startsWith('/texture')) {
        copyDirPromiseList.push(
          FileUtil.copyDir(
            path.resolve(TEXTURE_PATH, `./${dirName}`),
            path.resolve(buildTexturePath, `./${dirName}`),
          ),
        );
      }
    }

    // 写入 config 执行复制
    await Promise.all([
      FileUtil.writeFile(appConfigPath, JSONConfig),
      Promise.all(copyDirPromiseList),
    ]);

    // 写入build
    await FileUtil.writeFile(
      buildConfigPath,
      JSON.stringify({
        title: params.name,
        publicPath: params.publicPath,
      }),
    );

    // 执行打包命令
    await FileUtil.exec('npm run build', {
      cwd: this.factoryPath,
    });

    // 移动打包
    const buildDistPath = path.resolve(this.factoryPath, `./dist`);
    const targetDistPath = path.resolve(appPath, `./dist`);
    const targetCompressPath = path.resolve(
      appPath,
      `./${this.appsStructure.dist}`,
    );

    await FileUtil.copyDir(buildDistPath, targetDistPath);

    // 压缩
    await FileUtil.compress('.zip', targetDistPath, targetCompressPath);

    return this.transPath(`${appPath}/${this.appsStructure.dist}`);
  }

  // 添加分类
  async addClassify(param: AddClassifyDTO) {
    const parentClassify = param.parentId
      ? await this.appClassifyRepo.findOne({
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

    const result = await this.appClassifyRepo.insert(
      new AppClassify({
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
    const childClassifyCount = await this.appClassifyRepo.count({
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

    const appsCount = await this.appRepository.count({
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

    const result = await this.appClassifyRepo.update(
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
