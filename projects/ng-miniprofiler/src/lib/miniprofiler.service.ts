import {
  Inject,
  Injectable,
  OnDestroy,
  Optional,
  SkipSelf,
} from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  MiniProfilerConfig,
  MINI_PROFILER_CONFIG,
} from './miniprofiler-config.model';

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

    this.sub = this.isEnabled$
      .pipe(distinctUntilChanged())
      .subscribe((isEnabled) => {
        if (isEnabled) {
          this.addMiniProfiler();
        } else {
          this.removeMiniProfiler();
        }
      });
  }

  private scriptElement: HTMLScriptElement;
  private sub: Subscription;
  public isEnabled$: Subject<boolean> = new BehaviorSubject<boolean>(false);

  public loadMiniProfiler(force: boolean = false): void {
    this.isEnabled$.next(force || this.config.enabled);
  }

  private addMiniProfiler() {
    if (document.getElementById('mini-profiler')) {
      throw new Error(
        `An element with id 'mini-profiler' already is already present in the DOM.`
      );
    }

    this.scriptElement = document.createElement('script');
    this.scriptElement.id = 'mini-profiler';
    this.scriptElement.async = true;
    this.scriptElement.type = 'text/javascript';
    this.scriptElement.src = `${this.config.baseUri}/mini-profiler-resources/includes.min.js`;
    this.scriptElement.dataset.path = `${this.config.baseUri}/mini-profiler-resources/`;
    this.scriptElement.dataset.position = this.config.position || 'Left';
    this.scriptElement.dataset.scheme = this.config.colorScheme || 'Auto';
    this.scriptElement.dataset.controls = `${
      this.config.showControls === true
    }`;
    this.scriptElement.dataset.authorized = 'true';
    this.scriptElement.dataset.maxTraces =
      this.config.maxTraces == null ? '15' : `${this.config.maxTraces}`;
    this.scriptElement.dataset.toggleShortcut =
      this.config.toggleShortcut || 'Alt+M';
    this.scriptElement.onload = () => console.log('MiniProfiler loaded.');
    this.scriptElement.onerror = (err: any) =>
      console.error('An error occured while loading MiniProfiler', err);

    document.getElementsByTagName('body')[0].appendChild(this.scriptElement);
  }
  private removeMiniProfiler() {
    this.scriptElement?.remove();
    this.scriptElement = undefined;
  }

  public ngOnDestroy(): void {
    window['enableMiniProfiler'] = null;
    this.isEnabled$.next(false);
    this.isEnabled$.complete();
    this.sub.unsubscribe();
  }
}
