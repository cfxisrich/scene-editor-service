<template>
  <div id="app">
    <render-window></render-window>
    <loading-manager></loading-manager>
  </div>
</template>

<script>
import renderWindow from "./renderWindow";

const loadingManager = () => import("./loadingManager");
export default {
  components: {
    renderWindow,
    loadingManager,
  },
};
</script>

<style lang="less" scoped>
#app {
  .boxSetting();
}
</style>
