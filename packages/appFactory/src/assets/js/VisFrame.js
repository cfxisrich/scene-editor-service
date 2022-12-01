import { DisplayEngineSupport, ENGINEPLUGIN } from "vis-three";

export const engine = new DisplayEngineSupport().install(
  ENGINEPLUGIN.CSS3DRENDERER
);

engine.loaderManager
  .getLoader("glb")
  .dracoLoader.setDecoderPath("plugins/draco/gltf/");

engine.eventManager.recursive = true;

window.VIS = {};

window.VIS.engine = engine;
