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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let RequestsService = class RequestsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async executeRequest(requestData) {
        const startTime = Date.now();
        try {
            const sanitizedHeaders = {};
            if (requestData.headers) {
                for (const [key, value] of Object.entries(requestData.headers)) {
                    const cleanKey = key.replace(/^["']+|["']+$/g, '').trim();
                    if (cleanKey) {
                        sanitizedHeaders[cleanKey] = value;
                    }
                }
            }
            let finalData = requestData.body;
            if (requestData.bodyType === 'urlencoded' && requestData.bodyUrlencoded) {
                const searchParams = new URLSearchParams();
                requestData.bodyUrlencoded.forEach(item => {
                    if (item.enabled !== false && item.key) {
                        searchParams.append(item.key, item.value || '');
                    }
                });
                finalData = searchParams;
            }
            else if (requestData.bodyType === 'formdata' && requestData.bodyForm) {
                const formData = new FormData();
                requestData.bodyForm.forEach(item => {
                    if (item.enabled !== false && item.key) {
                        formData.append(item.key, item.value || '');
                    }
                });
                finalData = formData;
            }
            const response = await (0, axios_1.default)({
                method: requestData.method || 'GET',
                url: requestData.url,
                headers: sanitizedHeaders,
                data: finalData,
            });
            const endTime = Date.now();
            const result = {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data,
                timeMs: endTime - startTime,
            };
            if (requestData.requestItemId) {
                await this.prisma.requestHistory.create({
                    data: {
                        requestItemId: requestData.requestItemId,
                        method: requestData.method || 'GET',
                        url: requestData.url,
                        status: result.status,
                        timeMs: result.timeMs,
                        response: JSON.stringify(result.data)
                    }
                });
            }
            return result;
        }
        catch (error) {
            const endTime = Date.now();
            if (error.response) {
                return {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    headers: error.response.headers,
                    data: error.response.data,
                    timeMs: endTime - startTime,
                };
            }
            throw error;
        }
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map