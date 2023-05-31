import Friendship from '../models/friendship.js'
import User from '../models/user.js'

async function sendRequest(req, res){
    const rId= req.params.id
    const currentUser= res.locals.user
    const friendShip=await Friendship.findOne(
        {users: {$all:[rId, currentUser]}}
    )
    if(friendShip){
        res.json({'err': 'You cannot make multi requests to the same user'})
    }else{
        const newFriend= new Friendship({ users:[currentUser, rId]})
        try{
            await newFriend.save()
            res.json({'msg': 'Friend request has been sent', 'sender':currentUser})
        }catch(e){
            res.json({'err': 'Something went wrong'})
        }
    }
}

async function acceptRequest(req, res){
    const sId= req.params.id
    const currentUser= res.locals.user
    try{
        const friendShip=await Friendship.findOne(
            {'users.0':sId, 'users.1': currentUser }
        )
        if(friendShip){
            await friendShip.updateOne({accepted:true})
            const senderUser= await User.findOneAndUpdate(
                { _id: sId},
                { $push: { friends: currentUser } },
                {"fields": { "full_name":1}}
            )
            currentUser.friends.push(sId)
            await currentUser.save()
            res.json({
                'msg': 'Friend request has been accepted', 
                'sender': senderUser,
                'receiverId': currentUser._id, 'receiverName': currentUser.full_name
        })
        }
        else{
            res.json({'err': 'Friend request cannot be accepted or doesnt exist'})
        }
    }catch(e){
        res.json({'err': 'Something went wrong'})
    }
}

async function deleteFriendship(req, res){
    const sId= req.params.id
    const currentUser= res.locals.user.id
    try{
        await Friendship.findOneAndDelete(
            {users: {$all:[sId, res.locals.user ]} }
        )
        await User.findOneAndUpdate(
            { _id: sId},
            { $pull: { friends: currentUser } },
        )
        await User.findOneAndUpdate(
            { _id: currentUser},
            { $pull: { friends: sId } },
        )
        res.redirect('/')
    }catch(e){
        res.json({'err': 'Something went wrong'})
    }
}

export { sendRequest, acceptRequest, deleteFriendship }