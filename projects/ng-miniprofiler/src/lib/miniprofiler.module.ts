import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { MiniProfilerConfig } from './miniprofiler-config.model';
import { MiniProfilerInterceptor } from './miniprofiler.interceptor';
import { MiniProfilerService, MINI_PROFILER_CONFIG } from './miniprofiler.service';


@NgModule()
export class MiniProfilerModule {
  static forRoot(config: MiniProfilerConfig): ModuleWithProviders<MiniProfilerModule> {
    return {
      ngModule: MiniProfilerModule,
      providers: [
        MiniProfilerService,
        { provide: MINI_PROFILER_CONFIG, useValue: config },
        { provide: HTTP_INTERCEPTORS, useClass: MiniProfilerInterceptor, multi: true },
        {
          provide: APP_INITIALIZER,
          multi: true,
          deps: [MiniProfilerService],
          useFactory: loadMiniProfilerFactory
        }
      ]
    };
  }
}

export function loadMiniProfilerFactory(service: MiniProfilerService): () => void {
  const init = () => loadMiniProfiler(service);
  return init;
}

export function loadMiniProfiler(service: MiniProfilerService): void {
  service.loadMiniProfiler();
}
