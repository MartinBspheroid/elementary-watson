# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Poirot** is a VS Code extension that displays inline translation values for Paraglide JS i18n method calls in Svelte/SvelteKit applications. It previously named ElementaryWatson (v0.6.0+) and provides an alternative to the Sherlock extension with focused functionality for displaying and extracting translation strings.

- **Type**: VS Code Extension
- **Language**: JavaScript (Node.js CommonJS)
- **Main Entry**: `extension.js`
- **Version**: 0.5.2

## Architecture Overview

The extension follows a **service-oriented, concept-based architecture** organized in the `concepts/` directory:

```
concepts/
├── extension/        ExtensionActivator - lifecycle & event orchestration
├── editor/          EditorService - document processing & display
├── locale/          LocaleService - locale/configuration management
├── translation/     TranslationService - translation lookup & processing
├── project/         ProjectService - monorepo project detection
├── sidebar/         SidebarService - sidebar views (project selector & translation keys)
├── extraction/      ExtractionService - text extraction to translation files
```

### Key Architectural Patterns

1. **Service Locator Pattern**: Each concept is a standalone service (e.g., `EditorService`, `TranslationService`, `LocaleService`) that encapsulates domain logic.

2. **Event-Driven Architecture**: The `ExtensionActivator` orchestrates services and manages VS Code event listeners:
   - Document change events (with debouncing for real-time updates)
   - File save events
   - Editor tab switching
   - Configuration changes
   - File system watchers for translation files

3. **Repository Pattern**: `TranslationRepository` handles file I/O for translation JSON files.

4. **Monorepo Support**: `ProjectService` scans for `project.inlang/settings.json` files to support multi-project workspaces.

### Data Flow

1. **User opens/edits a document** → `ExtensionActivator` detects via event listeners
2. **EditorService.processDocument()** → finds all `m.methodName()` calls using regex
3. **TranslationService.findTranslationCalls()** → parses flat (`m.key()`) and nested (`m["nested.key"]()`) syntax
4. **LocaleService** → resolves translation file path based on inlang config or fallback
5. **TranslationRepository** → loads JSON translations
6. **EditorDecorator** → renders inline decorations in the editor
7. **TranslationCodeLensProvider** → provides CodeLens for navigation

## Common Development Tasks

### Run Tests
```bash
npm test
```

### Run Linting
```bash
npm run lint
```

### Run Linting & Pre-test
```bash
npm run pretest
```

### Build/Package for Distribution
```bash
# For VSCode extensions, no build step is needed (this is a pure JS extension)
# To package for release, use:
npm install -g vsce
vsce package
```

### Debug the Extension
1. Press F5 in VS Code to launch the extension in a debug window
2. Open the VS Code Developer Tools (`Help → Toggle Developer Tools`)
3. Check the console for logs (prefixed with emojis like 🔍, 💾, ✏️)

### Key npm Scripts
- `npm lint`: Run ESLint
- `npm test`: Run tests (also runs lint via pretest)

## Code Patterns & Conventions

### File Organization
- **Service classes** end with `Service` (e.g., `EditorService`, `TranslationService`)
- **Provider classes** (TreeDataProvider) end with `Provider` (e.g., `ProjectSelectorProvider`)
- **Repository classes** end with `Repository` (e.g., `TranslationRepository`)
- **Decorator classes** handle VS Code UI decorations

### Naming Conventions
- **Configuration keys**: Use `poirot.*` namespace (e.g., `poirot.defaultLocale`)
- **Commands**: Use `poirot.*` prefix (e.g., `poirot.changeLocale`)
- **Context keys**: Use `elementaryWatson.*` and `poirot.*` (note: some legacy names still exist)
- **Translation calls**: Only recognize variable name `m` (e.g., `m.hello()`)

### Translation Call Patterns
The extension recognizes two syntax patterns:
- **Flat keys**: `m.hello_world()` or `m.hello_world(params)`
- **Nested keys**: `m["login.inputs.email"]()` or `m['login.inputs.email']()`

Both patterns are parsed by `TranslationService.findTranslationCalls()` using regex.

### Locale Resolution Priority
1. VS Code workspace setting (`poirot.defaultLocale`)
2. `baseLocale` from `project.inlang/settings.json`
3. Default fallback: `"en"`

### Translation File Path Resolution
- **If inlang config exists**: Uses `pathPattern` from `plugin.inlang.messageFormat` (e.g., `./messages/{locale}.json`)
- **Fallback**: Looks for `./messages/{locale}.json`
- **inlang monorepo support**: Scans for `project.inlang/settings.json` and allows selecting active project

### Debouncing Strategy
- **Real-time updates**: Debounced document changes (default 300ms, configurable)
- **Smart filtering**: Only updates if changes might affect translation calls or positions
- **Always updates on**: File save, tab switch, locale change, configuration change

### Sidebar Behavior
- **Project Selector View**: Shows detected `project.inlang` projects; allows selecting active project
- **Translation Keys View**: Shows translation keys found in current document; preserved when switching to translation files

## Key Files & Their Responsibilities

### Core Extension Files
- **`extension.js`** (23 lines): Entry point; creates and calls `ExtensionActivator`
- **`concepts/extension/activator.js`** (629 lines): Orchestrates all services, manages lifecycle, event listeners, and debouncing

### Editor & Decoration
- **`concepts/editor/service.js`**: Processes documents, finds translation calls, loads translations, applies decorations
- **`concepts/editor/decorator.js`**: Creates and manages inline decorations (colored underlines, warning indicators)
- **`concepts/editor/codelens.js`**: Provides CodeLens actions for navigating to translation files

