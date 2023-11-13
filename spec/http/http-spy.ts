import { EMPTY, Observable, of } from 'rxjs';
import { HttpClient, HttpResponse } from '../../src/http/http-client';

export class HttpSpy implements HttpClient {
    public sendSpy: { url: string, method: string, headers: { [key: string]: string } | undefined, data?: any } = {} as any;

    constructor(public response: HttpResponse = {status: 200, body: ''}) {
    }

    send(url: string, method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE', headers?: { [key: string]: string; } | undefined): Observable<{ status: number; body: string; }> {
        this.sendSpy = { url, method, headers };
        return of(this.response);
    }
    sendWithBody(url: string, method: 'POST' | 'PUT' | 'PATCH', data: string, headers?: { [key: string]: string; } | undefined): Observable<{ status: number; body: string; }> {
        this.sendSpy = { url, method, headers, data };
        return of(this.response);
    }
}