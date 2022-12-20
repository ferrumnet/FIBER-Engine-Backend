# FIBER Engine Backend
Install the dependencies:
```bash
sudo npm i
```

## local:
```bash
npm run nodemon-dev-api
npm run nodemon-dev-cron
```

## Create build:
```bash
npm run build
```
## Dev:
```bash
npm run pm2-dev-api
npm run pm2-dev-cron
```

## Staging:
```bash
npm run pm2-staging-api
npm run pm2-staging-cron
```

## Production:
```bash
npm run pm2-prod-api
npm run pm2-prod-cron
```

App will run on 8080 port, you can update in server.ts
