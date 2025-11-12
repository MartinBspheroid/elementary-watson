/**
 * Repository for loading translation data from files
 */
export declare class TranslationRepository {
    /**
     * Load translations for the specified locale
     * @param translationFilePath The full path to the translation file
     * @param locale The locale for logging purposes
     * @returns The translations object or null if not found
     */
    loadTranslations(translationFilePath: string, locale: string): Promise<Record<string, unknown> | null>;
    /**
     * Check if a translation file exists
     * @param translationFilePath The full path to the translation file
     * @returns True if the file exists
     */
    translationFileExists(translationFilePath: string): boolean;
}
//# sourceMappingURL=repository.d.ts.map