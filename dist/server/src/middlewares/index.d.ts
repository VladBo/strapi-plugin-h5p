declare const _default: {
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
export default _default;
