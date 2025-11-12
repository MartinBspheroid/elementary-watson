"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const repository_1 = require("./repository");
const service_1 = require("../locale/service");
const service_2 = require("../project/service");
/**
 * Service for processing translation calls and coordinating translation loading
 */
class TranslationService {
    translationRepository;
    localeService;
    projectService;
    constructor() {
        this.translationRepository = new repository_1.TranslationRepository();
        this.localeService = new service_1.LocaleService();
        this.projectService = new service_2.ProjectService();
    }
    /**
     * Find all m.methodName() and m["nested.key"]() calls in text
     * @param text The source code text to analyze
     * @returns Array of translation call objects
     */
    findTranslationCalls(text) {
        const calls = [];
        // Pattern 1: m.methodName() or m.methodName(params) - original flat key syntax
        const flatPattern = /\bm\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*([^)]*)\s*\)/g;
        // Pattern 2: m["nested.key"]() or m['nested.key']() - new nested key syntax
        const nestedPattern = /\bm\[(['"`])([^'"]+)\1\]\s*\(\s*([^)]*)\s*\)/g;
        let match;
        // Find flat key patterns
        while ((match = flatPattern.exec(text)) !== null) {
            calls.push({
                methodName: match[1],
                params: match[2].trim(),
                start: match.index,
                end: match.index + match[0].length,
                keyType: 'flat'
            });
        }
        // Find nested key patterns
        while ((match = nestedPattern.exec(text)) !== null) {
            calls.push({
                methodName: match[2], // The key inside the quotes
                params: match[3].trim(),
                start: match.index,
                end: match.index + match[0].length,
                keyType: 'nested'
            });
        }
        // Sort by position to maintain order
        calls.sort((a, b) => a.start - b.start);
        return calls;
    }
    /**
     * Load translations for a workspace and locale
     * @param workspacePath The workspace root path
     * @param locale The locale to load translations for
     * @returns The translations object or null if not found
     */
    async loadTranslationsForLocale(workspacePath, locale) {
        const translationPath = this.localeService.resolveTranslationPath(workspacePath, locale);
        return await this.translationRepository.loadTranslations(translationPath, locale);
    }
    /**
     * Process paraglide variant array to extract display value
     * @param variantArray The paraglide variant array
     * @returns The first match value from the variant or null if invalid
     */
    processParaglideVariant(variantArray) {
        try {
            // Get the first element of the array
            if (!Array.isArray(variantArray) || variantArray.length === 0) {
                return null;
            }
            const firstVariant = variantArray[0];
            // Check if it has the expected structure with a match property
            if (!firstVariant || typeof firstVariant !== 'object' || !firstVariant.match) {
                return null;
            }
            // Get the first value from the match object
            const matchValues = Object.values(firstVariant.match);
            if (matchValues.length === 0) {
                return null;
            }
            // Return the first match value
            return String(matchValues[0]);
        }
        catch (error) {
            console.error('Error processing paraglide variant:', error);
            return null;
        }
    }
    /**
     * Get translation value for a specific key (supports nested dot notation)
     * @param translations The translations object
     * @param key The translation key (can be nested like "login.inputs.email")
     * @returns The translation value or null if not found
     */
    getTranslation(translations, key) {
        if (!translations) {
            return null;
        }
        let value;
        // Try nested key lookup first (e.g., "login.inputs.email")
        if (key.includes('.')) {
            value = this.getNestedValue(translations, key);
        }
        else {
            // Fallback to flat key lookup for backward compatibility
            value = translations[key];
        }
        if (value === undefined || value === null) {
            return null;
        }
        // Case 1: Simple string value - return as-is
        if (typeof value === 'string') {
            return value;
        }
        // Case 2: Paraglide variant array - process and add asterisk
        if (Array.isArray(value)) {
            const variantValue = this.processParaglideVariant(value);
            if (variantValue) {
                return `${variantValue}*`;
            }
        }
        // Case 3: Unsupported format
        return null;
    }
    /**
     * Get nested value from object using dot notation
     * @param obj The object to traverse
     * @param path The dot-separated path (e.g., "login.inputs.email")
     * @returns The value at the path or undefined if not found
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            if (current && typeof current === 'object' && key in current) {
                return current[key];
            }
            return undefined;
        }, obj);
    }
    /**
     * Search for a translation key across all available locales
     * @param workspacePath The workspace root path
     * @param key The translation key to search for
     * @param currentLocale The current locale to exclude from search
     * @returns Object with {translation, locale} if found, null otherwise
     */
    async searchKeyInAllLocales(workspacePath, key, currentLocale) {
        try {
            const inlangSettings = this.localeService.loadInlangSettings(workspacePath);
            const availableLocales = inlangSettings?.locales || ['en'];
            // Search through all locales except the current one
            for (const locale of availableLocales) {
                if (locale === currentLocale)
                    continue;
                const translations = await this.loadTranslationsForLocale(workspacePath, locale);
                if (translations) {
                    const translationValue = this.getTranslation(translations, key);
                    if (translationValue) {
                        return {
                            translation: translationValue,
                            locale: locale
                        };
                    }
                }
            }
            return null;
        }
        catch (error) {
            console.error('Error searching key in all locales:', error);
            return null;
        }
    }
    /**
     * Process translation calls and return their resolved values with warning states
     * @param translationCalls Array of translation call objects
     * @param translations The translations object for current locale
     * @param workspacePath The workspace root path
     * @param currentLocale The current locale
     * @returns Array of objects with call info, translation values, and warning states
     */
    async processTranslationCallsWithWarnings(translationCalls, translations, workspacePath, currentLocale) {
        const results = [];
        for (const call of translationCalls) {
            const currentTranslation = this.getTranslation(translations, call.methodName);
            if (currentTranslation) {
                // Translation found in current locale - normal case
                results.push({
                    ...call,
                    translationValue: currentTranslation,
                    warningType: null
                });
            }
            else {
                // Translation missing in current locale - search other locales
                const searchResult = await this.searchKeyInAllLocales(workspacePath, call.methodName, currentLocale);
                if (searchResult) {
                    // Found in other locale(s) - show yellow warning
                    results.push({
                        ...call,
                        translationValue: searchResult.translation,
                        warningType: 'missingLocale',
                        foundInLocale: searchResult.locale
                    });
                }
                else {
                    // Not found in any locale - show red error
                    results.push({
                        ...call,
                        translationValue: null,
                        warningType: 'noLocale'
                    });
                }
            }
        }
        return results;
    }
    /**
     * Process translation calls and return their resolved values
     * @param translationCalls Array of translation call objects
     * @param translations The translations object
     * @returns Array of objects with call info and translation values
     */
    processTranslationCalls(translationCalls, translations) {
        const results = [];
        for (const call of translationCalls) {
            const translationValue = this.getTranslation(translations, call.methodName);
            if (translationValue) {
                results.push({
                    ...call,
                    translationValue
                });
            }
        }
        return results;
    }
}
exports.TranslationService = TranslationService;
//# sourceMappingURL=service.js.map