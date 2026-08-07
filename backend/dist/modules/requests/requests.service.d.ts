import { PrismaService } from '../../database/prisma/prisma.service';
export declare class RequestsService {
    private prisma;
    constructor(prisma: PrismaService);
    executeRequest(requestData: any, files?: Array<Express.Multer.File>): Promise<{
        status: any;
        statusText: any;
        headers: any;
        data: any;
        timeMs: number;
    }>;
}
