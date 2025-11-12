"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractionService = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const human_id_1 = require("human-id");
const service_1 = require("../locale/service");
const repository_1 = require("../translation/repository");
const service_2 = require("../project/service");
/**
 * Service for extracting strings and adding them to locale files
 */
class ExtractionService {
    localeService;
    translationRepository;
    projectService;
    constructor() {
        this.localeService = new service_1.LocaleService();
        this.translationRepository = new repository_1.TranslationRepository();
        this.projectService = new service_2.ProjectService();
    }
    /**
     * Strip matching quotes from text if present
     * @param text The text to process
     * @returns Text with matching outer quotes removed
     */
    stripMatchingQuotes(text) {
        if (!text || text.length < 2) {
            return text;
        }
        const firstChar = text[0];
        const lastChar = text[text.length - 1];
        // Check if first and last characters are matching quotes
        if ((firstChar === '"' && lastChar === '"') ||
            (firstChar === "'" && lastChar === "'") ||
            (firstChar === '`' && lastChar === '`')) {
            return text.slice(1, -1);
        }
        return text;
    }
    /**
     * Extract selected text and add to locale files
     * @param editor The active text editor
     * @returns True if extraction was successful
     */
    async extractSelectedText(editor) {
        try {
            if (!editor || !editor.selection || editor.selection.isEmpty) {
                vscode.window.showErrorMessage('Please select text to extract');
                return false;
            }
            const rawSelectedText = editor.document.getText(editor.selection).trim();
            if (!rawSelectedText) {
                vscode.window.showErrorMessage('Selected text is empty');
                return false;
            }
            // Strip matching quotes if present
            const selectedText = this.stripMatchingQuotes(rawSelectedText);
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return false;
            }
            const workspacePath = workspaceFolder.uri.fsPath;
            // Check if the exact text already exists in translations (using cleaned text)
            const existingKey = await this.findExistingTranslation(workspacePath, selectedText);
            if (existingKey) {
                // Auto-interpolate with existing key without asking
                return await this.replaceTextWithKey(editor, existingKey);
            }
            // Generate new key
            const newKey = await this.generateUniqueKey(workspacePath);
            if (!newKey) {
                vscode.window.showErrorMessage('Failed to generate unique key');
                return false;
            }
            // Get interpolation choice from user (showing the real key name)
            const interpolationType = await this.getUserInterpolationChoice(editor.document.languageId, newKey);
            if (!interpolationType) {
                return false; // User cancelled
            }
            // Add to locale files (using cleaned text)
            const success = await this.addToLocaleFiles(workspacePath, newKey, selectedText);
            if (!success) {
                vscode.window.showErrorMessage('Failed to update locale files');
                return false;
            }
            // Replace selected text with key call
            const keyCall = this.formatKeyCall(newKey, interpolationType);
            return await this.replaceSelectedText(editor, keyCall);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error during text extraction:', error);
            vscode.window.showErrorMessage(`Failed to extract text: ${errorMessage}`);
            return false;
        }
    }
    /**
     * Find if the exact text already exists in any translation (supports nested keys)
     * @param workspacePath The workspace root path
     * @param text The text to search for
     * @returns The existing key or null if not found
     */
    async findExistingTranslation(workspacePath, text) {
        try {
            const inlangSettings = this.localeService.loadInlangSettings(workspacePath);
            const baseLocale = inlangSettings?.baseLocale || 'en';
            // Check in base locale first
            const baseTranslationPath = this.localeService.resolveTranslationPath(workspacePath, baseLocale);
            const baseTranslations = await this.translationRepository.loadTranslations(baseTranslationPath, baseLocale);
            if (baseTranslations) {
                const foundKey = this.searchInTranslations(baseTranslations, text);
                if (foundKey) {
                    return foundKey;
                }
            }
            return null;
        }
        catch (error) {
            console.error('Error finding existing translation:', error);
            return null;
        }
    }
    /**
     * Recursively search for text in translations (supports nested objects)
     * @param obj The translations object to search
     * @param text The text to search for
     * @param prefix The key prefix for nested objects
     * @returns The found key or null
     */
    searchInTranslations(obj, text, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
            const currentKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'string' && value === text) {
                return currentKey;
            }
            else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Recursively search nested objects
                const nestedResult = this.searchInTranslations(value, text, currentKey);
                if (nestedResult) {
                    return nestedResult;
                }
            }
        }
        return null;
    }
    /**
     * Generate a unique human-readable key
     * @param workspacePath The workspace root path
     * @returns The generated unique key or null if failed
     */
    async generateUniqueKey(workspacePath) {
        try {
            const inlangSettings = this.localeService.loadInlangSettings(workspacePath);
            const baseLocale = inlangSettings?.baseLocale || 'en';
            const baseTranslationPath = this.localeService.resolveTranslationPath(workspacePath, baseLocale);
            const baseTranslations = (await this.translationRepository.loadTranslations(baseTranslationPath, baseLocale)) || {};
            // Try to generate unique key up to 10 times
            for (let i = 0; i < 10; i++) {
                const key = (0, human_id_1.humanId)({
                    separator: '_',
                    capitalize: false,
                    adjectiveCount: 2,
                    addAdverb: false
                });
                if (!baseTranslations[key]) {
                    return key;
                }
            }
            // If we couldn't generate a unique key, add a timestamp
            const key = (0, human_id_1.humanId)({
                separator: '_',
                capitalize: false,
                adjectiveCount: 2,
                addAdverb: false
            });
            return `${key}_${Date.now()}`;
        }
        catch (error) {
            console.error('Error generating unique key:', error);
            return null;
        }
    }
    /**
     * Get user's choice for interpolation type
     * @param languageId The language ID of the current file
     * @param keyName The actual key name to show in options (optional)
     * @returns 'template' for {m.key()}, 'code' for m.key(), or null if cancelled
     */
    async getUserInterpolationChoice(languageId, keyName = 'key') {
        const isSvelteTemplate = languageId === 'svelte';
        const options = [
            {
                label: isSvelteTemplate
                    ? `{m.${keyName}()} - For Svelte template (recommended)`
                    : `m.${keyName}() - For JavaScript/TypeScript code (recommended)`,
                value: isSvelteTemplate ? 'template' : 'code'
            },
            {
                label: isSvelteTemplate
                    ? `m.${keyName}() - For JavaScript/TypeScript code`
                    : `{m.${keyName}()} - For Svelte template`,
                value: isSvelteTemplate ? 'code' : 'template'
            }
        ];
        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Choose interpolation format for the extracted text'
        });
        return selected ? selected.value : null;
    }
    /**
     * Add the new key-value pair to all locale files
     * @param workspacePath The workspace root path
     * @param key The translation key
     * @param value The translation value
     * @returns True if successful
     */
    async addToLocaleFiles(workspacePath, key, value) {
        try {
            const inlangSettings = this.localeService.loadInlangSettings(workspacePath);
            const availableLocales = inlangSettings?.locales || ['en'];
            const baseLocale = inlangSettings?.baseLocale || 'en';
            // Save base locale first
            await this.updateLocaleFile(workspacePath, baseLocale, key, value);
            // Wait 2 seconds as requested
            await new Promise((resolve) => setTimeout(resolve, 2000));
            // Save other locales with empty strings
            for (const locale of availableLocales) {
                if (locale !== baseLocale) {
                    await this.updateLocaleFile(workspacePath, locale, key, '');
                }
            }
            return true;
        }
        catch (error) {
            console.error('Error adding to locale files:', error);
            return false;
        }
    }
    /**
     * Update a specific locale file with new key-value pair (supports nested keys)
     * @param workspacePath The workspace root path
     * @param locale The locale to update
     * @param key The translation key (can be nested like "login.inputs.email")
     * @param value The translation value
     */
    async updateLocaleFile(workspacePath, locale, key, value) {
        try {
            const translationPath = this.localeService.resolveTranslationPath(workspacePath, locale);
            // Load existing translations or create empty object
            let translations = {};
            if (fs.existsSync(translationPath)) {
                const content = fs.readFileSync(translationPath, 'utf8');
                translations = JSON.parse(content);
            }
            else {
                // Ensure directory exists
                const dir = path.dirname(translationPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
            }
            // Set the nested or flat key-value pair
            this.setNestedValue(translations, key, value);
            // Write back to file maintaining original key order
            fs.writeFileSync(translationPath, JSON.stringify(translations, null, 2) + '\n', 'utf8');
            console.log(`✅ Updated ${locale} locale file: ${key} = "${value}"`);
        }
        catch (error) {
            console.error(`Error updating locale file for ${locale}:`, error);
            throw error;
        }
    }
    /**
     * Set nested value in object using dot notation
     * @param obj The object to modify
     * @param path The dot-separated path (e.g., "login.inputs.email")
     * @param value The value to set
     */
    setNestedValue(obj, path, value) {
        if (!path.includes('.')) {
            // Simple flat key
            obj[path] = value;
            return;
        }
        const keys = path.split('.');
        const lastKey = keys.pop();
        if (!lastKey) {
            return;
        }
        // Navigate to the parent object, creating nested objects as needed
        let current = obj;
        for (const key of keys) {
            if (current[key] === undefined || typeof current[key] !== 'object' || Array.isArray(current[key])) {
                current[key] = {};
            }
            current = current[key];
        }
        current[lastKey] = value;
    }
    /**
     * Format key call based on key type and interpolation preference
     * @param key The translation key
     * @param interpolationType 'template' or 'code'
     * @returns The formatted key call
     */
    formatKeyCall(key, interpolationType) {
        const isTemplate = interpolationType === 'template';
        if (key.includes('.')) {
            // Nested key - use bracket notation
            const keyCall = `m["${key}"]()`;
            return isTemplate ? `{${keyCall}}` : keyCall;
        }
        else {
            // Flat key - use dot notation for backward compatibility
            const keyCall = `m.${key}()`;
            return isTemplate ? `{${keyCall}}` : keyCall;
        }
    }
    /**
     * Replace selected text with the key call
     * @param editor The text editor
     * @param replacement The replacement text
     * @returns True if successful
     */
    async replaceSelectedText(editor, replacement) {
        try {
            await editor.edit((editBuilder) => {
                editBuilder.replace(editor.selection, replacement);
            });
            // Focus back on the editor
            await vscode.window.showTextDocument(editor.document, editor.viewColumn);
            return true;
        }
        catch (error) {
            console.error('Error replacing selected text:', error);
            return false;
        }
    }
    /**
     * Replace text with existing key
     * @param editor The text editor
     * @param existingKey The existing translation key
     * @returns True if successful
     */
    async replaceTextWithKey(editor, existingKey) {
        const interpolationType = await this.getUserInterpolationChoice(editor.document.languageId, existingKey);
        if (!interpolationType) {
            return false;
        }
        const keyCall = this.formatKeyCall(existingKey, interpolationType);
        return await this.replaceSelectedText(editor, keyCall);
    }
}
exports.ExtractionService = ExtractionService;
//# sourceMappingURL=service.js.map