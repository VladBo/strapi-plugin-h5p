#!/usr/bin/env node
/**
 * Postinstall script - displays setup instructions after npm install
 */

const message = `
\x1b[36m╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   \x1b[1m\x1b[33mstrapi-plugin-h5p\x1b[0m\x1b[36m installed successfully!                  ║
║                                                               ║
║   \x1b[0mTo complete setup, run:\x1b[36m                                     ║
║                                                               ║
║   \x1b[1m\x1b[32mnpx strapi-plugin-h5p setup\x1b[0m\x1b[36m                                 ║
║                                                               ║
║   \x1b[0mThis downloads required H5P core files.\x1b[36m                      ║
║   See README for full configuration instructions.             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝\x1b[0m
`;

console.log(message);
