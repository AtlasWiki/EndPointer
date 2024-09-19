# Build System
Build is managed in vite.config

It takes files from /src/<freature> and outputs their JS Globs in /dist/<feature>.

!!! It ignores the component folder so you can place build components here and import them to where they're needed, the build system currently outputs these to root of the output folder. I intend to make i put it into a /component folder !!!

Each <feature> is expect to have it's own 
    - /<feature>.html  > The primary entry point for the feature
    - /<feature>Router.tsx > The router component to allows for SPA functionality
    - /<feature>App.tsx > The Default <feature> UI Page 
    - /<feature>/backgound.ts > The background handlers
    - /<feature>/content.ts > The content scripts

# Pop Up Example(/src/PopUp/)

## Entry Point (popup.html)
The Primary Entry point expected by the build system to be /src/PopUp/popup.html

## PopUpRouter.tsx
The file is called by then entry point, It sets up the Router for the PopUp instance allowing 
for dynamic routing inside the PopUp.

## PopUpApp.tsx
The base component in the router, This is the PopUp "Main Menu". 

yo
