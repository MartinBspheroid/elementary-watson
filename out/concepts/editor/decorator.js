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
exports.EditorDecorator = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Decorator for managing VS Code text decorations for translation displays
 */
class EditorDecorator {
    activeDecorations;
    translationDecorationType;
    constructor() {
        this.activeDecorations = new Map();
        this.translationDecorationType = null;
    }
    /**
     * Initialize the decoration type
     * @returns The decoration type
     */
    initializeDecorationType() {
        if (!this.translationDecorationType) {
            this.translationDecorationType = vscode.window.createTextEditorDecorationType({
                after: {
                    margin: '0 0 0 1em',
                    color: '#888888',
                    fontStyle: 'italic'
                },
                rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
            });
        }
        return this.translationDecorationType;
    }
    /**
     * Create decorations for translation results
     * @param document The VS Code document
     * @param translationResults Array of translation results with call info and values
     * @returns Array of decoration objects
     */
    createDecorations(document, translationResults) {
        const decorations = [];
        for (const result of translationResults) {
            let contentText;
            let color;
            let borderColor;
            if (result.warningType === 'noLocale') {
                // Red alert for missing translation
                contentText = '<missing>';
                color = '#cc6666';
                borderColor = '#cc6666';
            }
            else if (result.warningType === 'missingLocale') {
                // Yellow warning + translation from other locale
                contentText = `"${result.translationValue}" (locales missing)`;
                color = '#d4a574';
                borderColor = '#d4a574';
            }
            else {
                // Normal case - translation found in current locale
                contentText = `"${result.translationValue}"`;
                color = '#888888';
                borderColor = '#888888';
            }
            const decoration = {
                range: new vscode.Range(document.positionAt(result.end), document.positionAt(result.end)),
                renderOptions: {
                    after: {
                        contentText: contentText,
                        color: color,
                        fontStyle: 'italic',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '4px',
                        padding: '2px 4px',
                        margin: '0 2px'
                    }
                }
            };
            decorations.push(decoration);
        }
        return decorations;
    }
    /**
     * Apply decorations to an editor
     * @param editor The VS Code text editor
     * @param decorations Array of decoration objects
     */
    applyDecorations(editor, decorations) {
        const decorationType = this.initializeDecorationType();
        editor.setDecorations(decorationType, decorations);
        this.activeDecorations.set(editor.document.uri.toString(), decorations);
    }
    /**
     * Clear decorations for a document
     * @param editor The VS Code text editor
     */
    clearDecorations(editor) {
        if (this.translationDecorationType && this.activeDecorations.has(editor.document.uri.toString())) {
            editor.setDecorations(this.translationDecorationType, []);
            this.activeDecorations.delete(editor.document.uri.toString());
        }
    }
    /**
     * Clear all active decorations
     */
    clearAllDecorations() {
        this.activeDecorations.clear();
    }
    /**
     * Get the decoration type for disposal
     * @returns The decoration type
     */
    getDecorationType() {
        return this.translationDecorationType;
    }
    /**
     * Dispose of the decorator resources
     */
    dispose() {
        this.clearAllDecorations();
        if (this.translationDecorationType) {
            this.translationDecorationType.dispose();
            this.translationDecorationType = null;
        }
    }
}
exports.EditorDecorator = EditorDecorator;
//# sourceMappingURL=decorator.js.map