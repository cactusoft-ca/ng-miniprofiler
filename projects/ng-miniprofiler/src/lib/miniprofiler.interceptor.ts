import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { MiniProfilerService } from './miniprofiler.service';

declare const MiniProfiler:
  | {
      container?: HTMLElement;
      fetchResults(ids: string[]): void;
    }
  | undefined;

@Injectable()
export class MiniProfilerInterceptor implements HttpInterceptor {
  constructor(private service: MiniProfilerService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      withLatestFrom(this.service.isEnabled$),
      tap(([evt, isEnabled]) => {
        if (!(evt instanceof HttpResponse)) {
          return;
        }
        if (!isEnabled) {
          return;
        }

        try {
          const miniProfilerHeaders = JSON.parse(
            evt.headers.get('X-MiniProfiler-Ids')
          );
          this.fetchMiniProfilerResults(miniProfilerHeaders);
        } catch {}
      }),
      map(([evt]) => evt)
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
