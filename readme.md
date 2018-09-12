# dotnet new 'babylonjs'
> **discontinued**  although the react-redux is still officially supported (https://github.com/aspnet/Announcements/issues/289), I don't see any reason to use it over 'create react app'.  Starting with 2.1 the ClientApp dir is a standard CRA React app and has been changed from TypeScript to JavaScript.  The new React templates do not have SSR (Server Side Rendering) anymore, but those can be added without too much effort.  Also, with 2.1 Aurelia, Vue.js and Knockout have been removed.  The team has limited resources and they don't want to use those resources on 'dotnet new', which is entirely understandable and I agree that their effort is better spent elsewhere.  I would encourage looking at the CRA starters directly instead, here are the TypeScript and JavaScript projects:

| Language  | Link  |
|---|---|
| CRA TypeScript | https://github.com/brianzinn/create-react-app-typescript-babylonjs |
| CRA JavaScript | https://github.com/brianzinn/create-react-app-babylonjs

**If you would like to continue still, I have left the repo on the 2.0, which is TypeScript and SSR.**

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

react-babylonjs (https://www.npmjs.com/package/react-babylonjs) is optional, too.  You can always just grab the source and put your own Scene component in your project.
```sh
npm install react-babylonjs --save
```

The first thing to change is to disable pre-rendering.  Likely you will only want to disable pre-rendering on pages using BabylonJS.  Project defaults will attempt server-side pre rendering, which is good for SEO or people without javascript.  You will get this error:
```sh
Exception: Call to Node module failed with error: Prerendering failed because of error: ReferenceError: window is not defined
```
It's easy to disable by removing the prerender module loading in index.cshtml.
"asp-prerender-module='ClientApp/dist/main-server'"

**untested** The latest 'react-babylons' NPM does have SSR support.

Next up is if you want to server non-standard mime-types.  I am serving .fx files in the demo for the skybox gradient.  Regular image and sound files will be served by default.

In Startup.cs:
```csharp
app.UseStaticFiles(
    new StaticFileOptions
    {   /* unknown mime types (ie: .fx) files will not be served, otherwise! more secure to register specific mime-types */
        ServeUnknownFileTypes = true
    }
);
```


