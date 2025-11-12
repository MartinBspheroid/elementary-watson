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
exports.TranslationRepository = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Repository for loading translation data from files
 */
class TranslationRepository {
    /**
     * Load translations for the specified locale
     * @param translationFilePath The full path to the translation file
     * @param locale The locale for logging purposes
     * @returns The translations object or null if not found
     */
    async loadTranslations(translationFilePath, locale) {
        try {
            console.log(`📖 Reading translations from: ${path.basename(translationFilePath)} (locale: ${locale})`);
            if (!fs.existsSync(translationFilePath)) {
                console.log(`❌ Translation file not found: ${translationFilePath}`);
                return null;
            }
            const fileContent = fs.readFileSync(translationFilePath, 'utf8');
            const translations = JSON.parse(fileContent);
            console.log(`✅ Loaded ${Object.keys(translations).length} translations for locale '${locale}'`);
            return translations;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`❌ Failed to load translations: ${errorMessage}`);
            return null;
        }
    }
    /**
     * Check if a translation file exists
     * @param translationFilePath The full path to the translation file
     * @returns True if the file exists
     */
    translationFileExists(translationFilePath) {
        return fs.existsSync(translationFilePath);
    }
}
exports.TranslationRepository = TranslationRepository;
//# sourceMappingURL=repository.js.map