### Translation Resolution
- **`concepts/translation/service.js`** (261 lines): Finds translation calls, resolves values, handles nested keys, searches across locales
- **`concepts/translation/repository.js`**: Loads translation JSON files from disk

### Configuration & Locale
- **`concepts/locale/service.js`**: Manages current locale, loads inlang settings, resolves translation file paths
- **`concepts/project/service.js`** (198 lines): Scans for and manages `project.inlang` projects in monorepos

### UI & Sidebar
- **`concepts/sidebar/service.js`**: Opens translation files, determines available locales
- **`concepts/sidebar/project-provider.js`**: TreeDataProvider for project selector view
- **`concepts/sidebar/translation-keys-provider.js`**: TreeDataProvider for translation keys view

### Text Extraction
- **`concepts/extraction/service.js`**: Extracts selected text to translation files with user-friendly key generation

## Important Implementation Details

### Real-Time Update Logic
The extension uses `shouldUpdateForChange()` in `ExtensionActivator` to intelligently decide whether a document change warrants an update:
- Multi-line changes always trigger updates (they affect positioning)
- Changes containing `m.`, `()`, or text deletion trigger updates
- Single-character edits in non-translation positions are skipped

### Translation File Watching
- File watchers are created for each locale's translation file
- When a translation file changes, the extension refreshes decorations if the file is currently active
- **Sidebar context preservation**: If the active editor is a translation file, the sidebar preserves the previous document's translation keys (shows them with updated values)

### Warning System
The extension shows three states for translation calls:
1. **Normal** (green underline): Translation found in current locale
2. **Warning** (yellow underline): Translation missing in current locale but found in another locale
3. **Error** (red underline): Translation not found in any available locale

### CodeLens Integration
- Registers a `TranslationCodeLensProvider` that creates "Open Translation File" CodeLens actions
- Clicking a CodeLens opens the translation file and jumps to the corresponding key

## Configuration (VS Code Settings)

These settings are defined in `package.json` under `contributes.configuration.properties`:

- **`poirot.defaultLocale`** (string, default: "en")
  - Locale code for displaying translations (e.g., "en", "es", "fr")
  - Pattern: `^[a-z]{2}(-[A-Z]{2})?$`

- **`poirot.realtimeUpdates`** (boolean, default: true)
  - Enable/disable real-time updates while typing
  - When disabled, labels only update on save

- **`poirot.updateDelay`** (number, default: 300, min: 100, max: 2000)
  - Milliseconds to wait after typing stops before updating labels

- **`poirot.activeProject`** (string or null, default: null)
  - The active project path relative to workspace root
  - Automatically set when selecting a project from the project selector

## Commands

All commands are registered in `ExtensionActivator`:

- **`poirot.changeLocale`**: Opens input box to change the display locale
- **`poirot.extractText`**: Extracts selected text to translation files (with fuzzy-matched key generation)
- **`poirot.selectProject`**: Shows project selection dialog for monorepo support
- **`poirot.openTranslationFile`**: Opens translation file at a specific key location
- **`poirot.clickTranslationLabel`**: Internal command fired when clicking a translation label

## Testing

- **Test file**: `test/extension.test.js`
- **Framework**: Mocha (via `@vscode/test-cli` and `@vscode/test-electron`)
- **Run tests**: `npm test`

The extension is built primarily with integration tests in mind (testing with actual VS Code windows).

## Common Gotchas & Edge Cases

1. **Variable name must be `m`**: The extension only recognizes `m.key()` calls; aliases like `import * as i18n from '...'` will not be detected.

2. **JSON parsing in translation files**: Translation values can be:
   - Simple strings: `"hello": "Hello World"`
   - Paraglide variant arrays: `"hello": [{match: {...}, text: "..."}]` (special handling with `*` suffix)
   - Nested objects: Accessible via dot notation `"login.inputs.email"`

3. **Monorepo detection**: The extension scans for `project.inlang/settings.json` files. If none are found, it defaults to the workspace root.

4. **Path resolution**: `pathPattern` in inlang settings uses `{locale}` as a placeholder, e.g., `./messages/{locale}.json` → resolves to `./messages/en.json`.

5. **Translation file watching**: Watchers are set up for each detected locale. If you add a new locale file, you may need to select a different project and reselect the current one to refresh the watchers.

6. **Context variables**: Legacy context keys like `elementaryWatson.showSidebar` are still used in `package.json`; the codebase uses both old and new naming conventions.

## Debugging Tips

- **Extension console logs**: Check `Help → Toggle Developer Tools → Console` for debug output (emojis: 🔍, 💾, ✏️, 🔄, 📋, 🎯, ⏱️)
- **Check active project**: Look at VS Code settings (`poirot.activeProject`) to see which project is selected
- **Verify translation file paths**: Use `LocaleService.resolveTranslationPath()` to debug path resolution
- **Test regex patterns**: Use `TranslationService.findTranslationCalls()` to verify translation call detection
- **File watcher issues**: Check console logs for `🔍 Watching translation file:` messages

## Dependencies

- **vscode**: The VS Code Extension API
- **human-id**: For generating human-readable keys during text extraction
- **mocha, @vscode/test-cli, @vscode/test-electron**: For testing
- **eslint**: For code linting

## Performance Considerations

- **Debouncing**: Real-time updates are debounced to avoid excessive processing during rapid typing
- **Smart change detection**: Only processes changes that likely affect translation calls
- **File watching**: Watchers are created per-locale; consider performance impact in monorepos with many locales
- **Large files**: Real-time updates work best with files under 1000 lines; can be disabled for very large files
