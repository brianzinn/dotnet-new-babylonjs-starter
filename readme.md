# dotnet new BabylonJS

> This is a starter setup for integration of BabylonJS into a dotnet new project.  You will need .NET Core SDK 1.0 RC4 (or later).  Visual Studio is optional.

"dotnet new" has a bunch of templates - this demo uses the reactredux one.  The current list is:

| Templates  | Short Name  | Language  | Tags  | |
|---|---|---|---|---|
| MVC ASP.NET Core with Angular | angular | [C#] | Web/MVC/SPA  | |
| MVC ASP.NET Core with Aurelia | aurelia | [C#] | Web/MVC/SPA | |
| MVC ASP.NET Core with Knockout.js | knockout |  [C#] | Web/MVC/SPA | |
| MVC ASP.NET Core with React.js | react |  [C#] | Web/MVC/SPA | |
| MVC ASP.NET Core with React.js and Redux | reactredux |  [C#] | Web/MVC/SPA |  ✓ Demo uses this one |
| MVC ASP.NET Core with Vue.js | vue |  [C#] | Web/MVC/SPA | |

### Features

&nbsp; &nbsp; ✓ uses React Scene to show a BabylonJS Scene in a React project.<br/>
&nbsp; &nbsp; ✓ uses events in BabylonJS scene to communicate to Redux reducer and render in page.<br/>
&nbsp; &nbsp; ✓ all benefits listed in template like HMR, server-side prerendering, webpack, TypeScript, .NET Core, Docker builds, etc.<br/>

When you start it up - it will look like this:
![Demo Screenshot](https://raw.githubusercontent.com/brianzinn/dotnet-new-babylonjs-starter/master/demo.png)

### Documentation

If you wanted to do this without the starter project, but from scratch yourself, it would be quite easy.

Start by reading this article with installation instructions for SPA templates:
https://blogs.msdn.microsoft.com/webdev/2017/02/14/building-single-page-applications-on-asp-net-core-with-javascriptservices/

```sh
npm install babylonjs --save
```

react-babylonjs (https://www.npmjs.com/package/react-babylonjs) is optional, too.  You can grab the source and put your own Scene component in your project.
```sh
npm install react-babylonjs --save
```

The first thing to change is to disable pre-rendering.  Likely you will only want to disable pre-rendering on pages using BabylonJS.  Project defaults will attempt server-side pre rendering, which is good for SEO or people without javascript.  You will get this error:
```sh
Exception: Call to Node module failed with error: Prerendering failed because of error: ReferenceError: window is not defined
```
It's easy to disable by removing the prerender module loading in index.cshtml.
"asp-prerender-module='ClientApp/dist/main-server'"

Next up is if you want to server non-standard mime-types.  I am serving .fx files in the demo for the skybox gradient.  Regular image and sound files will be served by default.

In Startup.cs:
```csharp
app.UseStaticFiles(
    new StaticFileOptions
    {   /* unknown mime types (ie: .fx) files will not be served, otherwise! */
        ServeUnknownFileTypes = true
    }
);
```

### Related Projects

* [React Redux BabylonJS Starter Kit](https://github.com/brianzinn/react-redux-babylonjs-starter-kit) — Fork of davesuko starter kit that uses the NPM from react-babylonjs.  The starter kit uses HMR, ES6, React, Redux and BabylonJS together with a modified Quarto game from http://www.pixelcodr.com/.


