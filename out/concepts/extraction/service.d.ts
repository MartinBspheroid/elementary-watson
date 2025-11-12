import * as vscode from 'vscode';
/**
 * Service for extracting strings and adding them to locale files
 */
export declare class ExtractionService {
    private localeService;
    private translationRepository;
    private projectService;
    constructor();
    /**
     * Strip matching quotes from text if present
     * @param text The text to process
     * @returns Text with matching outer quotes removed
     */
    stripMatchingQuotes(text: string): string;
    /**
     * Extract selected text and add to locale files
     * @param editor The active text editor
     * @returns True if extraction was successful
     */
    extractSelectedText(editor: vscode.TextEditor): Promise<boolean>;
    /**
     * Find if the exact text already exists in any translation (supports nested keys)
     * @param workspacePath The workspace root path
     * @param text The text to search for
     * @returns The existing key or null if not found
     */
    findExistingTranslation(workspacePath: string, text: string): Promise<string | null>;
    /**
     * Recursively search for text in translations (supports nested objects)
     * @param obj The translations object to search
     * @param text The text to search for
     * @param prefix The key prefix for nested objects
     * @returns The found key or null
     */
    private searchInTranslations;
    /**
     * Generate a unique human-readable key
     * @param workspacePath The workspace root path
     * @returns The generated unique key or null if failed
     */
    generateUniqueKey(workspacePath: string): Promise<string | null>;
    /**
     * Get user's choice for interpolation type
     * @param languageId The language ID of the current file
     * @param keyName The actual key name to show in options (optional)
     * @returns 'template' for {m.key()}, 'code' for m.key(), or null if cancelled
     */
    getUserInterpolationChoice(languageId: string, keyName?: string): Promise<'template' | 'code' | null>;
    /**
     * Add the new key-value pair to all locale files
     * @param workspacePath The workspace root path
     * @param key The translation key
     * @param value The translation value
     * @returns True if successful
     */
    addToLocaleFiles(workspacePath: string, key: string, value: string): Promise<boolean>;
    /**
     * Update a specific locale file with new key-value pair (supports nested keys)
     * @param workspacePath The workspace root path
     * @param locale The locale to update
     * @param key The translation key (can be nested like "login.inputs.email")
     * @param value The translation value
     */
    updateLocaleFile(workspacePath: string, locale: string, key: string, value: string): Promise<void>;
    /**
     * Set nested value in object using dot notation
     * @param obj The object to modify
     * @param path The dot-separated path (e.g., "login.inputs.email")
     * @param value The value to set
     */
    private setNestedValue;
    /**
     * Format key call based on key type and interpolation preference
     * @param key The translation key
     * @param interpolationType 'template' or 'code'
     * @returns The formatted key call
     */
    formatKeyCall(key: string, interpolationType: 'template' | 'code'): string;
    /**
     * Replace selected text with the key call
     * @param editor The text editor
     * @param replacement The replacement text
     * @returns True if successful
     */
    replaceSelectedText(editor: vscode.TextEditor, replacement: string): Promise<boolean>;
    /**
     * Replace text with existing key
     * @param editor The text editor
     * @param existingKey The existing translation key
     * @returns True if successful
     */
    replaceTextWithKey(editor: vscode.TextEditor, existingKey: string): Promise<boolean>;
}
//# sourceMappingURL=service.d.ts.map