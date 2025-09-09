# fragments
Fragment - Scripts

1. Setup:
Install all the existing dependencies, run command:
npm install 

2. To run ESLINT on ./src/**/*.js (all js files in src folder):
npm run lint

3. To start server (only once, using current shell enviroment):
npm start

* To test server and HTTP Headers, run on Powershell:  
curl.exe -i http://localhost:8080

* On Windows/Powershell, always use .exe when using curl

4. To start server and load enviroment variables from debug.env:
npm run dev

* Make sure debug.env includes:
LOG_LEVEL=debug

* To test server and present HTTP headers clearly:
curl.exe -s http://localhost:8080 | jq

5. To debug, either go to Run and debug tab via VS and select Debug via npm run debug, or run command:
npm run debug

* (From Document) In order to set this up, add a new file to your .vscode/ folder named launch.json, with the following contents:

// .vscode/launch.json

{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    // Start the app and attach the debugger
    {
      "name": "Debug via npm run debug",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run-script", "debug"],
      "skipFiles": ["<node_internals>/**"],
      "type": "node"
    }
  ]
}

* Breakpoint: place a breakpoint on res.status(200).json(in src/app.js), start debug above, then go to http://localhost:8080.


