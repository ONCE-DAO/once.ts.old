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



As a result Once will be 
- started
- discover that it is not installed
- intsall the EAMD.ucp repository in your users folder ```cd ~/EAMD.ucp```
- then you can open a new VS Code Window in with Open Folder ```~/EAMD.ucp```

## running Once

```
cd ~/EAMD.ucp
npm run prepare:run
```
prepare:run
## rebuilding Once

```
cd ~/EAMD.ucp
npm run dev
```


## running Once

```
cd ~/EAMD.ucp
npm start
```

## Updatting

```
git pull --recurse-submodules
```