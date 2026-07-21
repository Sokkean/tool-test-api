import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async createWorkspace(userId: number, name: string) {
    return this.prisma.workspace.create({
      data: { name, userId }
    });
  }

  async getWorkspaces(userId: number) {
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

  async createCollection(workspaceId: number, name: string, parentId?: number) {
    return this.prisma.collection.create({
      data: { name, workspaceId, parentId: parentId || null }
    });
  }

  async saveRequest(collectionId: number, data: any) {
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

  async getCollectionRequests(collectionId: number) {
    return this.prisma.requestItem.findMany({
      where: { collectionId },
      include: { history: true }
    });
  }

  async renameWorkspace(workspaceId: number, name: string) {
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { name }
    });
  }

  async deleteWorkspace(workspaceId: number) {
    return this.prisma.workspace.delete({
      where: { id: workspaceId }
    });
  }

  async duplicateWorkspace(workspaceId: number, userId: number) {
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

    if (!original) throw new Error('Workspace not found');

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

  async renameCollection(collectionId: number, name: string) {
    return this.prisma.collection.update({
      where: { id: collectionId },
      data: { name }
    });
  }

  async deleteCollection(collectionId: number) {
    return this.prisma.collection.delete({
      where: { id: collectionId }
    });
  }

  async updateRequest(requestId: number, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.method !== undefined) updateData.method = data.method;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.headers !== undefined) updateData.headers = typeof data.headers === 'string' ? data.headers : JSON.stringify(data.headers);
    if (data.queryParams !== undefined) updateData.queryParams = typeof data.queryParams === 'string' ? data.queryParams : JSON.stringify(data.queryParams);
    if (data.body !== undefined) updateData.body = typeof data.body === 'string' ? data.body : JSON.stringify(data.body);

    return this.prisma.requestItem.update({
      where: { id: requestId },
      data: updateData
    });
  }

  async deleteRequest(requestId: number) {
    return this.prisma.requestItem.delete({
      where: { id: requestId }
    });
  }

  async duplicateCollection(collectionId: number) {
    const original = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: { requests: true }
    });
    if (!original) throw new Error('Collection not found');

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

  async duplicateRequest(requestId: number) {
    const orig = await this.prisma.requestItem.findUnique({ where: { id: requestId } });
    if (!orig) throw new Error('Not found');
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

  async addMember(workspaceId: number, email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    
    const existing = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } }
    });
    if (existing) throw new Error('User is already a member');

    return this.prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role: 'MEMBER' },
      include: { user: { select: { id: true, email: true, name: true } } }
    });
  }

  async removeMember(workspaceId: number, memberUserId: number) {
    return this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId: memberUserId } }
    });
  }
}
