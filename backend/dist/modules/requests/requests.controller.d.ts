import { RequestsService } from './requests.service';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    proxyRequest(requestData: any): Promise<{
        status: any;
        statusText: any;
        headers: any;
        data: any;
        timeMs: number;
    }>;
}
