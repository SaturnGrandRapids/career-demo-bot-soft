@rem Need to start the Mongo Database
start "C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe" --dbpath c:\mongodata
@rem Using Mongo-Express for a web based admin tool
pushd "C:\Users\tmassaro\Documents\GitHub\career-demo-bot-soft\MazeApp\node_modules\mongo-express"
node app