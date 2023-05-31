import Conversation from '../models/conversation.js'
import Friendship from '../models/friendship.js'
import Message from '../models/message.js'

async function checkFriendship(user1, user2){
    const areFriends= await Friendship.findOne({users: {$all:[user1, user2]} })
    if(areFriends){
        return true
    }else{
        return false
    }
}

async function getConvo(req, res){
    const receiverId= req.params.id
    const userId= res.locals.user
    try{
        let convo= await Conversation.findOne({users: {$all:[receiverId, userId]} })
        if(await checkFriendship(receiverId, userId)){
            if(!convo){
                convo= new Conversation({users:[receiverId, userId]})
                await convo.save()
            }
            const messages= await Message.find({conversation: convo.id})
            res.json({messages, convoId: convo.id})
        }else{
            res.json({'err': 'This user is not on your friend list'})
        }
    }catch(e){
        res.json({'err': 'Invalid User ID'})
    }
}

async function sendmsg(req, res){
    const convoId= req.params.id
    const senderId= res.locals.user
    const msgContent= req.body.content
    let convo= await Conversation.findOne({_id:convoId, users: senderId})
    try{
        if(await checkFriendship(convo.users[0], convo.users[1])){
            const newMsg= new Message({conversation: convoId, sender: senderId, content: msgContent})
            await newMsg.save()
            res.json(newMsg)
        }else{
            res.json({'err':'This user is not on your friend list'});
        }
    }catch(e){
        res.json({'err': "something went wrong"})
    }
}

export{ getConvo, sendmsg }