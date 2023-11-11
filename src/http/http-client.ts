export type HttpResponse = {
    status: number;
    body: string;
}

export interface HttpClient<ResponseBodyType = string> {
    send(url: string, method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE', headers?: {[key: string]: string}): Promise<{status: number, body: ResponseBodyType}>;
    sendWithBody(url: string, method: 'POST' | 'PUT' | 'PATCH', data: ResponseBodyType, headers?: {[key: string]: string}): Promise<{status: number, body: ResponseBodyType}>
}