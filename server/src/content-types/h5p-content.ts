export default {
  schema: {
    kind: 'collectionType' as const,
    collectionName: 'h5p_contents',
    info: {
      singularName: 'h5p-content',
      pluralName: 'h5p-contents',
      displayName: 'H5P Content',
      description: 'Interactive H5P content',
    },
    options: {
      draftAndPublish: true,
    },
    pluginOptions: {},
    attributes: {
      title: {
        type: 'string',
        required: true,
      },
      h5pContent: {
        type: 'customField',
        customField: 'plugin::h5p.h5p-editor',
      },
    },
  },
};
