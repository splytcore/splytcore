Reward API

git clone https://github.com/megatronv7/reward.git
cd reward
npm install  
sudo bower install --allow-root  
gulp  

DATABASE SETUP  

Stage  
use reward-stage  
db.createUser({ user: "user", pwd: "bernsInc2016!", roles: [{ role: "readWrite", db: "reward-stage" }] })  

Test  
use reward-test   
db.createUser({ user: "user", pwd: "bernsInc2016!", roles: [{ role: "readWrite", db: "reward-test" }] })  



ENVIRONMENTS STARTUP  

Development  
gulp  

Production  
Start  
sudo pm2 start pm2.json  

St
sudo pm2 stop REWARD






