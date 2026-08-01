import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async executeRequest(requestData: any, files?: Array<Express.Multer.File>) {
    const startTime = Date.now();
    try {
      if (typeof requestData.headers === 'string') {
        try { requestData.headers = JSON.parse(requestData.headers); } catch (e) {}
      }
      
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
      if (typeof finalData === 'string' && requestData.bodyType !== 'raw') {
        try { finalData = JSON.parse(finalData); } catch (e) {}
      }

      if (requestData.bodyType === 'urlencoded' && requestData.bodyUrlencoded) {
        let urlencodedData = requestData.bodyUrlencoded;
        if (typeof urlencodedData === 'string') {
          try { urlencodedData = JSON.parse(urlencodedData); } catch (e) {}
        }
        if (Array.isArray(urlencodedData)) {
          const searchParams = new URLSearchParams();
          urlencodedData.forEach(item => {
            if (item.enabled !== false && item.key) {
              searchParams.append(item.key, item.value || '');
            }
          });
          finalData = searchParams;
        }
      } else if (requestData.bodyType === 'formdata') {
        const formData = new FormData();
        
        if (requestData.bodyFormFields) {
          // New multipart/form-data flow from frontend
          let formFields = [];
          if (typeof requestData.bodyFormFields === 'string') {
            try { formFields = JSON.parse(requestData.bodyFormFields); } catch (e) {}
          }
          
          if (Array.isArray(formFields)) {
            formFields.forEach((field, index) => {
              if (field.type === 'file') {
                // Find file in uploaded files
                const file = files?.find(f => f.fieldname === `file_${index}`);
                if (file) {
                  // Node 18+ FormData requires Blob/File, so we create a Blob from buffer
                  const blob = new Blob([file.buffer as any], { type: file.mimetype });
                  formData.append(field.key, blob, file.originalname);
                }
              } else {
                formData.append(field.key, requestData[`text_${index}`] || '');
              }
            });
          }
        } else if (requestData.bodyForm) {
          // Legacy flow
          let formFields = requestData.bodyForm;
          if (typeof formFields === 'string') {
            try { formFields = JSON.parse(formFields); } catch (e) {}
          }
          if (Array.isArray(formFields)) {
            formFields.forEach(item => {
              if (item.enabled !== false && item.key) {
                formData.append(item.key, item.value || '');
              }
            });
          }
        }
        
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
      return {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: error.message || 'Failed to connect to the target URL',
        timeMs: endTime - startTime,
      };
    }
  }
}
