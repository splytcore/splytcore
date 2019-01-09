# splytcoreui
UI to demonstrate contract's functionality


Tools required  
NPM 6.4.1  
Node version 8.12.0
gulp  3.9.1   
bower 1.8.3   


git clone https://github.com/splytcore/splytcoreui.git
cd splytcoreui. 
npm install    
sudo bower install --allow-root  
gulp  

DATABASE SETUP  

Local.     
use local-splytcore  
if you want to use credentails 
  db.createUser({ user: "user", pwd: "splyt2016!", roles: [{ role: "readWrite", db: "splytcore-stageClippers7!
   }] })  


Dev.     
use dev-splytcore  
if you want to use credentails   
	db.createUser({ user: "user", pwd: "splyt2016!", roles: [{ role: "readWrite", db: "splytcore-stage" }] })  

Test  
use test-splytcore   
if you want to use credentails 
  db.createUser({ user: "user", pwd: "splyt2016!", roles: [{ role: "readWrite", db: "splytcore-test" }] })  


ENVIRONMENTS STARTUP  

Development  
gulp  

Production  
Start    
sudo pm2 start pm2.json  

Stop     
sudo pm2 stop SPLYT



-----------
Oracle price data api

GET @ pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=1027

headers -->  X-CMC_PRO_API_KEY: 9ee3f9be-fc7a-4b0f-8843-df2e01195d25

price = parseInt(res.data[1027].quote.USD.price) // is your price we need in contract



