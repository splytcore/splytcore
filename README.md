# Splyt Core UI
SplytCore Server side UI for managing assets

### Software
NPM  : ~6.9.0
Node : ~10.16.0
Gulp : ~3.9.1   
Bower: ~1.8.3   

----

### Installation
##### All environment
`$` git clone `https://github.com/splytcore/SplytCore`
`$` cd SplytCore
`$` nvm use stable `** if using nvm`
`$` npm install
`$` sudo bower install --allow-root
`$` npm install gulp -g

##### Staging & Production
`$` npm install pm2 -g

---
### Running
##### Development
`** Add dev machine's IP Address to parity server's firewall`

`$` npm start
or
`$` gulp start

##### Staging
`$` npm start stage
or
`$` pm2 start pm2.json  `(daemon service)`

##### Production
`$` npm start prod
or
`$` pm2 start pm2.json `(daemon service)`
---
## Api Documentation:
##### Public api:
***GET @ /api/assets?listType=ASSETS.LISTNORMAL***
  * Will list all normal(non-fractional) assets from blockchain, populate extra metadata from database and serve.
