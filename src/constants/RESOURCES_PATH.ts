import path from 'path';

const RESOURCES_PATH = path.resolve(process.cwd(), './resources');

export default RESOURCES_PATH;

export const MODEL_PATH = path.resolve(RESOURCES_PATH, './model');
export const TEXTURE_PATH = path.resolve(RESOURCES_PATH, './texture');
export const COMPONENT_PATH = path.resolve(RESOURCES_PATH, './component');
