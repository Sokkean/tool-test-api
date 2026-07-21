import { PrismaService } from '../../database/prisma/prisma.service';
export declare class WorkspaceService {
    private prisma;
    constructor(prisma: PrismaService);
    createWorkspace(userId: number, name: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
    }>;
    getWorkspaces(userId: number): Promise<({
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
    createCollection(workspaceId: number, name: string, parentId?: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        workspaceId: number;
        parentId: number | null;
    }>;
    saveRequest(collectionId: number, data: any): Promise<{
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
    getCollectionRequests(collectionId: number): Promise<({
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
    renameWorkspace(workspaceId: number, name: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
    }>;
    deleteWorkspace(workspaceId: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
    }>;
    duplicateWorkspace(workspaceId: number, userId: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
    }>;
    renameCollection(collectionId: number, name: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        workspaceId: number;
        parentId: number | null;
    }>;
    deleteCollection(collectionId: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        workspaceId: number;
        parentId: number | null;
    }>;
    updateRequest(requestId: number, data: any): Promise<{
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
    deleteRequest(requestId: number): Promise<{
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
    duplicateCollection(collectionId: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        workspaceId: number;
        parentId: number | null;
    }>;
    duplicateRequest(requestId: number): Promise<{
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
    addMember(workspaceId: number, email: string): Promise<{
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
    removeMember(workspaceId: number, memberUserId: number): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        role: string;
        workspaceId: number;
    }>;
}
