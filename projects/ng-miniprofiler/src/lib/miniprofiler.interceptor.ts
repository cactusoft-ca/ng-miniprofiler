import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

declare const MiniProfiler:
  | {
      container?: HTMLElement;
      fetchResults(ids: string[]): void;
    }
  | undefined;

@Injectable()
export class MiniProfilerInterceptor implements HttpInterceptor {
  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((evt) => {
        if (!(evt instanceof HttpResponse)) {
          return;
        }

        try {
          const miniProfilerHeaders = JSON.parse(
            evt.headers.get('X-MiniProfiler-Ids')
          );
          this.fetchMiniProfilerResults(miniProfilerHeaders);
        } catch {}
      })
    );
  }

  private fetchMiniProfilerResults(ids: string[]): void {
    if (typeof MiniProfiler == null) {
      return;
    }
    if (ids == null) {
      return;
    }

    MiniProfiler.fetchResults(ids);
  }
}
