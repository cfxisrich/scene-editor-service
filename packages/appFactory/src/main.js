import "element-ui/lib/theme-chalk/index.css";
// 引入公共less配置
import "@/assets/less/init.less";
// 引入elementUI重置配置
import "@/assets/less/resetElementUI.less";
// 引入进度条样式
import "@/assets/css/nprogress.css";
// vis样式
import "@/assets/less/visFrame.less";

// 进度条
import Nprogress from "nprogress";
// 引入UI组件库
import { Loading } from "element-ui";

import VisUI from "@/components";
// axios
import { Plugin } from "@/assets/js/plugins/axios";

import "@/assets/js/optimize.js";

import Vue from "vue";
import App from "./App.vue";

Nprogress.start();

Vue.use(Loading);
Vue.use(VisUI);
Vue.use(Plugin);

Vue.config.productionTip = false;

const app = new Vue({
  render: (h) => h(App),
  created() {},
  mounted() {
    Nprogress.done();
  },
}).$mount("#app");
