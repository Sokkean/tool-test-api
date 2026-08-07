import { RequestsService } from './requests.service';
import 'multer';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    proxyRequest(requestData: any, files: Array<Express.Multer.File>): Promise<{
        status: any;
        statusText: any;
        headers: any;
        data: any;
        timeMs: number;
    }>;
}
