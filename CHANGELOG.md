# Change Log

All notable changes to the "poirot" extension will be documented in this file.

> **Note**: This extension was renamed from "ElementaryWatson" to "Poirot" as of version 0.6.0. All references to `elementaryWatson` in configuration and commands have been changed to `poirot`.

## [0.6.0] - TBD
### Changed
- **Project Renamed**: Extension renamed from "ElementaryWatson" to "Poirot"
- **Breaking Changes**: All configuration keys, command IDs, and view IDs have been updated:
  - `poirot.*` → `poirot.*` (configuration keys)
  - All command IDs updated to use `poirot` prefix
  - All view IDs updated to use `poirot` prefix
- **UI Improvements**:
  - Replaced checkmark icon with filled circle (●) for active project indicator
  - Truncated file paths in translation keys view to last 4 segments
  - Changed "No locale defined" to concise `<missing>` label
  - Removed redundant "→ click to navigate" text from translation items

## [0.5.1] - 2025-09-16 
  - Navigate to translation value when value is empty string

## [0.5.0] - 2025-09-16 
  - Typescript/javascript with jsx support

## [0.4.0] - 2025-08-26 
  - Nested keys support

## [0.3.0] - 2025-07-22

### Removed
  - **Sidebar Refresh Command**: Removed manual refresh command (`elementaryWatson.refreshSidebar`) from sidebar functionality
  - Better labels when missing translation or no translations
  - Better format of titles in the UI

## [0.2.0] - 2025-07-22

### Added
- **New Sidebar UI**: Dedicated sidebar view to showcase current translation keys in the active file
- **Enhanced Navigation**: Made translation labels clickable in both the editor (via CodeLens) and extension UI for quick navigation to translation files
- **Real-time Updates**: Configurable real-time translation label updates while typing with debounce delay settings (100-2000ms)
- **Configuration Options**: 
  - `poirot.defaultLocale`: Set default locale for displaying translation labels
  - `poirot.realtimeUpdates`: Toggle real-time updates on/off
  - `poirot.updateDelay`: Configure debounce delay for real-time updates
- **Improved Commands**:
  - `poirot.refreshSidebar`: Refresh sidebar content
  - `poirot.openTranslationFile`: Open translation files directly from UI
- **Enhanced Text Extraction**: Improved extraction service with automatic quote stripping functionality

### Changed
- **Preserved Key Order**: Translation file updates now maintain the original key order in language JSON files (no reordering)
- **Enhanced File Watching**: Improved file watchers for translation files to support real-time sidebar updates

### Improved
- Better user experience with clickable labels for seamless navigation between code and translation files
- More responsive UI with configurable update delays to balance performance and real-time feedback

## [0.1.0] - 2025-07-21

### Added
- **Initial Release**: Basic extension functionality for Paraglide JS i18n integration
- **Translation Label Display**: Simple inline display of translation values for Paraglide JS i18n method calls in Svelte/SvelteKit applications
- **Text Extraction Logic**: Core functionality to extract text and recreate language JSON files
- **Basic Commands**:
  - `poirot.changeLocale`: Change label locales
  - `poirot.extractText`: Extract text to locale files
- **Multi-language Support**: Activation for JavaScript, TypeScript, and Svelte files
- **License and Documentation**: Added MIT license and initial documentation

[0.6.0]: https://github.com/romerramos/poirot/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/romerramos/poirot/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/romerramos/poirot/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/romerramos/poirot/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/romerramos/poirot/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/romerramos/poirot/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/romerramos/poirot/releases/tag/v0.1.0