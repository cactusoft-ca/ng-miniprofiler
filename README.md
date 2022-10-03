# NgMiniProfiler

This package contains an Http interceptor for using MiniProfiler with Angular.

## Getting started

To use it in your app, simply import the MiniProfilerModule and provide the interceptor.

```ts
import { MiniProfilerInterceptor, MiniProfilerModule } from '@cactusoft-ca/ng-miniprofiler';

@NgModule({
  [...]
  imports: [
    MiniProfilerModule.forRoot({
      baseUri: 'http://localhost:12345',
      colorScheme: 'Auto',
      maxTraces: 15,
      position: 'BottomLeft',
      toggleShortcut: 'Alt+M',
      enabled: true,
      enableGlobalMethod: true
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: MiniProfilerInterceptor, multi: true }
  ]
})
export class YourModule { }
```

### Configurations

Ng-miniprofiler offers a couple of configurations.

| Config             | Description                                                                                                                                                                                                                     | Default |
| ------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| baseUri            | The base uri of the server hosting your MiniProfiler results and `include.min.js` file. Depending on your configs, the results may be under the `profiling` route. The value should then be `http://localhost:12345/profiling`. | `''`    |
| colorScheme        | The theme. Either `Light`, `Dark` or `Auto`.                                                                                                                                                                                    | `Auto`  |
| maxTraces          | Maximum number of traces shown.                                                                                                                                                                                                 | `15`    |
| position           | Where the popup should be placed. Either `Left`, `Right`, `BottomLeft`, `BottomRight`.                                                                                                                                          | `Left`  |
| toggleShortcut     | The shortcut for toggling the popup.                                                                                                                                                                                            | `Alt+M` |
| showControls       | Whether or not the controls (minimize and clear) should be shown.                                                                                                                                                               | `false` |
| enabled            | Whether or not miniprofiler is enabled.                                                                                                                                                                                         | `true`  |
| enableGlobalMethod | Whether or not an `enableMiniProfiler` method should be added to the window object. Can be useful in a production environment where you want MiniProfiler to be disabed by default.                                             | `true`  |

## Backend gotchas

If your server lives on a different domain from your Angular app, you may run into two CORS issues.

Firstly, you need to allow your app to request MiniProfiler results. For an ASP.NET Web API solution, that's one way of doing so (in the `global.asax.cs` file).

```cs
protected void Application_BeginRequest()
{
    var context = HttpContext.Current;
    if (HttpContext.Current.Request.Path.StartsWith("/mini-profiler-resources"))
    {
        var origin = context.Request.Headers.Get("Origin");
        if (origin != null)
        {
            context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
        }
        if (context.Request.HttpMethod == "OPTIONS")
        {
            context.Response.StatusCode = 200;
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
            context.Response.Headers.Add("Access-Control-Allow-Methods", "OPTIONS, GET");
        }
    }
}
```

Secondly, your server needs to let your Angular app access the `X-MiniProfiler-Ids` headers. You may do that by adding an ActionFilter.

```cs
public class MiniProfilerCorsHeaderFilter : ActionFilterAttribute
{
    public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
    {
        actionExecutedContext.Response.Headers.Add("Access-Control-Expose-Headers", "X-MiniProfiler-Ids");
    }
}
```

## Enable mini-profiler manually

If you set the `enableGlobalMethod` configuration to `true`, you may call the `enableMiniProfiler` from your browser's devtools console to enable MiniProfiler manually.

```ts
> enableMiniProfiler();
>
> MiniProfiler loaded.
```

## To publish npm package

- The version in the package.json in the project folder must be incremented
- On github, in Settings -> Developer settings -> Personal Access Tokens. Generate a new token with the privileges to write:packages.

- Run command with your username, token and email.

```
npm login --scope=@cactusoft-ca --registry=https://npm.pkg.github.com
```

In the _./projects/ng-miniprofiler_ folder, run

```
npm run build:prod
```

Finally, run from the _./dist/ng-miniprofiler_ folder<project-name>

```
npm publish
```
