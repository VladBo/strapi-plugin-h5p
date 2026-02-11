import { Core } from "@strapi/strapi";
import type { StrapiContext } from "../types";
declare const controller: ({ strapi }: {
    strapi: Core.Strapi;
}) => {
    findContent(ctx: StrapiContext): Promise<void>;
    findOneContent(ctx: StrapiContext): Promise<void>;
    createContent(ctx: StrapiContext): Promise<void>;
    updateContent(ctx: StrapiContext): Promise<void>;
    deleteContent(ctx: StrapiContext): Promise<void>;
    getLibraries(ctx: StrapiContext): Promise<void>;
    getAvailableLibraries(ctx: StrapiContext): Promise<void>;
    installLibrary(ctx: StrapiContext): Promise<void>;
    getContentTypeCache(ctx: StrapiContext): Promise<void>;
    updateContentTypeCache(ctx: StrapiContext): Promise<void>;
    getContentHubMetadataCache(ctx: StrapiContext): Promise<void>;
    updateContentHubMetadataCache(ctx: StrapiContext): Promise<void>;
    getEditorModel(ctx: StrapiContext): Promise<void>;
    getContentParams(ctx: StrapiContext): Promise<void>;
    saveContent(ctx: StrapiContext): Promise<void>;
    getLibraryFile(ctx: StrapiContext): Promise<void>;
    getContentFile(ctx: StrapiContext): Promise<void>;
    getCoreFile(ctx: StrapiContext): Promise<void>;
    getEditorFile(ctx: StrapiContext): Promise<void>;
    getPlayPage(ctx: StrapiContext): Promise<void>;
    getAjax(ctx: StrapiContext): Promise<void>;
};
export default controller;
