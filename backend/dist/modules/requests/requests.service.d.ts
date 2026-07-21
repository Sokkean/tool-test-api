import { PrismaService } from '../../database/prisma/prisma.service';
export declare class RequestsService {
    private prisma;
    constructor(prisma: PrismaService);
    executeRequest(requestData: {
        method: string;
        url: string;
        headers?: Record<string, string>;
        body?: any;
        requestItemId?: number;
    }): Promise<{
        status: any;
        statusText: any;
        headers: any;
        data: any;
        timeMs: number;
    }>;
}
