import path from "node:path";
import fs from "fs-extra";
import * as h5pServer from "@lumieducation/h5p-server";
const getErrorMessage = (err) => err instanceof Error ? err.message : "Internal Server Error";
const resolveUser = (user) => user || {
  id: "anonymous",
  name: "Anonymous",
  email: "anonymous@example.com",
  type: "local"
};
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".js":
      return "application/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    case ".ttf":
      return "font/ttf";
    case ".eot":
      return "application/vnd.ms-fontobject";
    case ".otf":
      return "font/otf";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".ogg":
      return "audio/ogg";
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    default:
      return "application/octet-stream";
  }
};
function safeJsonParse(value) {
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
const buildLibrary = (input) => {
  if (!input?.machineName) return void 0;
  if (typeof input.majorVersion !== "number" || typeof input.minorVersion !== "number") {
    return void 0;
  }
  return `${input.machineName} ${input.majorVersion}.${input.minorVersion}`;
};
const getString = (value) => typeof value === "string" ? value : void 0;
const getLibraryFromObject = (value) => buildLibrary(value);
const getNestedLibrary = (value) => {
  if (!value || typeof value !== "object") {
    return void 0;
  }
  const record = value;
  return getString(record.library) || getString(record.mainLibrary) || getNestedLibrary(record.params);
};
const resolveLibrary = (payload) => {
  if (!payload) return void 0;
  return getString(payload.library) || getString(payload.mainLibrary) || getLibraryFromObject(payload.library) || getLibraryFromObject(payload.mainLibrary) || getString(payload.ubername) || getString(payload.libraryName) || getNestedLibrary(safeJsonParse(payload.params));
};
const normalizeLibrary = (value) => {
  if (!value) return value;
  const match = /^([\w.]+)-(\d+\.\d+)$/.exec(value);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return value;
};
const createSlug = (title) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "");
const getFileStreamResponse = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const mimeType = getMimeType(filePath);
  const stream = fs.createReadStream(filePath);
  return { stream, mimeType };
};
const getMainLibraryVersion = (metadata) => {
  if (!metadata?.mainLibrary) {
    return void 0;
  }
  const dependency = metadata.preloadedDependencies?.find(
    (d) => d.machineName === metadata.mainLibrary
  );
  const major = dependency?.majorVersion ?? 1;
  const minor = dependency?.minorVersion ?? 0;
  return `${metadata.mainLibrary} ${major}.${minor}`;
};
const controller = ({ strapi }) => ({
  async findContent(ctx) {
    try {
      const contents = await strapi.documents("api::h5p-content.h5p-content").findMany({
        ...ctx.query
      });
      ctx.body = contents;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async findOneContent(ctx) {
    const { id } = ctx.params;
    try {
      const content = await strapi.documents("api::h5p-content.h5p-content").findOne({
        documentId: id,
        ...ctx.query
      });
      ctx.body = content;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async createContent(ctx) {
    try {
      const { title, library, parameters, metadata } = ctx.request.body;
      const slug = createSlug(title);
      const embedCode = `<iframe src="${strapi.config.get(
        "server.url"
      )}/api/h5p/content/${slug}/embed" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
      const newContent = await strapi.documents("api::h5p-content.h5p-content").create({
        data: {
          title,
          slug,
          library,
          parameters,
          metadata,
          embedCode
        }
      });
      ctx.body = newContent;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async updateContent(ctx) {
    const { id } = ctx.params;
    try {
      const updatedContent = await strapi.documents("api::h5p-content.h5p-content").update({
        documentId: id,
        data: ctx.request.body
      });
      ctx.body = updatedContent;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async deleteContent(ctx) {
    const { id } = ctx.params;
    try {
      const deletedContent = await strapi.documents("api::h5p-content.h5p-content").delete({
        documentId: id
      });
      ctx.body = deletedContent;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getLibraries(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const libraries = await h5pService.getInstalledLibraries();
      ctx.body = libraries;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getAvailableLibraries(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const libraries = await h5pService.getAvailableLibraries();
      ctx.body = libraries;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async installLibrary(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const { id } = ctx.request.body;
      const result = await h5pService.installLibrary(id);
      ctx.body = result;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getContentTypeCache(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const cache = await h5pService.getContentTypeCache();
      ctx.body = cache;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async updateContentTypeCache(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const cache = await h5pService.updateContentTypeCache();
      ctx.body = cache;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getContentHubMetadataCache(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const cache = await h5pService.getContentHubMetadataCache();
      ctx.body = cache;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async updateContentHubMetadataCache(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const cache = await h5pService.updateContentHubMetadataCache();
      ctx.body = cache;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getEditorModel(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const contentId = ctx.params.contentId === "new" ? null : ctx.params.contentId;
      const resolvedUser = ctx.state?.user;
      const editorModel = await h5pService.getEditorModel(
        contentId,
        resolvedUser
      );
      ctx.body = editorModel;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getContentParams(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const params = await h5pService.getContentParams(ctx.params.contentId);
      ctx.body = params;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async saveContent(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const result = await h5pService.saveContent(
        ctx.request.body,
        ctx.state?.user
      );
      ctx.body = result;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getLibraryFile(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const file = await h5pService.getLibraryFile(
        ctx.params.ubername,
        ctx.params.file
      );
      ctx.type = file.mimeType;
      ctx.body = file.stream;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getContentFile(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const file = await h5pService.getContentFile(
        ctx.params.contentId,
        ctx.params.file
      );
      ctx.type = file.mimeType;
      ctx.body = file.stream;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getCoreFile(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const file = await h5pService.getCoreFile(
        ctx.params.type,
        ctx.params.file
      );
      ctx.type = file.mimeType;
      ctx.body = file.stream;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getEditorFile(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const file = await h5pService.getEditorFile(
        ctx.params.type,
        ctx.params.file
      );
      ctx.type = file.mimeType;
      ctx.body = file.stream;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getPlayPage(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const html = await h5pService.renderPlayer(ctx.params.contentId);
      ctx.type = "text/html";
      ctx.body = html;
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  },
  async getAjax(ctx) {
    try {
      const h5pService = strapi.plugin("h5p").service("service");
      const action = ctx.query.action || ctx.request.body && ctx.request.body.action;
      const result = await h5pService.handleAjax({
        action,
        query: ctx.query,
        user: ctx.state?.user,
        method: ctx.method,
        body: ctx.request.body,
        files: ctx.request.files
      });
      if (result && result.body !== void 0) {
        if (result.contentType) {
          ctx.type = result.contentType;
        }
        if (result.status) {
          ctx.status = result.status;
        }
        ctx.body = result.body;
      } else {
        ctx.body = result;
      }
    } catch (err) {
      ctx.throw(500, getErrorMessage(err));
    }
  }
});
const controllers = { controller };
const routes = {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "GET",
        path: "/contents",
        handler: "controller.findContent",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/contents/:id",
        handler: "controller.findOneContent",
        config: { auth: false }
      },
      {
        method: "POST",
        path: "/contents",
        handler: "controller.createContent",
        config: { auth: false }
      },
      {
        method: "PUT",
        path: "/contents/:id",
        handler: "controller.updateContent",
        config: { auth: false }
      },
      {
        method: "DELETE",
        path: "/contents/:id",
        handler: "controller.deleteContent",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/libraries",
        handler: "controller.getLibraries",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/libraries/available",
        handler: "controller.getAvailableLibraries",
        config: { auth: false }
      },
      {
        method: "POST",
        path: "/libraries/install",
        handler: "controller.installLibrary",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/ajax",
        handler: "controller.getAjax",
        config: { auth: false }
      },
      {
        method: "POST",
        path: "/ajax",
        handler: "controller.getAjax",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/params/:contentId",
        handler: "controller.getContentParams",
        config: { auth: false }
      },
      {
        method: "POST",
        path: "/save",
        handler: "controller.saveContent",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/libraries/:ubername/:file*",
        handler: "controller.getLibraryFile",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/content/:contentId/:file*",
        handler: "controller.getContentFile",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/editor-model/:contentId",
        handler: "controller.getEditorModel",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/core/:type/:file*",
        handler: "controller.getCoreFile",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/editor/:type/:file*",
        handler: "controller.getEditorFile",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/play/:contentId",
        handler: "controller.getPlayPage",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/content-type-cache",
        handler: "controller.getContentTypeCache",
        config: { auth: false }
      },
      {
        method: "POST",
        path: "/content-type-cache",
        handler: "controller.updateContentTypeCache",
        config: { auth: false }
      },
      {
        method: "GET",
        path: "/content-hub-metadata-cache",
        handler: "controller.getContentHubMetadataCache",
        config: { auth: false }
      },
      {
        method: "POST",
        path: "/content-hub-metadata-cache",
        handler: "controller.updateContentHubMetadataCache",
        config: { auth: false }
      }
    ]
  }
};
const service = ({ strapi }) => {
  const state = {
    h5pConfig: null,
    h5pEditor: null,
    h5pPlayer: null
  };
  const getConfig = () => {
    if (!state.h5pConfig) {
      throw new Error("H5P config not initialized");
    }
    return state.h5pConfig;
  };
  const getEditor = () => {
    if (!state.h5pEditor) {
      throw new Error("H5P editor not initialized");
    }
    return state.h5pEditor;
  };
  const getPlayer = () => {
    if (!state.h5pPlayer) {
      throw new Error("H5P player not initialized");
    }
    return state.h5pPlayer;
  };
  return {
    async initialize() {
      strapi.log.info("Initializing H5P Editor and Player...");
      const config2 = strapi.config.get("plugin.h5p") || {};
      const pluginConfig = config2.config || {};
      const baseUrl = "/api/h5p";
      const h5pConfig = new h5pServer.H5PConfig(void 0, {
        baseUrl,
        contentHubEnabled: true
      });
      const libraryPath = path.join(
        strapi.dirs.static.public,
        pluginConfig.librariesPath || "h5p/libraries"
      );
      const contentPath = path.join(
        strapi.dirs.static.public,
        pluginConfig.contentPath || "h5p/content"
      );
      const temporaryPath = path.join(
        strapi.dirs.static.public,
        pluginConfig.temporaryFilesPath || "h5p/temp-files"
      );
      state.h5pConfig = {
        baseUrl,
        editorUrl: `${baseUrl}${h5pConfig.editorLibraryUrl}`,
        coreUrl: `${baseUrl}${h5pConfig.coreUrl}`,
        contentTypeCacheUrl: `${baseUrl}/ajax?action=content-type-cache`,
        contentHubMetadataUrl: `${baseUrl}/ajax?action=content-hub-metadata-cache`,
        contentStorage: {
          libraryPath,
          contentPath,
          temporaryPath
        }
      };
      await fs.ensureDir(libraryPath);
      await fs.ensureDir(contentPath);
      await fs.ensureDir(temporaryPath);
      const cache = new h5pServer.fsImplementations.InMemoryStorage();
      const libraryStorage = new h5pServer.fsImplementations.FileLibraryStorage(
        libraryPath
      );
      const contentStorage = new h5pServer.fsImplementations.FileContentStorage(
        contentPath
      );
      const temporaryStorage = new h5pServer.fsImplementations.DirectoryTemporaryFileStorage(
        temporaryPath
      );
      state.h5pEditor = new h5pServer.H5PEditor(
        cache,
        h5pConfig,
        libraryStorage,
        contentStorage,
        temporaryStorage
      );
      state.h5pPlayer = new h5pServer.H5PPlayer(
        libraryStorage,
        contentStorage,
        h5pConfig
      );
      strapi.log.info("H5P Editor and Player initialized successfully");
    },
    async getInstalledLibraries() {
      try {
        const libraries = await getEditor().libraryManager.listInstalledLibraries();
        return libraries;
      } catch (error) {
        strapi.log.error("Failed to get installed libraries:", error);
        throw error;
      }
    },
    async getAvailableLibraries() {
      try {
        const libraries = await getEditor().contentHub.getLibraries();
        return libraries;
      } catch (error) {
        strapi.log.error("Failed to get available libraries:", error);
        throw error;
      }
    },
    async installLibrary(libraryId) {
      try {
        const result = await getEditor().contentHub.installLibrary(libraryId);
        return { success: true, result };
      } catch (error) {
        strapi.log.error("Failed to install library:", error);
        throw error;
      }
    },
    async getContentTypeCache() {
      try {
        const cache = await getEditor().contentTypeCache.get();
        return cache;
      } catch (error) {
        strapi.log.error("Failed to get content type cache:", error);
        throw error;
      }
    },
    async updateContentTypeCache() {
      try {
        const cache = await getEditor().contentTypeCache.update();
        return cache;
      } catch (error) {
        strapi.log.error("Failed to update content type cache:", error);
        throw error;
      }
    },
    async getContentHubMetadataCache() {
      try {
        const cache = await getEditor().contentHubMetadataCache.get();
        return cache;
      } catch (error) {
        strapi.log.error("Failed to get content hub metadata cache:", error);
        throw error;
      }
    },
    async updateContentHubMetadataCache() {
      try {
        const cache = await getEditor().contentHubMetadataCache.update();
        return cache;
      } catch (error) {
        strapi.log.error("Failed to update content hub metadata cache:", error);
        throw error;
      }
    },
    async handleAjax({
      action,
      query,
      user,
      method,
      body,
      files
    }) {
      try {
        const actionValue = Array.isArray(action) ? action[0] : action || "";
        const resolvedUsr = resolveUser(user ?? void 0);
        const ajaxEndpoint = new h5pServer.H5PAjaxEndpoint(getEditor());
        const language = query?.language;
        const resolvedMethod = (method || "GET").toUpperCase();
        const postActions = /* @__PURE__ */ new Set([
          "translations",
          "files",
          "filter",
          "library-install",
          "library-upload",
          "get-content"
        ]);
        const shouldPost = resolvedMethod === "POST" || postActions.has(actionValue);
        if (shouldPost) {
          const id = query?.id;
          const hubId = query?.hubId;
          const translate = (stringId, replacements) => {
            if (!replacements) {
              return stringId;
            }
            return Object.keys(replacements).reduce(
              (text, key) => text.split(`:${key}`).join(String(replacements[key])),
              stringId
            );
          };
          const normalizeFile = (file) => {
            if (!file) {
              return void 0;
            }
            const actual = Array.isArray(file) ? file[0] : file;
            if (!actual) {
              return void 0;
            }
            return {
              data: actual.buffer,
              mimetype: actual.type || actual.mimetype,
              name: actual.name || actual.originalFilename || actual.filename,
              size: actual.size,
              tempFilePath: actual.path || actual.filepath || actual.tempFilePath
            };
          };
          const filesObj = files;
          const filesFile = normalizeFile(filesObj?.file);
          const libraryUploadFile = normalizeFile(filesObj?.h5p);
          const resolvedBody = body;
          return await ajaxEndpoint.postAjax(
            actionValue,
            resolvedBody,
            language,
            resolvedUsr,
            filesFile,
            id,
            translate,
            libraryUploadFile,
            hubId
          );
        }
        const queryObj = query;
        return await ajaxEndpoint.getAjax(
          actionValue,
          queryObj?.machineName,
          queryObj?.majorVersion,
          queryObj?.minorVersion,
          language,
          resolvedUsr
        );
      } catch (error) {
        strapi.log.error("Failed to handle H5P AJAX request:", error);
        throw error;
      }
    },
    async getContentParams(contentId) {
      try {
        const contentStorage = getEditor().contentStorage;
        const [metadata, parameters] = await Promise.all([
          contentStorage.getMetadata(contentId),
          contentStorage.getParameters(contentId)
        ]);
        return {
          library: getMainLibraryVersion(metadata),
          params: parameters,
          metadata: {
            title: metadata.title,
            license: metadata.license
          }
        };
      } catch (error) {
        strapi.log.error(
          `Failed to get content params for ${contentId}:`,
          error
        );
        throw error;
      }
    },
    async saveContent(contentData, user) {
      try {
        const parsedContentData = typeof contentData === "string" ? safeJsonParse(contentData) : contentData;
        const payload = parsedContentData && typeof parsedContentData === "object" && "data" in parsedContentData ? parsedContentData.data : parsedContentData;
        const library = normalizeLibrary(
          resolveLibrary(payload)
        );
        if (!library) {
          strapi.log.error("Failed to save content: missing library", {
            keys: Object.keys(contentData || {})
          });
          throw new Error("missing-library");
        }
        const parsedParams = safeJsonParse(payload?.params);
        const parsedMetadata = safeJsonParse(payload?.metadata);
        const paramsContainer = parsedParams?.params ? parsedParams : void 0;
        const params = paramsContainer?.params ?? parsedParams;
        const rawMetadata = parsedMetadata ?? paramsContainer?.metadata;
        const fallbackTitle = rawMetadata?.title ?? paramsContainer?.metadata?.title ?? parsedParams?.metadata?.title ?? parsedParams?.title ?? payload?.title ?? "Untitled";
        const metadata = {
          title: fallbackTitle
        };
        if (typeof rawMetadata?.language === "string") {
          if (/^[-a-zA-Z]{1,10}$/.test(
            rawMetadata.language
          )) {
            metadata.language = rawMetadata.language;
          }
        }
        const resolvedUsr = resolveUser(user ?? void 0);
        const contentId = await getEditor().saveOrUpdateContent(
          payload?.contentId ?? void 0,
          params,
          metadata,
          library,
          resolvedUsr
        );
        return { id: contentId };
      } catch (error) {
        strapi.log.error("Failed to save content:", error);
        throw error;
      }
    },
    async getLibraryFile(ubername, file) {
      try {
        const h5pConfig = getConfig();
        const filePath = path.join(
          h5pConfig.contentStorage.libraryPath,
          ubername,
          file
        );
        return getFileStreamResponse(filePath);
      } catch (error) {
        strapi.log.error("Failed to get library file:", error);
        throw error;
      }
    },
    async getContentFile(contentId, file) {
      try {
        const h5pConfig = getConfig();
        let resolvedFile = file;
        if (file === "content/content.json") {
          resolvedFile = "content.json";
        } else if (file.startsWith("content/")) {
          resolvedFile = file.replace(/^content\//, "");
        }
        const filePath = path.join(
          h5pConfig.contentStorage.contentPath,
          contentId,
          resolvedFile
        );
        return getFileStreamResponse(filePath);
      } catch (error) {
        strapi.log.error("Failed to get content file:", error);
        throw error;
      }
    },
    async getCoreFile(type, file) {
      try {
        const h5pConfig = getConfig();
        const filePath = path.join(
          h5pConfig.contentStorage.libraryPath,
          "core",
          type,
          file
        );
        return getFileStreamResponse(filePath);
      } catch (error) {
        strapi.log.error("Failed to get core file:", error);
        throw error;
      }
    },
    async getEditorFile(type, file) {
      try {
        const h5pConfig = getConfig();
        const filePath = path.join(
          h5pConfig.contentStorage.libraryPath,
          "editor",
          type,
          file
        );
        return getFileStreamResponse(filePath);
      } catch (error) {
        strapi.log.error("Failed to get editor file:", error);
        throw error;
      }
    },
    async renderPlayer(contentId) {
      try {
        return await getPlayer().render(contentId);
      } catch (error) {
        strapi.log.error(
          `Failed to render H5P player for ${contentId}:`,
          error
        );
        throw error;
      }
    },
    async getEditorModel(contentId, user) {
      try {
        const resolvedUsr = resolveUser(user ?? void 0);
        const originalRenderer = getEditor().setRenderer((model) => model);
        try {
          const editorModel = await getEditor().render(
            contentId,
            "en",
            resolvedUsr
          );
          return editorModel;
        } finally {
          getEditor().setRenderer(originalRenderer);
        }
      } catch (error) {
        strapi.log.error("Failed to get editor model:", error);
        throw error;
      }
    },
    async readFile(filePath) {
      try {
        return await fs.readFile(filePath);
      } catch (error) {
        strapi.log.error(`Failed to read file ${filePath}:`, error);
        throw error;
      }
    },
    getMimeType
  };
};
const services = { service };
const MIME_TYPES = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".html": "text/html"
};
function containsPathTraversal(filePath) {
  const normalized = path.normalize(filePath);
  return normalized.includes("..") || filePath.includes("..");
}
const middleware = (config2, {
  strapi
}) => {
  return async (ctx, next) => {
    const { url } = ctx.request;
    if (url.startsWith("/api/h5p/core/")) {
      const filePath = url.replace("/api/h5p/core/", "").split("?")[0];
      if (containsPathTraversal(filePath)) {
        ctx.body = "Forbidden";
        return;
      }
      const fullPath = path.join(
        strapi.dirs.static.public,
        "uploads/h5p/core",
        filePath
      );
      try {
        if (await fs.pathExists(fullPath)) {
          const ext = path.extname(fullPath);
          ctx.type = MIME_TYPES[ext] || "application/octet-stream";
          if (filePath === "js/jquery.js") {
            const originalContent = await fs.readFile(fullPath, "utf-8");
            const modifiedContent = originalContent.replace(
              '"object"==typeof module&&"object"==typeof module.exports?',
              "false&&false?"
            );
            ctx.body = modifiedContent;
            return;
          }
          if (filePath === "js/h5p.js") {
            const originalContent = await fs.readFile(fullPath, "utf-8");
            ctx.body = `
// Ensure H5P.jQuery is set before h5p.js runs
(function() {
  var jq = window.jQuery || window.$ || (typeof jQuery !== 'undefined' ? jQuery : null);
  if (typeof jq === 'function') {
    window.H5P = window.H5P || {};
    window.H5P.jQuery = jq;
    window.H5PEditor = window.H5PEditor || {};
    window.H5PEditor.$ = jq;
  }
})();

${originalContent}
`;
            return;
          }
          ctx.body = await fs.readFile(fullPath);
          return;
        }
      } catch (error) {
        strapi.log.error("[h5p-static] Failed to read core file:", error);
      }
    }
    if (url.startsWith("/api/h5p/editor/")) {
      const filePath = url.replace("/api/h5p/editor/", "").split("?")[0];
      if (containsPathTraversal(filePath)) {
        ctx.body = "Forbidden";
        return;
      }
      const fullPath = path.join(
        strapi.dirs.static.public,
        "uploads/h5p/editor",
        filePath
      );
      try {
        if (await fs.pathExists(fullPath)) {
          const ext = path.extname(fullPath);
          ctx.type = MIME_TYPES[ext] || "application/octet-stream";
          if (filePath.startsWith("language/") && filePath.endsWith(".js")) {
            const originalContent = await fs.readFile(fullPath, "utf-8");
            ctx.body = `
// Ensure H5PEditor.language exists before setting language.core
(function() {
  window.H5PEditor = window.H5PEditor || {};
  window.H5PEditor.language = window.H5PEditor.language || {};
})();

${originalContent}
`;
            return;
          }
          ctx.body = await fs.readFile(fullPath);
          return;
        }
      } catch (error) {
        strapi.log.error("[h5p-static] Failed to read editor file:", error);
      }
    }
    if (url.startsWith("/api/h5p/libraries/")) {
      const filePath = url.replace("/api/h5p/libraries/", "").split("?")[0];
      if (containsPathTraversal(filePath)) {
        ctx.body = "Forbidden";
        return;
      }
      const fullPath = path.join(
        strapi.dirs.static.public,
        "uploads/h5p/libraries",
        filePath
      );
      try {
        if (await fs.pathExists(fullPath)) {
          const ext = path.extname(fullPath);
          ctx.type = MIME_TYPES[ext] || "application/octet-stream";
          ctx.body = await fs.readFile(fullPath);
          return;
        }
      } catch (error) {
        strapi.log.error("[h5p-static] Failed to read library file:", error);
      }
    }
    await next();
  };
};
const middlewares = {
  h5p: middleware
};
const bootstrap = async ({ strapi }) => {
  const h5pService = strapi.plugin("h5p").service("service");
  await h5pService.initialize();
};
const register = ({ strapi }) => {
  strapi.customFields.register({
    name: "h5p-editor",
    plugin: "h5p",
    type: "json"
  });
};
const config = {
  default: {},
  validator() {
  }
};
const index = {
  register,
  bootstrap,
  config,
  controllers,
  routes,
  services,
  middlewares
};
export {
  index as default
};
//# sourceMappingURL=index.mjs.map
