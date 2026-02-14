"use strict";
const jsxRuntime = require("react/jsx-runtime");
const H5PIcon = () => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 3v18" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 9h6" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 15h3" })
    ]
  }
);
const PLUGIN_ID = "h5p";
const index = {
  register(app) {
    app.registerPlugin({
      id: PLUGIN_ID,
      isReady: true,
      name: PLUGIN_ID
    });
    app.customFields.register({
      name: "h5p-editor",
      pluginId: PLUGIN_ID,
      type: "json",
      icon: H5PIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.h5p-editor.label`,
        defaultMessage: "H5P Interactive Content"
      },
      intlDescription: {
        id: `${PLUGIN_ID}.h5p-editor.description`,
        defaultMessage: "Create and edit interactive H5P content with a visual editor"
      },
      components: {
        Input: async () => Promise.resolve().then(() => require("../_chunks/h5p-editor-field-CFlAiTou.js"))
      }
    });
  },
  async registerTrads({ locales }) {
    return locales.map((locale) => ({ data: {}, locale }));
  }
};
module.exports = index;
//# sourceMappingURL=index.js.map
