//{"action":"add","data":{"id":2,"url":"www.hotmail.com","type":"web","retryCount":0,"createdAt":"2026-05-16T08:25:41.105Z"}}

export class ConsumeMessageDto {
  action: string;
  data: {
    id: number;
    url: string;
    type: string;
    retryCount: number;
    createdAt: string;
  };
}
