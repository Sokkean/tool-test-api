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
    body?: any;
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

      const response = await axios({
        method: requestData.method || 'GET',
        url: requestData.url,
        headers: sanitizedHeaders,
        data: requestData.body,
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
