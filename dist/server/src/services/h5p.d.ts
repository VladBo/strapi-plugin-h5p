/// <reference types="node" />
/// <reference types="node" />
import type { H5PUser, HandleAjaxArgs } from "../types";
import { Core } from "@strapi/strapi";
declare const service: ({ strapi }: {
    strapi: Core.Strapi;
}) => {
    initialize(): Promise<void>;
    getInstalledLibraries(): Promise<any>;
    getAvailableLibraries(): Promise<any>;
    installLibrary(libraryId: string): Promise<any>;
    getContentTypeCache(): Promise<any>;
    updateContentTypeCache(): Promise<any>;
    getContentHubMetadataCache(): Promise<any>;
    updateContentHubMetadataCache(): Promise<any>;
    handleAjax({ action, query, user, method, body, files, }: HandleAjaxArgs): Promise<any>;
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
    }, user?: H5PUser | null): Promise<{
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
    getEditorModel(contentId: string | null, user?: H5PUser | null): Promise<any>;
    readFile(filePath: string): Promise<Buffer>;
    getMimeType: (filePath: string) => string;
};
export default service;
