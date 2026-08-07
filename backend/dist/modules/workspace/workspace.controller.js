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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceController = void 0;
const common_1 = require("@nestjs/common");
const workspace_service_1 = require("./workspace.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let WorkspaceController = class WorkspaceController {
    constructor(workspaceService) {
        this.workspaceService = workspaceService;
    }
    createWorkspace(req, name) {
        return this.workspaceService.createWorkspace(req.user.id, name);
    }
    getWorkspaces(req, search) {
        return this.workspaceService.getWorkspaces(req.user.id, search);
    }
    importGlobalCollection(req, data) {
        return this.workspaceService.importGlobalCollection(req.user.id, data);
    }
    createCollection(workspaceId, name, parentId) {
        return this.workspaceService.createCollection(parseInt(workspaceId), name, parentId);
    }
    saveRequest(collectionId, data) {
        return this.workspaceService.saveRequest(parseInt(collectionId), data);
    }
    getRequests(collectionId) {
        return this.workspaceService.getCollectionRequests(parseInt(collectionId));
    }
    renameWorkspace(id, name) {
        return this.workspaceService.renameWorkspace(parseInt(id), name);
    }
    deleteWorkspace(id) {
        return this.workspaceService.deleteWorkspace(parseInt(id));
    }
    duplicateWorkspace(req, id) {
        return this.workspaceService.duplicateWorkspace(parseInt(id), req.user.id);
    }
    renameCollection(collectionId, name) {
        return this.workspaceService.renameCollection(parseInt(collectionId), name);
    }
    deleteCollection(collectionId) {
        return this.workspaceService.deleteCollection(parseInt(collectionId));
    }
    updateRequest(requestId, data) {
        return this.workspaceService.updateRequest(parseInt(requestId), data);
    }
    deleteRequest(requestId) {
        return this.workspaceService.deleteRequest(parseInt(requestId));
    }
    duplicateCollection(collectionId) {
        return this.workspaceService.duplicateCollection(parseInt(collectionId));
    }
    duplicateRequest(requestId) {
        return this.workspaceService.duplicateRequest(parseInt(requestId));
    }
    addMember(workspaceId, email) {
        return this.workspaceService.addMember(parseInt(workspaceId), email);
    }
    removeMember(workspaceId, userId) {
        return this.workspaceService.removeMember(parseInt(workspaceId), parseInt(userId));
    }
    importCollection(workspaceId, parentId, data) {
        const parsedParentId = parentId ? parseInt(parentId) : undefined;
        return this.workspaceService.importCollection(parseInt(workspaceId), data, parsedParentId);
    }
    exportWorkspace(workspaceId) {
        return this.workspaceService.exportWorkspace(parseInt(workspaceId));
    }
    exportCollection(collectionId) {
        return this.workspaceService.exportCollection(parseInt(collectionId));
    }
};
exports.WorkspaceController = WorkspaceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "createWorkspace", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "getWorkspaces", null);
__decorate([
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "importGlobalCollection", null);
__decorate([
    (0, common_1.Post)(':id/collections'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('parentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "createCollection", null);
__decorate([
    (0, common_1.Post)('collections/:colId/requests'),
    __param(0, (0, common_1.Param)('colId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "saveRequest", null);
__decorate([
    (0, common_1.Get)('collections/:colId/requests'),
    __param(0, (0, common_1.Param)('colId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "renameWorkspace", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "deleteWorkspace", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "duplicateWorkspace", null);
__decorate([
    (0, common_1.Put)('collections/:colId'),
    __param(0, (0, common_1.Param)('colId')),
    __param(1, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "renameCollection", null);
__decorate([
    (0, common_1.Delete)('collections/:colId'),
    __param(0, (0, common_1.Param)('colId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "deleteCollection", null);
__decorate([
    (0, common_1.Put)('requests/:reqId'),
    __param(0, (0, common_1.Param)('reqId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "updateRequest", null);
__decorate([
    (0, common_1.Delete)('requests/:reqId'),
    __param(0, (0, common_1.Param)('reqId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "deleteRequest", null);
__decorate([
    (0, common_1.Post)('collections/:colId/duplicate'),
    __param(0, (0, common_1.Param)('colId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "duplicateCollection", null);
__decorate([
    (0, common_1.Post)('requests/:reqId/duplicate'),
    __param(0, (0, common_1.Param)('reqId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "duplicateRequest", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/import'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('parentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "importCollection", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "exportWorkspace", null);
__decorate([
    (0, common_1.Get)('collections/:colId/export'),
    __param(0, (0, common_1.Param)('colId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "exportCollection", null);
exports.WorkspaceController = WorkspaceController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('workspaces'),
    __metadata("design:paramtypes", [workspace_service_1.WorkspaceService])
], WorkspaceController);
//# sourceMappingURL=workspace.controller.js.map