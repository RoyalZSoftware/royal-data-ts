import { Observable } from "rxjs";

export type HttpResponse = {
    status: number;
    body: string;
}

export interface HttpClient {
    send(url: string, method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE', headers?: {[key: string]: string}): Observable<{status: number, body: string}>;
    sendWithBody(url: string, method: 'POST' | 'PUT' | 'PATCH', data: string, headers?: {[key: string]: string}): Observable<{status: number, body: string}>
}