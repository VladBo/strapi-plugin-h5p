import type { Core } from "@strapi/strapi";

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const h5pService = strapi.plugin("h5p").service("service");
  await h5pService.initialize();

  // Pre-populate H5P content type cache from H5P Hub in the background
  // so the editor shows content types immediately on first load
  h5pService
    .updateContentTypeCache()
    .then(() => {
      strapi.log.info("H5P content type cache updated successfully");
    })
    .catch((err: Error) => {
      strapi.log.warn(
        "H5P content type cache update failed (hub may be unreachable):",
        err.message,
      );
    });
};

export default bootstrap;
