// 引入UI组件库
import { Message, Notification } from "element-ui";

Message.loading = function (config) {
  if (typeof config === "string") {
    return ElementUI.Message({
      type: "info",
      message: config,
      duration: 0,
      iconClass: "el-icon-loading",
    });
  } else {
    return ElementUI.Message({
      type: "info",
      message: "正在加载...",
      duration: 0,
      iconClass: "el-icon-loading",
      ...config,
    });
  }
};

Notification.loading = function (config) {
  if (typeof config === "string") {
    return ElementUI.Notification({
      message: config,
      duration: 0,
      iconClass: "el-icon-loading",
    });
  } else {
    return ElementUI.Notification({
      message: "正在加载...",
      duration: 0,
      iconClass: "el-icon-loading",
      ...config,
    });
  }
};
