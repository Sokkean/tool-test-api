import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { RequestsModule } from './modules/requests/requests.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, WorkspaceModule, RequestsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
