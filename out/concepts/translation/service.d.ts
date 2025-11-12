type TranslationCall = {
    methodName: string;
    params: string;
    start: number;
    end: number;
    keyType: 'flat' | 'nested';
};
type TranslationResult = TranslationCall & {
    translationValue: string | null;
    warningType?: 'missingLocale' | 'noLocale' | null;
    foundInLocale?: string;
};
/**
 * Service for processing translation calls and coordinating translation loading
 */
export declare class TranslationService {
    private translationRepository;
    private localeService;
    private projectService;
    constructor();
    /**
     * Find all m.methodName() and m["nested.key"]() calls in text
     * @param text The source code text to analyze
     * @returns Array of translation call objects
     */
    findTranslationCalls(text: string): TranslationCall[];
    /**
     * Load translations for a workspace and locale
     * @param workspacePath The workspace root path
     * @param locale The locale to load translations for
     * @returns The translations object or null if not found
     */
    loadTranslationsForLocale(workspacePath: string, locale: string): Promise<Record<string, unknown> | null>;
    /**
     * Process paraglide variant array to extract display value
     * @param variantArray The paraglide variant array
     * @returns The first match value from the variant or null if invalid
     */
    processParaglideVariant(variantArray: unknown): string | null;
    /**
     * Get translation value for a specific key (supports nested dot notation)
     * @param translations The translations object
     * @param key The translation key (can be nested like "login.inputs.email")
     * @returns The translation value or null if not found
     */
    getTranslation(translations: Record<string, unknown>, key: string): string | null;
    /**
     * Get nested value from object using dot notation
     * @param obj The object to traverse
     * @param path The dot-separated path (e.g., "login.inputs.email")
     * @returns The value at the path or undefined if not found
     */
    getNestedValue(obj: Record<string, unknown>, path: string): unknown;
    /**
     * Search for a translation key across all available locales
     * @param workspacePath The workspace root path
     * @param key The translation key to search for
     * @param currentLocale The current locale to exclude from search
     * @returns Object with {translation, locale} if found, null otherwise
     */
    searchKeyInAllLocales(workspacePath: string, key: string, currentLocale: string): Promise<{
        translation: string;
        locale: string;
    } | null>;
    /**
     * Process translation calls and return their resolved values with warning states
     * @param translationCalls Array of translation call objects
     * @param translations The translations object for current locale
     * @param workspacePath The workspace root path
     * @param currentLocale The current locale
     * @returns Array of objects with call info, translation values, and warning states
     */
    processTranslationCallsWithWarnings(translationCalls: TranslationCall[], translations: Record<string, unknown>, workspacePath: string, currentLocale: string): Promise<TranslationResult[]>;
    /**
     * Process translation calls and return their resolved values
     * @param translationCalls Array of translation call objects
     * @param translations The translations object
     * @returns Array of objects with call info and translation values
     */
    processTranslationCalls(translationCalls: TranslationCall[], translations: Record<string, unknown>): TranslationResult[];
}
export {};
//# sourceMappingURL=service.d.ts.map