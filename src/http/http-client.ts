import { Observable } from "rxjs";

export type HttpResponse = {
    status: number;
    body: object;
}

export interface HttpClient {
    send(url: string, method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE', headers?: {[key: string]: string}): Observable<HttpResponse>;
    sendWithBody(url: string, method: 'POST' | 'PUT' | 'PATCH', data: string, headers?: {[key: string]: string}): Observable<HttpResponse>
}