/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
declare const _default: {
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
        handleAjax({ action, query, user, method, body, files, }: import("../types").HandleAjaxArgs): Promise<any>;
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
        }, user?: import("../types").H5PUser): Promise<{
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
        getEditorModel(contentId: string, user?: import("../types").H5PUser): Promise<any>;
        readFile(filePath: string): Promise<Buffer>;
        getMimeType: (filePath: string) => string;
    };
};
export default _default;
