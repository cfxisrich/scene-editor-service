<template>
  <div class="renderWindow-container">
    <iframe
      width="100%"
      height="100%"
      scrolling="no"
      ref="renderMask"
      class="render-mask"
    ></iframe>
    <div class="render-window" ref="renderElement"></div>
  </div>
</template>

<script>
import { engine } from "@/assets/js/VisFrame";

import app from "./app.json";

import { generateConfig, Template, CONFIGTYPE, uniqueSymbol } from "vis-three";

export default {
  data() {
    return {
      timer: "", // 刷新定时器
      canResize: true,
      throttleTime: 1000 / 60,
    };
  },
  async mounted() {
    engine.setDom(this.$refs.renderElement).setSize().play();

    // 自动窗口大小
    const renderMask = this.$refs.renderMask;
    renderMask.contentWindow.addEventListener("resize", (e) => {
      if (!this.canResize) {
        return false;
      } else {
        this.canResize = false;
        this.timer = setTimeout(() => {
          engine.setSize(renderMask.offsetWidth, renderMask.offsetHeight);
          this.canResize = true;
        }, this.throttleTime);
      }
    });

    const loading = this.$loading({
      text: "正在加载项目...",
      background: "rgba(0, 0, 0, 0.3)",
    });

    // // 组件加载
    // const component = config.component;

    // if (component) {
    //   delete config.component;

    //   const componentValues = [...Object.values(component)];

    //   // 获取所有的packageJSON
    //   const packageJSONList = await Promise.all(
    //     componentValues.map((item) => this.axios.get(item.pkg))
    //   ).catch((err) => {
    //     this.$message.error(err.message);
    //     loading.close();
    //   });

    //   // 获取所有组件注册组件
    //   const componentList = await Promise.all(
    //     componentValues.map((item, i) =>
    //       componentManager.generate(item.url, packageJSONList[i], item)
    //     )
    //   ).catch((err) => {
    //     this.$message.error(err.message);
    //     loading.close();
    //   });

    //   componentList.forEach(({ resource, config }, i) => {
    //     this.$store.commit("component/add", {
    //       config,
    //       configuration: packageJSONList[i].configuration,
    //     });
    //     engine.registerResources({
    //       [config.cid]: resource,
    //     });
    //   });
    // }

    const config = Template.handler(app, (objectConfig) =>
      generateConfig(objectConfig.type, objectConfig, false)
    );

    await engine.loadConfigAsync(config);

    engine.setScene(uniqueSymbol(CONFIGTYPE.SCENE));
    // engine.setCamera(uniqueSymbol(CONFIGTYPE.SCENE));

    loading.close();
  },
};
</script>

<style lang="less" scoped>
.renderWindow-container {
  position: relative;
  .boxSetting();
  .render-mask {
    position: absolute;
    pointer-events: none;
    z-index: -1;
  }

  .render-window {
    .boxSetting();
    position: absolute;
  }
  .bottom-function-box {
    .flexLayout(row, flex-start, center);
    > * {
      margin-right: @box-margin / 2;
    }
  }
  .top-function-box {
    .flexLayout(row, flex-start, center);
  }
}
.positionLayoutBox-container {
  z-index: 100;
}
</style>
