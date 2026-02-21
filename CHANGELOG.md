# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2026-02-21

### Fixed
- Fixed H5P content types not appearing on fresh installation by pre-populating content type cache on bootstrap
- Updated GitHub repository URL in README

### Changed
- Content type cache now uses `forceUpdate()` method for more reliable cache updates

## [1.1.0] - 2026-02-16

### Added
- Postinstall script with setup instructions
- TypeScript source for CLI scripts
- ESLint and Prettier configuration
- EditorConfig for consistent formatting
- GitHub Actions CI workflow
- CHANGELOG.md

### Changed
- Scripts now written in TypeScript and compiled during build
- Improved build process with script compilation

## [1.0.1] - 2026-02-15

### Added
- Setup script (`npx strapi-plugin-h5p setup`) to download H5P core files
- `prepare` script for automatic build on GitHub installs

### Fixed
- TypeScript config updated to ES2021 and Bundler moduleResolution
- Fixed typing issue in h5p service config access

### Changed
- Removed `dist/` from git repository (now built on install)

## [1.0.0] - 2026-02-11

### Added
- Initial release
- H5P Editor custom field for Strapi
- H5P Hub integration for content type browsing
- Library installation from H5P Hub
- Content creation and editing
- API endpoints for H5P content serving
- Player rendering endpoint
- Middleware for H5P static file serving
