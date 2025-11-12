import * as vscode from 'vscode';
type TranslationResult = {
    end: number;
    warningType?: 'missingLocale' | 'noLocale' | null;
    translationValue: string | null;
};
type RenderOptions = {
    after?: {
        contentText: string;
        color: string;
        fontStyle: string;
        border: string;
        borderRadius: string;
        padding: string;
        margin: string;
    };
};
type Decoration = {
    range: vscode.Range;
    renderOptions: RenderOptions;
};
/**
 * Decorator for managing VS Code text decorations for translation displays
 */
export declare class EditorDecorator {
    private activeDecorations;
    private translationDecorationType;
    constructor();
    /**
     * Initialize the decoration type
     * @returns The decoration type
     */
    initializeDecorationType(): vscode.TextEditorDecorationType;
    /**
     * Create decorations for translation results
     * @param document The VS Code document
     * @param translationResults Array of translation results with call info and values
     * @returns Array of decoration objects
     */
    createDecorations(document: vscode.TextDocument, translationResults: TranslationResult[]): Decoration[];
    /**
     * Apply decorations to an editor
     * @param editor The VS Code text editor
     * @param decorations Array of decoration objects
     */
    applyDecorations(editor: vscode.TextEditor, decorations: Decoration[]): void;
    /**
     * Clear decorations for a document
     * @param editor The VS Code text editor
     */
    clearDecorations(editor: vscode.TextEditor): void;
    /**
     * Clear all active decorations
     */
    clearAllDecorations(): void;
    /**
     * Get the decoration type for disposal
     * @returns The decoration type
     */
    getDecorationType(): vscode.TextEditorDecorationType | null;
    /**
     * Dispose of the decorator resources
     */
    dispose(): void;
}
export {};
//# sourceMappingURL=decorator.d.ts.map