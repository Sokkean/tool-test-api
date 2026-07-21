import { WorkspaceService } from './workspace.service';
export declare class WorkspaceController {
    private workspaceService;
    constructor(workspaceService: WorkspaceService);
    createWorkspace(req: any, name: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
    }>;
    getWorkspaces(req: any): Promise<({
        collections: {
            name: string;
            id: number;
            createdAt: Date;
            workspaceId: number;
            parentId: number | null;
        }[];
        members: ({
            user: {
                name: string;
                id: number;
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            userId: number;
            role: string;
            workspaceId: number;
        })[];
    } & {
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
    })[]>;
    createCollection(workspaceId: string, name: string, parentId?: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        workspaceId: number;
        parentId: number | null;
    }>;
    saveRequest(collectionId: string, data: any): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        method: string;
        url: string;
        headers: string | null;
        queryParams: string | null;
        body: string | null;
        preRequestScript: string | null;
        testScript: string | null;
        collectionId: number;
    }>;
    getRequests(collectionId: string): Promise<({
        history: {
            id: number;
            createdAt: Date;
            method: string;
            url: string;
            status: number;
            timeMs: number;
            response: string | null;
            requestItemId: number | null;
        }[];
    } & {
        name: string;
        id: number;
        createdAt: Date;
        method: string;
        url: string;
        headers: string | null;
        queryParams: string | null;
        body: string | null;
        preRequestScript: string | null;
        testScript: string | null;
        collectionId: number;
    })[]>;
    renameWorkspace(id: string, name: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
    }>;
    deleteWorkspace(id: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
    }>;
    duplicateWorkspace(req: any, id: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
    }>;
    renameCollection(collectionId: string, name: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        workspaceId: number;
        parentId: number | null;
    }>;
    deleteCollection(collectionId: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        workspaceId: number;
        parentId: number | null;
    }>;
    updateRequest(requestId: string, data: any): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        method: string;
        url: string;
        headers: string | null;
        queryParams: string | null;
        body: string | null;
        preRequestScript: string | null;
        testScript: string | null;
        collectionId: number;
    }>;
    deleteRequest(requestId: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        method: string;
        url: string;
        headers: string | null;
        queryParams: string | null;
        body: string | null;
        preRequestScript: string | null;
        testScript: string | null;
        collectionId: number;
    }>;
    duplicateCollection(collectionId: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        workspaceId: number;
        parentId: number | null;
    }>;
    duplicateRequest(requestId: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        method: string;
        url: string;
        headers: string | null;
        queryParams: string | null;
        body: string | null;
        preRequestScript: string | null;
        testScript: string | null;
        collectionId: number;
    }>;
    addMember(workspaceId: string, email: string): Promise<{
        user: {
            name: string;
            id: number;
            email: string;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        role: string;
        workspaceId: number;
    }>;
    removeMember(workspaceId: string, userId: string): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        role: string;
        workspaceId: number;
    }>;
}
