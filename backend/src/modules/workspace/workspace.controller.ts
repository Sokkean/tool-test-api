import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Post()
  createWorkspace(@Request() req: any, @Body('name') name: string) {
    return this.workspaceService.createWorkspace(req.user.id, name);
  }

  @Get()
  getWorkspaces(@Request() req: any) {
    return this.workspaceService.getWorkspaces(req.user.id);
  }

  @Post(':id/collections')
  createCollection(@Param('id') workspaceId: string, @Body('name') name: string, @Body('parentId') parentId?: number) {
    return this.workspaceService.createCollection(parseInt(workspaceId), name, parentId);
  }

  @Post('collections/:colId/requests')
  saveRequest(@Param('colId') collectionId: string, @Body() data: any) {
    return this.workspaceService.saveRequest(parseInt(collectionId), data);
  }

  @Get('collections/:colId/requests')
  getRequests(@Param('colId') collectionId: string) {
    return this.workspaceService.getCollectionRequests(parseInt(collectionId));
  }

  @Put(':id')
  renameWorkspace(@Param('id') id: string, @Body('name') name: string) {
    return this.workspaceService.renameWorkspace(parseInt(id), name);
  }

  @Delete(':id')
  deleteWorkspace(@Param('id') id: string) {
    return this.workspaceService.deleteWorkspace(parseInt(id));
  }

  @Post(':id/duplicate')
  duplicateWorkspace(@Request() req: any, @Param('id') id: string) {
    return this.workspaceService.duplicateWorkspace(parseInt(id), req.user.id);
  }

  @Put('collections/:colId')
  renameCollection(@Param('colId') collectionId: string, @Body('name') name: string) {
    return this.workspaceService.renameCollection(parseInt(collectionId), name);
  }

  @Delete('collections/:colId')
  deleteCollection(@Param('colId') collectionId: string) {
    return this.workspaceService.deleteCollection(parseInt(collectionId));
  }

  @Put('requests/:reqId')
  updateRequest(@Param('reqId') requestId: string, @Body() data: any) {
    return this.workspaceService.updateRequest(parseInt(requestId), data);
  }

  @Delete('requests/:reqId')
  deleteRequest(@Param('reqId') requestId: string) {
    return this.workspaceService.deleteRequest(parseInt(requestId));
  }

  @Post('collections/:colId/duplicate')
  duplicateCollection(@Param('colId') collectionId: string) {
    return this.workspaceService.duplicateCollection(parseInt(collectionId));
  }

  @Post('requests/:reqId/duplicate')
  duplicateRequest(@Param('reqId') requestId: string) {
    return this.workspaceService.duplicateRequest(parseInt(requestId));
  }

  @Post(':id/members')
  addMember(@Param('id') workspaceId: string, @Body('email') email: string) {
    return this.workspaceService.addMember(parseInt(workspaceId), email);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') workspaceId: string, @Param('userId') userId: string) {
    return this.workspaceService.removeMember(parseInt(workspaceId), parseInt(userId));
  }
}
