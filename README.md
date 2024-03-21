
## Quickstart

Using Node v20+

```
npm i
npm run dev
```
Runs on port `3000` by default

Alternatively. build and run in docker

```
docker build --progress=plain . -t sword-fe:latest
docker run -d --name sword-fe -p 3000:3000 sword-fe
```