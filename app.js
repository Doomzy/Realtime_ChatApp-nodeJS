import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import userRouter from './routes/users.routes.js'
import convoRouter from './routes/conversations.routes.js'
import friendshipRouter from './routes/friendships.routes.js'
import { messengerHome } from './controllers/messenger.js'
import { isAuthentecated, getLoggedUser } from './utils/auth.js'
import dotenv from 'dotenv'
import { Server } from 'socket.io';

dotenv.config()
const app = express()
app.use(express.urlencoded({extended: false}))
app.use(express.static('static'));
app.use(express.json())
app.set('view engine', 'ejs')
app.use(cookieParser())

async function runServer(){
  const uri= process.env.dbURI
  const port= process.env.PORT
  try{
    await mongoose.connect(uri)
    .then(()=>console.log('db is connected')).catch((e)=> console.log(e))
    const myServer= app.listen(port, () => console.log(`listening on *:${port}`));
    
    const io= new Server(myServer)
    let onlineUsers= []
    ///////socket///////
    io.on("connection", socket => {
      const sid= socket.id
      socket.on('userOnline', (uid)=>{
        !onlineUsers.some(user=> user.uid === uid) &&
        onlineUsers.push({uid, sid})
        io.emit("getOnlineUsers", onlineUsers)  
      })

    socket.on("sendMessage", ({sender, receiver, msg})=>{
      const receiverUser= onlineUsers.find(user=> user.uid === receiver)
      if(receiverUser){
        io.to(receiverUser.sid).emit("receiveMessage", {sender:sender._id, msg})
      }
    })

    socket.on("sendFriendReq", ({receiver, sender})=>{
      const receiverUser= onlineUsers.find(user=> user.uid === receiver)
      if(receiverUser){
        io.to(receiverUser.sid).emit("receiveFriendReq", 
          {name: sender.full_name, id: sender._id}
        )
      }
    })

    socket.on("acceptFriendReq", ({sender, receiverName, receiverId})=>{
      const senderUser= onlineUsers.find(user=> user.uid === sender._id)
      if(senderUser){
        io.to(senderUser.sid).emit("acceptedFriendReq", 
          {name: receiverName, id: receiverId}
        )
      }
    })

      socket.on('disconnect', ()=>{
        onlineUsers= onlineUsers.filter(user=> user.sid !== sid)
        io.emit("getOnlineUsers", onlineUsers)
      })
    })
    ///////socket///////
  }catch(e){
    console.log(e)
  }
}

app.use('/u',getLoggedUser, userRouter)
app.all('*', [getLoggedUser, isAuthentecated])
app.get('/', messengerHome)
app.use('/convo', convoRouter)
app.use('/friends', friendshipRouter)

runServer()