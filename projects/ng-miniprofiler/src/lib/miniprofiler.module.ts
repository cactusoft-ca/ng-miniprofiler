import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { MiniProfilerConfig } from './miniprofiler-config.model';
import { MiniProfilerInterceptor } from './miniprofiler.interceptor';
import {
  MiniProfilerService,
  MINI_PROFILER_CONFIG,
} from './miniprofiler.service';

@NgModule()
export class MiniProfilerModule {
  static forRoot(value: {
    useValue?: MiniProfilerConfig,
    useFactory?: Function,
    useClass?: Type<MiniProfilerConfig>
  } | MiniProfilerConfig
  ): ModuleWithProviders<MiniProfilerModule> {
    return {
      ngModule: MiniProfilerModule,
      providers: [
        MiniProfilerService,
        { 
          provide: MINI_PROFILER_CONFIG, 
          useValue: MiniProfilerModule.isMiniProfilerConfig(value) ? value : value.useValue, 
          useFactory: !MiniProfilerModule.isMiniProfilerConfig(value) ? value?.useFactory : undefined, 
          useClass: !MiniProfilerModule.isMiniProfilerConfig(value) ? value?.useClass : undefined
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: MiniProfilerInterceptor,
          multi: true,
        },
        {
          provide: APP_INITIALIZER,
          multi: true,
          deps: [MiniProfilerService],
          useFactory: loadMiniProfilerFactory,
        },
      ],
    };
  }


  private static isMiniProfilerConfig(value: {
    useValue?: MiniProfilerConfig,
    useFactory?: Function,
    useClass?: Type<MiniProfilerConfig>
  } | MiniProfilerConfig): value is MiniProfilerConfig {
    return 'baseUri' in value;
  }


}

export function loadMiniProfilerFactory(
  service: MiniProfilerService
): () => void {
  const init = () => loadMiniProfiler(service);
  return init;
}

export function loadMiniProfiler(service: MiniProfilerService): void {
  service.loadMiniProfiler();
}
