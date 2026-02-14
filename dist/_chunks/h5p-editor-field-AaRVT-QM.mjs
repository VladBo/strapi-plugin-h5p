import { jsx, jsxs } from "react/jsx-runtime";
import { Field, Flex, Box } from "@strapi/design-system";
import { useField } from "@strapi/strapi/admin";
import { useRef, useMemo, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";
import { H5PEditorUI } from "@lumieducation/h5p-react";
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
  useEffect(() => {
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
  const { formatMessage } = useIntl();
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const isSavingRef = useRef(false);
  const field = useField(name);
  const { onChange, value } = field;
  const hasInteractedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const fieldValueRef = useRef(value);
  onChangeRef.current = onChange;
  fieldValueRef.current = value;
  const initialContentRef = useRef(null);
  if (initialContentRef.current === null) {
    initialContentRef.current = parseH5PContent(value);
  }
  const contentId = useMemo(() => {
    const content = initialContentRef.current;
    if (content?.library && content?.params) {
      return "stored";
    }
    return "new";
  }, []);
  const loadContentCallback = useCallback(
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
  const saveContentCallback = useCallback(
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
  const handleH5PInteraction = useCallback(() => {
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
  const attachIframeListeners = useCallback((retries = 0) => {
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
  const handleLoaded = useCallback(
    (_contentId, _ubername) => {
      attachIframeListeners();
    },
    [attachIframeListeners]
  );
  const handleSaved = useCallback(
    (_contentId, _metadata) => {
      isSavingRef.current = false;
    },
    []
  );
  const handleSaveError = useCallback(
    (_errorMessage) => {
      isSavingRef.current = false;
    },
    []
  );
  useH5PSaveIntercept(editorRef, hasInteractedRef, isSavingRef);
  const displayLabel = label || (intlLabel ? formatMessage(intlLabel) : name);
  return /* @__PURE__ */ jsx(Field.Root, { name, id: name, error: field.error, hint, required, children: /* @__PURE__ */ jsxs(
    Flex,
    {
      direction: "column",
      alignItems: "stretch",
      gap: 1,
      ref: containerRef,
      children: [
        /* @__PURE__ */ jsx(Field.Label, { action: labelAction, children: displayLabel }),
        /* @__PURE__ */ jsx(
          Box,
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
            children: /* @__PURE__ */ jsx(
              H5PEditorUI,
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
        /* @__PURE__ */ jsx(Field.Hint, {}),
        /* @__PURE__ */ jsx(Field.Error, {})
      ]
    }
  ) });
};
H5PEditorField.displayName = "H5PEditorField";
export {
  H5PEditorField as default
};
//# sourceMappingURL=h5p-editor-field-AaRVT-QM.mjs.map
