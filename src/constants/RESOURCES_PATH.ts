import path from 'path';
import FileUtil from '../util/FileUtil';

const RESOURCES_PATH = path.resolve(process.cwd(), './resources');
FileUtil.mkdir(process.cwd());

export default RESOURCES_PATH;

export const APP_PATH = path.resolve(RESOURCES_PATH, './app');

FileUtil.mkdir(APP_PATH);

export const MODEL_PATH = path.resolve(RESOURCES_PATH, './model');

FileUtil.mkdir(MODEL_PATH);

export const TEXTURE_PATH = path.resolve(RESOURCES_PATH, './texture');

FileUtil.mkdir(TEXTURE_PATH);

export const COMPONENT_PATH = path.resolve(RESOURCES_PATH, './component');

FileUtil.mkdir(COMPONENT_PATH);

export const TEMPLATE_PATH = path.resolve(RESOURCES_PATH, './template');

FileUtil.mkdir(TEMPLATE_PATH);
