"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const designSystem = require("@strapi/design-system");
const admin = require("@strapi/strapi/admin");
const react = require("react");
const reactIntl = require("react-intl");
const h5pReact = require("@lumieducation/h5p-react");
function parseH5PContent(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error("[H5P] Failed to parse H5P content JSON:", error);
      return {};
    }
  }
  return value;
}
function useH5PSaveIntercept(editorRef, hasInteractedRef, isSavingRef) {
  react.useEffect(() => {
    const handleSaveClick = async (event) => {
      const target = event.target;
      const saveButton = target.closest("button[data-strapi-save]") || target.closest("button");
      if (!saveButton) return;
      const isSave = saveButton.hasAttribute("data-strapi-save") || saveButton.textContent?.trim() === "Save";
      if (!isSave) return;
      if (!hasInteractedRef.current || !editorRef.current || isSavingRef.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      isSavingRef.current = true;
      try {
        await editorRef.current.save();
        await new Promise((resolve) => setTimeout(resolve, 150));
        hasInteractedRef.current = false;
        isSavingRef.current = false;
        saveButton.click();
      } catch {
        isSavingRef.current = false;
      }
    };
    document.addEventListener("click", handleSaveClick, true);
    return () => document.removeEventListener("click", handleSaveClick, true);
  }, [editorRef, hasInteractedRef, isSavingRef]);
}
const H5PEditorField = (props) => {
  const {
    intlLabel,
    label,
    name,
    required,
    hint,
    labelAction
  } = props;
  const { formatMessage } = reactIntl.useIntl();
  const editorRef = react.useRef(null);
  const containerRef = react.useRef(null);
  const isSavingRef = react.useRef(false);
  const field = admin.useField(name);
  const { onChange, value } = field;
  const hasInteractedRef = react.useRef(false);
  const onChangeRef = react.useRef(onChange);
  const fieldValueRef = react.useRef(value);
  onChangeRef.current = onChange;
  fieldValueRef.current = value;
  const initialContentRef = react.useRef(null);
  if (initialContentRef.current === null) {
    initialContentRef.current = parseH5PContent(value);
  }
  const contentId = react.useMemo(() => {
    const content = initialContentRef.current;
    if (content?.library && content?.params) {
      return "stored";
    }
    return "new";
  }, []);
  const loadContentCallback = react.useCallback(
    async (_contentId) => {
      const content = initialContentRef.current || {};
      const response = await fetch("/api/h5p/editor-model/new");
      if (!response.ok) throw new Error(`Failed to load editor: ${response.status}`);
      const editorModel = await response.json();
      if (content.library && content.params) {
        editorModel.library = content.library;
        const params = content.params;
        if (params.params) {
          editorModel.params = params.params;
          editorModel.metadata = params.metadata || content.metadata || {};
        } else {
          editorModel.params = content.params;
          editorModel.metadata = content.metadata || {};
        }
      }
      return editorModel;
    },
    []
  );
  const saveContentCallback = react.useCallback(
    async (_contentId, requestBody) => {
      const updatedContent = {
        library: requestBody.library,
        params: requestBody.params,
        metadata: requestBody.params?.metadata || {}
      };
      const newValue = JSON.stringify(updatedContent);
      initialContentRef.current = updatedContent;
      onChangeRef.current(name, newValue);
      return {
        contentId: "stored",
        metadata: requestBody.params?.metadata || {}
      };
    },
    [name]
  );
  const handleH5PInteraction = react.useCallback(() => {
    if (hasInteractedRef.current) return;
    hasInteractedRef.current = true;
    const currentValue = fieldValueRef.current || "{}";
    const valueStr = typeof currentValue === "string" ? currentValue : JSON.stringify(currentValue);
    try {
      const content = JSON.parse(valueStr);
      content.__dirty = Date.now();
      onChangeRef.current(name, JSON.stringify(content));
    } catch {
      onChangeRef.current(name, JSON.stringify({ __dirty: Date.now() }));
    }
  }, [name]);
  const attachIframeListeners = react.useCallback((retries = 0) => {
    const iframe = containerRef.current?.querySelector("iframe");
    if (!iframe) {
      if (retries < 5) {
        setTimeout(() => attachIframeListeners(retries + 1), 500);
      }
      return;
    }
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) {
        if (retries < 10) {
          setTimeout(() => attachIframeListeners(retries + 1), 500);
        }
        return;
      }
      iframeDoc.addEventListener("mousedown", handleH5PInteraction, true);
      iframeDoc.addEventListener("input", handleH5PInteraction, true);
      iframeDoc.addEventListener("change", handleH5PInteraction, true);
    } catch {
      iframe.addEventListener("mousedown", handleH5PInteraction);
      window.addEventListener("blur", () => {
        if (document.activeElement === iframe) {
          handleH5PInteraction();
        }
      });
    }
  }, [handleH5PInteraction]);
  const handleLoaded = react.useCallback(
    (_contentId, _ubername) => {
      attachIframeListeners();
    },
    [attachIframeListeners]
  );
  const handleSaved = react.useCallback(
    (_contentId, _metadata) => {
      isSavingRef.current = false;
    },
    []
  );
  const handleSaveError = react.useCallback(
    (_errorMessage) => {
      isSavingRef.current = false;
    },
    []
  );
  useH5PSaveIntercept(editorRef, hasInteractedRef, isSavingRef);
  const displayLabel = label || (intlLabel ? formatMessage(intlLabel) : name);
  return /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Root, { name, id: name, error: field.error, hint, required, children: /* @__PURE__ */ jsxRuntime.jsxs(
    designSystem.Flex,
    {
      direction: "column",
      alignItems: "stretch",
      gap: 1,
      ref: containerRef,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Label, { action: labelAction, children: displayLabel }),
        /* @__PURE__ */ jsxRuntime.jsx(
          designSystem.Box,
          {
            padding: 0,
            background: "neutral0",
            borderColor: "neutral200",
            hasRadius: true,
            style: {
              minHeight: "700px",
              overflow: "hidden",
              position: "relative",
              width: "100%",
              maxWidth: "100%"
            },
            children: /* @__PURE__ */ jsxRuntime.jsx(
              h5pReact.H5PEditorUI,
              {
                ref: editorRef,
                contentId,
                loadContentCallback,
                saveContentCallback,
                onLoaded: handleLoaded,
                onSaved: handleSaved,
                onSaveError: handleSaveError
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Hint, {}),
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Error, {})
      ]
    }
  ) });
};
H5PEditorField.displayName = "H5PEditorField";
exports.default = H5PEditorField;
//# sourceMappingURL=h5p-editor-field-CFlAiTou.js.map
