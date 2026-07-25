import { PrismaService } from '../../database/prisma/prisma.service';
export declare class RequestsService {
    private prisma;
    constructor(prisma: PrismaService);
    executeRequest(requestData: {
        method: string;
        url: string;
        headers?: Record<string, string>;
        bodyType?: string;
        body?: any;
        bodyForm?: Array<{
            key: string;
            value: string;
            enabled?: boolean;
        }>;
        bodyUrlencoded?: Array<{
            key: string;
            value: string;
            enabled?: boolean;
        }>;
        requestItemId?: number;
    }): Promise<{
        status: any;
        statusText: any;
        headers: any;
        data: any;
        timeMs: number;
    }>;
}
