import type { H5PUser, H5PConfigState } from "./types";
export declare const getErrorMessage: (err: unknown) => string;
export declare const resolveUser: (user?: H5PUser | null) => H5PUser;
export declare const getMimeType: (filePath: string) => string;
export declare function safeJsonParse(value: unknown): unknown;
export declare const buildLibrary: (input?: {
    machineName?: string;
    majorVersion?: number;
    minorVersion?: number;
}) => string | undefined;
export declare const resolveLibrary: (payload: Record<string, unknown> | undefined) => string | undefined;
export declare const normalizeLibrary: (value?: string) => string | undefined;
export declare const createSlug: (title: string) => string;
export declare const getFileStreamResponse: (filePath: string) => {
    stream: NodeJS.ReadableStream;
    mimeType: string;
};
export declare const getMainLibraryVersion: (metadata: {
    mainLibrary?: string;
    preloadedDependencies?: any[];
}) => string;
export declare const getConfigOrThrow: (state: {
    h5pConfig: H5PConfigState | null;
}) => H5PConfigState;
