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
exports.LocaleService = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const service_1 = require("../project/service");
/**
 * Service for managing locale configuration and inlang project settings
 */
class LocaleService {
    projectService;
    constructor() {
        this.projectService = new service_1.ProjectService();
    }
    /**
     * Get the current locale from various sources in priority order
     * @returns The current locale code
     */
    getCurrentLocale() {
        // 1. Check VS Code configuration
        const config = vscode.workspace.getConfiguration('poirot');
        const configLocale = config.get('defaultLocale');
        if (configLocale) {
            return configLocale;
        }
        // 2. Check inlang settings if we have a workspace
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const inlangSettings = this.loadInlangSettings(vscode.workspace.workspaceFolders[0].uri.fsPath);
            if (inlangSettings?.baseLocale) {
                return inlangSettings.baseLocale;
            }
        }
        // 3. Default to English
        return 'en';
    }
    /**
     * Load inlang project settings
     * @param workspacePath The workspace root path
     * @returns The inlang settings or null if not found
     */
    loadInlangSettings(workspacePath) {
        try {
            // Get the active project path
            const projectPath = this.projectService.getActiveProjectPath(workspacePath);
            const inlangSettingsPath = path.join(projectPath, 'project.inlang', 'settings.json');
            if (!fs.existsSync(inlangSettingsPath)) {
                console.log(`📝 No inlang settings found at: ${inlangSettingsPath}`);
                return null;
            }
            const fileContent = fs.readFileSync(inlangSettingsPath, 'utf8');
            const settings = JSON.parse(fileContent);
            console.log(`📖 Loaded inlang settings from: ${path.basename(inlangSettingsPath)}`);
            return settings;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`❌ Failed to load inlang settings: ${errorMessage}`);
            return null;
        }
    }
    /**
     * Get the path pattern for translation files
     * @param workspacePath The workspace root path
     * @returns The path pattern for translation files
     */
    getTranslationPathPattern(workspacePath) {
        const inlangSettings = this.loadInlangSettings(workspacePath);
        if (inlangSettings &&
            inlangSettings['plugin.inlang.messageFormat'] &&
            inlangSettings['plugin.inlang.messageFormat'].pathPattern) {
            return inlangSettings['plugin.inlang.messageFormat'].pathPattern;
        }
        // Fallback to default pattern
        return './messages/{locale}.json';
    }
    /**
     * Resolve the actual translation file path
     * @param workspacePath The workspace root path
     * @param locale The locale
     * @returns The resolved path to the translation file
     */
    resolveTranslationPath(workspacePath, locale) {
        // Get the active project path
        const projectPath = this.projectService.getActiveProjectPath(workspacePath);
        const pathPattern = this.getTranslationPathPattern(workspacePath);
        // Replace {locale} placeholder with actual locale
        const relativePath = pathPattern.replace('{locale}', locale);
        // Resolve relative path from project root
        let resolvedPath;
        if (relativePath.startsWith('./')) {
            resolvedPath = path.join(projectPath, relativePath.substring(2));
        }
        else if (relativePath.startsWith('/')) {
            resolvedPath = path.join(projectPath, relativePath.substring(1));
        }
        else {
            resolvedPath = path.join(projectPath, relativePath);
        }
        console.log(`🔍 Resolved translation path for locale '${locale}': ${resolvedPath}`);
        return resolvedPath;
    }
    /**
     * Update the current locale in VS Code configuration
     * @param locale The new locale to set
     */
    async updateLocale(locale) {
        const config = vscode.workspace.getConfiguration('poirot');
        await config.update('defaultLocale', locale, vscode.ConfigurationTarget.Workspace);
    }
}
exports.LocaleService = LocaleService;
//# sourceMappingURL=service.js.map