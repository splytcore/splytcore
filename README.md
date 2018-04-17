checkin_api  

git clone https://github.com/dmcnetid/checkin_api.git  
cd checkin_api  
npm install  
sudo bower install --allow-root  
gulp  

DATABASE SETUP  

Stage  
use checkin-stage  
db.createUser({ user: "user", pwd: "bernsInc2016!", roles: [{ role: "readWrite", db: "checkin-stage" }] })  

Test  
use checkin-test   
db.createUser({ user: "user", pwd: "bernsInc2016!", roles: [{ role: "readWrite", db: "checkin-test" }] })  



ENVIRONMENTS STARTUP  

Development  
gulp  

Production  
Start  
sudo pm2 start pm2.json  

Stop  
sudo pm2 stop CHECKIN  






