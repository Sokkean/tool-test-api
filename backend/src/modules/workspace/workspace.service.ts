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

  async getWorkspaces(userId: number, search?: string) {
    const baseCondition = {
      OR: [
        { userId },
        { members: { some: { userId } } }
      ]
    };

    const where: any = {
      AND: [baseCondition]
    };

    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { collections: { some: { name: { contains: search, mode: 'insensitive' } } } },
          { collections: { some: { requests: { some: { name: { contains: search, mode: 'insensitive' } } } } } },
          { collections: { some: { requests: { some: { url: { contains: search, mode: 'insensitive' } } } } } }
        ]
      });
    }

    return this.prisma.workspace.findMany({
      where,
      include: { 
        collections: {
          include: { requests: true }
        },
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
        preRequestScript: data.preRequestScript || null,
        testScript: data.testScript || null,
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
    if (data.preRequestScript !== undefined) updateData.preRequestScript = data.preRequestScript;
    if (data.testScript !== undefined) updateData.testScript = data.testScript;

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

  async importGlobalCollection(userId: number, data: any) {
    const workspaceName = data.info?.name || 'Imported Workspace';
    const workspace = await this.prisma.workspace.create({
      data: { name: workspaceName, userId }
    });

    await this.importCollection(workspace.id, data);
    
    return workspace;
  }

  async importCollection(workspaceId: number, data: any, parentId?: number) {
    const collectionName = data.info?.name || 'Imported Collection';
    const rootCollection = await this.prisma.collection.create({
      data: { name: collectionName, workspaceId, parentId: parentId || null }
    });

    if (data.item && Array.isArray(data.item)) {
      await this.processPostmanItems(workspaceId, rootCollection.id, data.item);
    }

    return rootCollection;
  }

  private async processPostmanItems(workspaceId: number, parentId: number, items: any[]) {
    for (const item of items) {
      if (item.request) {
        let url = '';
        if (typeof item.request.url === 'string') {
          url = item.request.url;
        } else if (item.request.url && typeof item.request.url.raw === 'string') {
          url = item.request.url.raw;
        }
        
        let headersStr = '[]';
        if (Array.isArray(item.request.header)) {
          headersStr = JSON.stringify(item.request.header.map((h: any) => ({ key: h.key, value: h.value })));
        }

        let bodyPayload: any = {
          _bodyType: 'none',
          raw: '',
          formdata: '[]',
          urlencoded: '[]',
          authType: 'none',
          authBearerToken: '',
          authBasicUsername: '',
          authBasicPassword: ''
        };

        if (item.request.body) {
          if (item.request.body.mode === 'raw') {
            bodyPayload._bodyType = 'raw';
            bodyPayload.raw = item.request.body.raw || '';
          } else if (item.request.body.mode === 'formdata') {
            bodyPayload._bodyType = 'formdata';
            bodyPayload.formdata = JSON.stringify(
              (item.request.body.formdata || []).map((fd: any) => ({ key: fd.key, value: fd.value }))
            );
          } else if (item.request.body.mode === 'urlencoded') {
            bodyPayload._bodyType = 'urlencoded';
            bodyPayload.urlencoded = JSON.stringify(
              (item.request.body.urlencoded || []).map((ue: any) => ({ key: ue.key, value: ue.value }))
            );
          }
        }

        if (item.request.auth) {
          bodyPayload.authType = item.request.auth.type || 'none';
          if (item.request.auth.type === 'bearer' && Array.isArray(item.request.auth.bearer)) {
            const tokenItem = item.request.auth.bearer.find((b: any) => b.key === 'token');
            if (tokenItem) bodyPayload.authBearerToken = tokenItem.value;
          } else if (item.request.auth.type === 'basic' && Array.isArray(item.request.auth.basic)) {
            const userItem = item.request.auth.basic.find((b: any) => b.key === 'username');
            const passItem = item.request.auth.basic.find((b: any) => b.key === 'password');
            if (userItem) bodyPayload.authBasicUsername = userItem.value;
            if (passItem) bodyPayload.authBasicPassword = passItem.value;
          }
        }

        const bodyStr = JSON.stringify(bodyPayload);

        let queryParamsStr = '[]';
        if (item.request.url && Array.isArray(item.request.url.query)) {
           queryParamsStr = JSON.stringify(item.request.url.query.map((q: any) => ({ key: q.key, value: q.value })));
        }

        await this.prisma.requestItem.create({
          data: {
            name: item.name || 'Untitled Request',
            method: item.request.method || 'GET',
            url: url,
            headers: headersStr,
            queryParams: queryParamsStr,
            body: bodyStr,
            collectionId: parentId
          }
        });
      } else if (item.item && Array.isArray(item.item)) {
        const subCollection = await this.prisma.collection.create({
          data: {
            name: item.name || 'New Folder',
            workspaceId,
            parentId
          }
        });
        await this.processPostmanItems(workspaceId, subCollection.id, item.item);
      }
    }
  }

  private buildPostmanItems(collections: any[], parentId: number | null): any[] {
    const items = [];
    const currentLevelCollections = collections.filter(c => c.parentId === parentId);
    
    for (const col of currentLevelCollections) {
      const folder: any = { name: col.name, item: [] };
      const subItems = this.buildPostmanItems(collections, col.id);
      folder.item.push(...subItems);
      
      if (col.requests && col.requests.length > 0) {
        for (const req of col.requests) {
          let headers = [];
          try { headers = req.headers ? JSON.parse(req.headers) : []; } catch (e) {}
          let queryParams = [];
          try { queryParams = req.queryParams ? JSON.parse(req.queryParams) : []; } catch (e) {}

          folder.item.push({
            name: req.name,
            request: {
              method: req.method,
              header: headers.map((h: any) => ({ key: h.key, value: h.value })),
              url: {
                raw: req.url,
                query: queryParams.map((q: any) => ({ key: q.key, value: q.value }))
              },
              body: req.body ? { mode: 'raw', raw: req.body } : undefined
            }
          });
        }
      }
      items.push(folder);
    }
    return items;
  }

  async exportWorkspace(workspaceId: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        collections: { include: { requests: true } }
      }
    });

    if (!workspace) throw new Error('Workspace not found');

    return {
      info: {
        name: workspace.name,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: this.buildPostmanItems(workspace.collections, null)
    };
  }

  async exportCollection(collectionId: number) {
    const rootCol = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: { requests: true }
    });

    if (!rootCol) throw new Error('Collection not found');

    const allCols = await this.prisma.collection.findMany({
      where: { workspaceId: rootCol.workspaceId },
      include: { requests: true }
    });

    const rootRequests = rootCol.requests.map(req => {
      let headers = [];
      try { headers = req.headers ? JSON.parse(req.headers) : []; } catch (e) {}
      let queryParams = [];
      try { queryParams = req.queryParams ? JSON.parse(req.queryParams) : []; } catch (e) {}
      return {
        name: req.name,
        request: {
          method: req.method,
          header: headers.map((h: any) => ({ key: h.key, value: h.value })),
          url: {
            raw: req.url,
            query: queryParams.map((q: any) => ({ key: q.key, value: q.value }))
          },
          body: req.body ? { mode: 'raw', raw: req.body } : undefined
        }
      };
    });

    return {
      info: {
        name: rootCol.name,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        ...this.buildPostmanItems(allCols, rootCol.id),
        ...rootRequests
      ]
    };
  }
}
