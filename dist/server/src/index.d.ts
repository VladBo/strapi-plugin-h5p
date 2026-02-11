/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
declare const index: {
    register: ({ strapi }: {
        strapi: import("@strapi/types/dist/core").Strapi;
    }) => void;
    bootstrap: ({ strapi }: {
        strapi: import("@strapi/types/dist/core").Strapi;
    }) => Promise<void>;
    config: {
        default: {};
        validator(): void;
    };
    controllers: {
        controller: ({ strapi }: {
            strapi: import("@strapi/types/dist/core").Strapi;
        }) => {
            findContent(ctx: import("./types").StrapiContext): Promise<void>;
            findOneContent(ctx: import("./types").StrapiContext): Promise<void>;
            createContent(ctx: import("./types").StrapiContext): Promise<void>;
            updateContent(ctx: import("./types").StrapiContext): Promise<void>;
            deleteContent(ctx: import("./types").StrapiContext): Promise<void>;
            getLibraries(ctx: import("./types").StrapiContext): Promise<void>;
            getAvailableLibraries(ctx: import("./types").StrapiContext): Promise<void>;
            installLibrary(ctx: import("./types").StrapiContext): Promise<void>;
            getContentTypeCache(ctx: import("./types").StrapiContext): Promise<void>;
            updateContentTypeCache(ctx: import("./types").StrapiContext): Promise<void>;
            getContentHubMetadataCache(ctx: import("./types").StrapiContext): Promise<void>;
            updateContentHubMetadataCache(ctx: import("./types").StrapiContext): Promise<void>;
            getEditorModel(ctx: import("./types").StrapiContext): Promise<void>;
            getContentParams(ctx: import("./types").StrapiContext): Promise<void>;
            saveContent(ctx: import("./types").StrapiContext): Promise<void>;
            getLibraryFile(ctx: import("./types").StrapiContext): Promise<void>;
            getContentFile(ctx: import("./types").StrapiContext): Promise<void>;
            getCoreFile(ctx: import("./types").StrapiContext): Promise<void>;
            getEditorFile(ctx: import("./types").StrapiContext): Promise<void>;
            getPlayPage(ctx: import("./types").StrapiContext): Promise<void>;
            getAjax(ctx: import("./types").StrapiContext): Promise<void>;
        };
    };
    routes: {
        "content-api": {
            type: string;
            routes: {
                method: string;
                path: string;
                handler: string;
                config: {
                    auth: boolean;
                };
            }[];
        };
    };
    services: {
        service: ({ strapi }: {
            strapi: import("@strapi/types/dist/core").Strapi;
        }) => {
            initialize(): Promise<void>;
            getInstalledLibraries(): Promise<any>;
            getAvailableLibraries(): Promise<any>;
            installLibrary(libraryId: string): Promise<any>;
            getContentTypeCache(): Promise<any>;
            updateContentTypeCache(): Promise<any>;
            getContentHubMetadataCache(): Promise<any>;
            updateContentHubMetadataCache(): Promise<any>;
            handleAjax({ action, query, user, method, body, files, }: import("./types").HandleAjaxArgs): Promise<any>;
            getContentParams(contentId: string): Promise<any>;
            saveContent(contentData: {
                [key: string]: any;
                library?: string | {
                    machineName?: string;
                    majorVersion?: number;
                    minorVersion?: number;
                };
                mainLibrary?: string | {
                    machineName?: string;
                    majorVersion?: number;
                    minorVersion?: number;
                };
                params?: any;
                metadata?: any;
            }, user?: import("./types").H5PUser): Promise<{
                id: any;
            }>;
            getLibraryFile(ubername: string, file: string): Promise<{
                stream: NodeJS.ReadableStream;
                mimeType: string;
            }>;
            getContentFile(contentId: string, file: string): Promise<{
                stream: NodeJS.ReadableStream;
                mimeType: string;
            }>;
            getCoreFile(type: string, file: string): Promise<{
                stream: NodeJS.ReadableStream;
                mimeType: string;
            }>;
            getEditorFile(type: string, file: string): Promise<{
                stream: NodeJS.ReadableStream;
                mimeType: string;
            }>;
            renderPlayer(contentId: string): Promise<any>;
            getEditorModel(contentId: string, user?: import("./types").H5PUser): Promise<any>;
            readFile(filePath: string): Promise<Buffer>;
            getMimeType: (filePath: string) => string;
        };
    };
    middlewares: {
        h5p: (config: unknown, { strapi, }: {
            strapi: Record<string, unknown> & {
                dirs: {
                    static: {
                        public: string;
                    };
                };
                log: {
                    error: (...args: unknown[]) => void;
                };
            };
        }) => (ctx: {
            request: {
                url: string;
            };
            type: string;
            body: unknown;
        }, next: () => Promise<void>) => Promise<void>;
    };
};
export default index;
