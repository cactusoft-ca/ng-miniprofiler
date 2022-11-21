import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, ModuleWithProviders, NgModule, Provider, Type, TypeProvider, ValueProvider } from '@angular/core';
import { MiniProfilerConfig } from './miniprofiler-config.model';
import { MiniProfilerInterceptor } from './miniprofiler.interceptor';
import {
  MiniProfilerService,
  MINI_PROFILER_CONFIG,
} from './miniprofiler.service';

@NgModule()
export class MiniProfilerModule {
  static forRoot(value: Omit<Provider, 'provide'>): ModuleWithProviders<MiniProfilerModule>;
  /**
   * @deprecated This signature will be removed in a future version. Instead you
   * can specify the value to be used with { useValue: }
   */
  static forRoot(value: MiniProfilerConfig): ModuleWithProviders<MiniProfilerModule>;
  static forRoot(value: Omit<Provider, 'provide'> | MiniProfilerConfig
  ): ModuleWithProviders<MiniProfilerModule> {
    const configProvider = { 
      provide: MINI_PROFILER_CONFIG, 
      useValue: MiniProfilerModule.isMiniProfilerConfig(value) ? value : (MiniProfilerModule.isValue(value) ? value.useValue : undefined), 
      useFactory: MiniProfilerModule.isFactory(value) ? value.useFactory : undefined, 
      useClass: MiniProfilerModule.isClass(value) ? value?.useClass : undefined,
      deps: MiniProfilerModule.hasDeps(value) ? value?.deps : undefined,
      multi: MiniProfilerModule.hasMulti(value) ? value?.multi : undefined,
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

  private static isMiniProfilerConfig(value: Omit<Provider, 'provide'> | MiniProfilerConfig): value is MiniProfilerConfig {
    return 'baseUri' in value;
  }

  private static isFactory(value: Omit<Provider, 'provide'> | MiniProfilerConfig): value is FactoryProvider {
    return 'useFactory' in value;
  }

  private static isValue(value: Omit<Provider, 'provide'> | MiniProfilerConfig): value is ValueProvider {
    return 'useValue' in value;
  }

  private static isClass(value: Omit<Provider, 'provide'> | MiniProfilerConfig): value is ClassProvider {
    return 'useClass' in value;
  }

  private static hasMulti(value: Omit<Provider, 'provide'> | MiniProfilerConfig): value is { multi: boolean } {
    return 'multi' in value;
  }

  private static hasDeps(value: Omit<Provider, 'provide'> | MiniProfilerConfig): value is { deps?: any[] } {
    return 'deps' in value;
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
