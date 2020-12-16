export interface MiniProfilerConfig {

  /** The path to the server providing MiniProfiler results. For example: http://localhost:12345/profiling */
  baseUri?: string;

  /** The position of the panel. Defaults to Left. */
  position?: 'Left' | 'Right' | 'BottomLeft' | 'BottomRight';

  /** The theme. Defaults to Auto. */
  colorScheme?: 'Light' | 'Dark' | 'Auto';

  /** Whether or not the controls should be shown. */
  showControls?: boolean;

  /** The maximum number of traces shown in the panel. */
  maxTraces?: number;

  /** The shortcut for toggling the panel. Defaults to 'Alt+M'. */
  toggleShortcut?: string;

  /** Whether or not MiniProfiler is enabled. */
  enabled?: boolean;

  /** Whether or not a "enableMiniProfiler" method should be added to the window object. Defaults to true. */
  enableGlobalMethod?: boolean;
}
