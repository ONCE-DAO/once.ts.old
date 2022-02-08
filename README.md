# once.ts

## Getting Started

Clone the repository in e.g. your user  tmp folder

```
git clone git@github.com:ONCE-DAO/once.ts.git
```

here all commands
```
mkdir -p ~/tmp/dev
cd ~/tmp/dev

git clone git@github.com:ONCE-DAO/once.ts.git


cd ~/tmp/dev/once.ts
npm i
```

## install the EAMD Repository 

```
npm run eamd:install
```

As a result Once will be 
- started
- discover that it is not installed
- intsall the EAMD.ucp repository in your users folder ```cd ~/EAMD.ucp```
- then you can open a new VS Code Window in with Open Folder ```~/EAMD.ucp```

## running Once

```
cd ~/EAMD.ucp
npm run dev
```


## debugging Once


in launch.json
```
...
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Once debugger",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/2_systems/Once.class.ts",
      "runtimeArgs": ["--inspect-brk","--experimental-modules","--experimental-loader","${workspaceFolder}/dist/2_systems/Once.class.js"],
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
...
```

use debug in Jest Tree View (Laboratory Glas)

## Updating

```
git pull --recurse-submodules
```


## Trouble Shooting

```
jest
io.orta.jest.toggle-coverage
not found
```

Shift Control P: Jest: Start All Runners
Shift Control P: Jest: Toggle Coverage
