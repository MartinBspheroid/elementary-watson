import * as vscode from 'vscode';
type Project = {
    path: string;
    name: string;
    relativePath: string;
};
/**
 * Service for managing project selection in monorepo environments
 * Scans for project.inlang files and allows users to select active project
 */
export declare class ProjectService {
    private _onDidChangeActiveProject;
    onDidChangeActiveProject: vscode.Event<string>;
    constructor();
    /**
     * Scan workspace for project.inlang files
     * @param workspacePath The workspace root path
     * @returns Array of found projects
     */
    scanForProjects(workspacePath: string): Promise<Project[]>;
    /**
     * Get a display name for the project
     * @param projectPath The project path
     * @returns The project display name
     */
    getProjectName(projectPath: string): string;
    /**
     * Get the currently active project path
     * @param workspacePath The workspace root path
     * @returns The active project path
     */
    getActiveProjectPath(workspacePath: string): string;
    /**
     * Set the active project
     * @param workspacePath The workspace root path
     * @param projectPath The project path to set as active
     */
    setActiveProject(workspacePath: string, projectPath: string): Promise<void>;
    /**
     * Show project selection quick pick to user
     * @param workspacePath The workspace root path
     * @returns The selected project path or null if cancelled
     */
    showProjectSelection(workspacePath: string): Promise<string | null>;
    /**
     * Check if a path contains a valid project.inlang configuration
     * @param projectPath The path to check
     * @returns True if valid project.inlang exists
     */
    isValidProjectPath(projectPath: string): boolean;
    /**
     * Get the project path for a given file
     * @param filePath The file path
     * @param projects The list of available projects
     * @returns The project path or null if not found
     */
    getProjectForFile(filePath: string, projects: Project[]): string | null;
}
export {};
//# sourceMappingURL=service.d.ts.map