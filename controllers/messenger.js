import User from '../models/user.js'
import Friendship from '../models/friendship.js'

async function messengerHome(req, res){
    let friendListIds= res.locals.user.friends
    try{
        const friendList= await User.find({'_id': {'$in': friendListIds}}, 'full_name')
        let requestsList= await Friendship.find({
            accepted: false, 'users.1':res.locals.user.id
        })
        requestsList= await Promise.all(requestsList.map(req=>req.getSender())) 
        res.render('messenger.ejs', {friendList, requestsList})
    }catch(err){
        res.json({'err': 'Something went wrong'})
    }
}

export {messengerHome}
