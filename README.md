# splytcoreui
UI to demonstrate contract's functionality

git clone https://github.com/splytcore/splytcoreui.git
cd splytcoreui. 
npm install    
sudo bower install --allow-root  
gulp  

DATABASE SETUP()  

Local.     
use local-splytcore  
if you want to use credentails 
  db.createUser({ user: "user", pwd: "splyt2016!", roles: [{ role: "readWrite", db: "splytcore-stage" }] })  


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






