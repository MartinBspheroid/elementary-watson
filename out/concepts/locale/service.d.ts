type InlangSettings = {
    baseLocale?: string;
    locales?: string[];
    'plugin.inlang.messageFormat'?: {
        pathPattern?: string;
    };
};
/**
 * Service for managing locale configuration and inlang project settings
 */
export declare class LocaleService {
    private projectService;
    constructor();
    /**
     * Get the current locale from various sources in priority order
     * @returns The current locale code
     */
    getCurrentLocale(): string;
    /**
     * Load inlang project settings
     * @param workspacePath The workspace root path
     * @returns The inlang settings or null if not found
     */
    loadInlangSettings(workspacePath: string): InlangSettings | null;
    /**
     * Get the path pattern for translation files
     * @param workspacePath The workspace root path
     * @returns The path pattern for translation files
     */
    getTranslationPathPattern(workspacePath: string): string;
    /**
     * Resolve the actual translation file path
     * @param workspacePath The workspace root path
     * @param locale The locale
     * @returns The resolved path to the translation file
     */
    resolveTranslationPath(workspacePath: string, locale: string): string;
    /**
     * Update the current locale in VS Code configuration
     * @param locale The new locale to set
     */
    updateLocale(locale: string): Promise<void>;
}
export {};
//# sourceMappingURL=service.d.ts.map