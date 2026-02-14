#!/usr/bin/env node
/**
 * H5P Core and Editor Setup Script
 * Downloads required H5P core and editor files from GitHub
 *
 * Usage: npx strapi-plugin-h5p setup
 *   or:  node node_modules/strapi-plugin-h5p/scripts/setup-h5p.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const GITHUB_CORE_URL = 'https://github.com/h5p/h5p-php-library/archive/refs/heads/master.zip';
const GITHUB_EDITOR_URL = 'https://github.com/h5p/h5p-editor-php-library/archive/refs/heads/master.zip';

// Find the Strapi project root by looking for package.json with @strapi/strapi
function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.dependencies?.['@strapi/strapi'] || pkg.devDependencies?.['@strapi/strapi']) {
          return dir;
        }
      } catch (e) {
        // Continue searching
      }
    }
    dir = path.dirname(dir);
  }
  // Fallback to cwd
  return process.cwd();
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    const request = (url) => {
      https.get(url, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          request(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

function extractZip(zipPath, destDir, stripPrefix) {
  // Create destination directory
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  try {
    // Use unzip command (available on macOS and most Linux)
    execSync(`unzip -q -o "${zipPath}" -d "${destDir}"`, { stdio: 'pipe' });

    // Move contents from the extracted directory (strip the prefix)
    const extractedDir = path.join(destDir, stripPrefix);
    if (fs.existsSync(extractedDir)) {
      const items = fs.readdirSync(extractedDir);
      for (const item of items) {
        const src = path.join(extractedDir, item);
        const dest = path.join(destDir, item);
        if (fs.existsSync(dest)) {
          fs.rmSync(dest, { recursive: true, force: true });
        }
        fs.renameSync(src, dest);
      }
      fs.rmSync(extractedDir, { recursive: true, force: true });
    }
  } catch (err) {
    throw new Error(`Failed to extract zip: ${err.message}`);
  }
}

async function setup() {
  console.log('Setting up H5P Core and Editor files...\n');

  const projectRoot = findProjectRoot();
  console.log(`Project root: ${projectRoot}`);

  const publicH5pDir = path.join(projectRoot, 'public', 'h5p', 'libraries');
  const coreDir = path.join(publicH5pDir, 'core');
  const editorDir = path.join(publicH5pDir, 'editor');
  const tempDir = path.join(projectRoot, '.h5p-temp');

  // Create directories
  fs.mkdirSync(coreDir, { recursive: true });
  fs.mkdirSync(editorDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Download and extract H5P Core
    console.log('Downloading H5P Core...');
    const coreZip = path.join(tempDir, 'h5p-core.zip');
    await downloadFile(GITHUB_CORE_URL, coreZip);

    console.log('Extracting H5P Core...');
    extractZip(coreZip, coreDir, 'h5p-php-library-master');

    // Download and extract H5P Editor
    console.log('Downloading H5P Editor...');
    const editorZip = path.join(tempDir, 'h5p-editor.zip');
    await downloadFile(GITHUB_EDITOR_URL, editorZip);

    console.log('Extracting H5P Editor...');
    extractZip(editorZip, editorDir, 'h5p-editor-php-library-master');

    // Cleanup
    console.log('Cleaning up...');
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n✓ H5P setup complete!');
    console.log(`  Core files: ${coreDir}`);
    console.log(`  Editor files: ${editorDir}`);

  } catch (err) {
    console.error('\n✗ H5P setup failed:', err.message);
    // Cleanup on failure
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    process.exit(1);
  }
}

// Run setup
setup();
