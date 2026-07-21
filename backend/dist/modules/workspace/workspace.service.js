"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let WorkspaceService = class WorkspaceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWorkspace(userId, name) {
        return this.prisma.workspace.create({
            data: { name, userId }
        });
    }
    async getWorkspaces(userId) {
        return this.prisma.workspace.findMany({
            where: {
                OR: [
                    { userId },
                    { members: { some: { userId } } }
                ]
            },
            include: {
                collections: true,
                members: {
                    include: {
                        user: { select: { id: true, email: true, name: true } }
                    }
                }
            }
        });
    }
    async createCollection(workspaceId, name, parentId) {
        return this.prisma.collection.create({
            data: { name, workspaceId, parentId: parentId || null }
        });
    }
    async saveRequest(collectionId, data) {
        return this.prisma.requestItem.create({
            data: {
                name: data.name,
                method: data.method,
                url: data.url,
                headers: data.headers ? (typeof data.headers === 'string' ? data.headers : JSON.stringify(data.headers)) : null,
                queryParams: data.queryParams ? (typeof data.queryParams === 'string' ? data.queryParams : JSON.stringify(data.queryParams)) : null,
                body: data.body ? (typeof data.body === 'string' ? data.body : JSON.stringify(data.body)) : null,
                collectionId
            }
        });
    }
    async getCollectionRequests(collectionId) {
        return this.prisma.requestItem.findMany({
            where: { collectionId },
            include: { history: true }
        });
    }
    async renameWorkspace(workspaceId, name) {
        return this.prisma.workspace.update({
            where: { id: workspaceId },
            data: { name }
        });
    }
    async deleteWorkspace(workspaceId) {
        return this.prisma.workspace.delete({
            where: { id: workspaceId }
        });
    }
    async duplicateWorkspace(workspaceId, userId) {
        const original = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                collections: {
                    include: {
                        requests: true
                    }
                }
            }
        });
        if (!original)
            throw new Error('Workspace not found');
        return this.prisma.workspace.create({
            data: {
                name: `${original.name} - Copy`,
                userId: userId,
                collections: {
                    create: original.collections.map(col => ({
                        name: col.name,
                        requests: {
                            create: col.requests.map(req => ({
                                name: req.name,
                                method: req.method,
                                url: req.url,
                                headers: req.headers,
                                queryParams: req.queryParams,
                                body: req.body
                            }))
                        }
                    }))
                }
            }
        });
    }
    async renameCollection(collectionId, name) {
        return this.prisma.collection.update({
            where: { id: collectionId },
            data: { name }
        });
    }
    async deleteCollection(collectionId) {
        return this.prisma.collection.delete({
            where: { id: collectionId }
        });
    }
    async updateRequest(requestId, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.method !== undefined)
            updateData.method = data.method;
        if (data.url !== undefined)
            updateData.url = data.url;
        if (data.headers !== undefined)
            updateData.headers = typeof data.headers === 'string' ? data.headers : JSON.stringify(data.headers);
        if (data.queryParams !== undefined)
            updateData.queryParams = typeof data.queryParams === 'string' ? data.queryParams : JSON.stringify(data.queryParams);
        if (data.body !== undefined)
            updateData.body = typeof data.body === 'string' ? data.body : JSON.stringify(data.body);
        return this.prisma.requestItem.update({
            where: { id: requestId },
            data: updateData
        });
    }
    async deleteRequest(requestId) {
        return this.prisma.requestItem.delete({
            where: { id: requestId }
        });
    }
    async duplicateCollection(collectionId) {
        const original = await this.prisma.collection.findUnique({
            where: { id: collectionId },
            include: { requests: true }
        });
        if (!original)
            throw new Error('Collection not found');
        return this.prisma.collection.create({
            data: {
                name: `${original.name} - Copy`,
                workspaceId: original.workspaceId,
                requests: {
                    create: original.requests.map(req => ({
                        name: req.name,
                        method: req.method,
                        url: req.url,
                        headers: req.headers,
                        queryParams: req.queryParams,
                        body: req.body
                    }))
                }
            }
        });
    }
    async duplicateRequest(requestId) {
        const orig = await this.prisma.requestItem.findUnique({ where: { id: requestId } });
        if (!orig)
            throw new Error('Not found');
        return this.prisma.requestItem.create({
            data: {
                name: orig.name + ' (Copy)',
                method: orig.method,
                url: orig.url,
                headers: orig.headers,
                queryParams: orig.queryParams,
                body: orig.body,
                collectionId: orig.collectionId
            }
        });
    }
    async addMember(workspaceId, email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error('User not found');
        const existing = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId: user.id } }
        });
        if (existing)
            throw new Error('User is already a member');
        return this.prisma.workspaceMember.create({
            data: { workspaceId, userId: user.id, role: 'MEMBER' },
            include: { user: { select: { id: true, email: true, name: true } } }
        });
    }
    async removeMember(workspaceId, memberUserId) {
        return this.prisma.workspaceMember.delete({
            where: { workspaceId_userId: { workspaceId, userId: memberUserId } }
        });
    }
};
exports.WorkspaceService = WorkspaceService;
exports.WorkspaceService = WorkspaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspaceService);
//# sourceMappingURL=workspace.service.js.map