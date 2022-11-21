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
    useClass?: Type<MiniProfilerConfig>,
    deps?: any,
    multi?: boolean
  }): ModuleWithProviders<MiniProfilerModule>;
  /**
   * @deprecated This signature will be removed in a future version. Instead you
   * can specify the value to be used with { useValue: }
   */
  static forRoot(value: MiniProfilerConfig): ModuleWithProviders<MiniProfilerModule>;
  static forRoot(value: {
    useValue?: MiniProfilerConfig,
    useFactory?: Function,
    useClass?: Type<MiniProfilerConfig>,
    deps?: any,
    multi?: boolean
  } | MiniProfilerConfig
  ): ModuleWithProviders<MiniProfilerModule> {
    const configProvider = { 
      provide: MINI_PROFILER_CONFIG, 
      useValue: MiniProfilerModule.isMiniProfilerConfig(value) ? value : value.useValue, 
      useFactory: !MiniProfilerModule.isMiniProfilerConfig(value) ? value?.useFactory : undefined, 
      useClass: !MiniProfilerModule.isMiniProfilerConfig(value) ? value?.useClass : undefined,
      deps: !MiniProfilerModule.isMiniProfilerConfig(value) ? value?.deps : undefined,
      multi: !MiniProfilerModule.isMiniProfilerConfig(value) ? value?.multi : undefined,
    };

    // Cleanup keys
    Object.keys(configProvider).forEach(key => configProvider[key] === undefined ? delete configProvider[key] : {});

    return {
      ngModule: MiniProfilerModule,
      providers: [
        MiniProfilerService,
        configProvider,
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
