import type { RegisterTradsParams, StrapiApp } from "./types";
declare const _default: {
    register(app: StrapiApp): void;
    registerTrads({ locales }: RegisterTradsParams): Promise<{
        data: {};
        locale: string;
    }[]>;
};
export default _default;
