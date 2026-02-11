declare const _default: {
    controller: ({ strapi }: {
        strapi: import("@strapi/types/dist/core").Strapi;
    }) => {
        findContent(ctx: import("../types").StrapiContext): Promise<void>;
        findOneContent(ctx: import("../types").StrapiContext): Promise<void>;
        createContent(ctx: import("../types").StrapiContext): Promise<void>;
        updateContent(ctx: import("../types").StrapiContext): Promise<void>;
        deleteContent(ctx: import("../types").StrapiContext): Promise<void>;
        getLibraries(ctx: import("../types").StrapiContext): Promise<void>;
        getAvailableLibraries(ctx: import("../types").StrapiContext): Promise<void>;
        installLibrary(ctx: import("../types").StrapiContext): Promise<void>;
        getContentTypeCache(ctx: import("../types").StrapiContext): Promise<void>;
        updateContentTypeCache(ctx: import("../types").StrapiContext): Promise<void>;
        getContentHubMetadataCache(ctx: import("../types").StrapiContext): Promise<void>;
        updateContentHubMetadataCache(ctx: import("../types").StrapiContext): Promise<void>;
        getEditorModel(ctx: import("../types").StrapiContext): Promise<void>;
        getContentParams(ctx: import("../types").StrapiContext): Promise<void>;
        saveContent(ctx: import("../types").StrapiContext): Promise<void>;
        getLibraryFile(ctx: import("../types").StrapiContext): Promise<void>;
        getContentFile(ctx: import("../types").StrapiContext): Promise<void>;
        getCoreFile(ctx: import("../types").StrapiContext): Promise<void>;
        getEditorFile(ctx: import("../types").StrapiContext): Promise<void>;
        getPlayPage(ctx: import("../types").StrapiContext): Promise<void>;
        getAjax(ctx: import("../types").StrapiContext): Promise<void>;
    };
};
export default _default;
