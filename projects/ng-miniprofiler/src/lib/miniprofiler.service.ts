import {
  Inject,
  Injectable,
  InjectionToken,
  OnDestroy,
  Optional,
  SkipSelf,
} from '@angular/core';
import { MiniProfilerConfig } from './miniprofiler-config.model';

export const MINI_PROFILER_CONFIG = new InjectionToken<string>(
  'MiniProfilerConfig'
);

@Injectable()
export class MiniProfilerService implements OnDestroy {
  constructor(
    @Inject(MINI_PROFILER_CONFIG) public config: MiniProfilerConfig,
    @Optional() @SkipSelf() other?: MiniProfilerService
  ) {
    if (other) {
      throw new Error('MiniProfilerService should only be instanciated once.');
    }

    if (this.config.enableGlobalMethod !== false) {
      window['enableMiniProfiler'] = () => this.loadMiniProfiler(true);
    }
  }

  public ngOnDestroy(): void {
    const mpNode = document.getElementById('mini-profiler');
    mpNode?.parentElement?.removeChild(mpNode);
    window['enableMiniProfiler'] = null;
  }

  public loadMiniProfiler(force: boolean = false): void {
    if (!force && !this.config.enabled) {
      return;
    }

    if (document.getElementById('mini-profiler')) {
      throw new Error(
        `An element with id 'mini-profiler' already is already present in the DOM.`
      );
    }

    const scriptElement = document.createElement('script');
    scriptElement.id = 'mini-profiler';
    scriptElement.async = true;
    scriptElement.type = 'text/javascript';
    scriptElement.src = `${this.config.baseUri}/mini-profiler-resources/includes.min.js`;
    scriptElement.dataset.path = `${this.config.baseUri}/mini-profiler-resources/`;
    scriptElement.dataset.position = this.config.position || 'Left';
    scriptElement.dataset.scheme = this.config.colorScheme || 'Auto';
    scriptElement.dataset.controls = `${this.config.showControls === true}`;
    scriptElement.dataset.authorized = 'true';
    scriptElement.dataset.maxTraces =
      this.config.maxTraces == null ? '15' : `${this.config.maxTraces}`;
    scriptElement.dataset.toggleShortcut =
      this.config.toggleShortcut || 'Alt+M';
    scriptElement.onload = () => console.log('MiniProfiler loaded.');
    scriptElement.onerror = (err: any) =>
      console.error('An error occured while loading MiniProfiler', err);

    document.getElementsByTagName('body')[0].appendChild(scriptElement);
  }
}
