import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async executeRequest(requestData: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    bodyType?: string;
    body?: any;
    bodyForm?: Array<{key: string; value: string; enabled?: boolean}>;
    bodyUrlencoded?: Array<{key: string; value: string; enabled?: boolean}>;
    requestItemId?: number;
  }) {
    const startTime = Date.now();
    try {
      const sanitizedHeaders: Record<string, string> = {};
      if (requestData.headers) {
        for (const [key, value] of Object.entries(requestData.headers)) {
          // Remove any leading/trailing quotes from the header name
          const cleanKey = key.replace(/^["']+|["']+$/g, '').trim();
          if (cleanKey) {
            sanitizedHeaders[cleanKey] = value as string;
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
      } else if (requestData.bodyType === 'formdata' && requestData.bodyForm) {
        // Node 18+ has built-in FormData
        const formData = new FormData();
        requestData.bodyForm.forEach(item => {
          if (item.enabled !== false && item.key) {
            formData.append(item.key, item.value || '');
          }
        });
        finalData = formData;
      }

      const response = await axios({
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
    } catch (error: any) {
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
}
