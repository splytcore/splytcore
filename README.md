Splytcore2 API

git clone https://github.com/megatronv7/splytcore2.git
cd splytcore2
npm install  
sudo bower install --allow-root  
gulp  

DATABASE SETUP  

Stage  
use splytcore-stage  
db.createUser({ user: "user", pwd: "splyt2016!", roles: [{ role: "readWrite", db: "splytcore-stage" }] })  

Test  
use splytcore-test   
db.createUser({ user: "user", pwd: "splyt2016!", roles: [{ role: "readWrite", db: "splytcore-test" }] })  



ENVIRONMENTS STARTUP  

Development  
gulp  

Production  
Start  
sudo pm2 start pm2.json  

St
sudo pm2 stop SPLYT






