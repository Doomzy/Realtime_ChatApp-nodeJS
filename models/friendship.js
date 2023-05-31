import mongoose from "mongoose"
import User from './user.js'

const FriendshipSchema= new mongoose.Schema({
    users:[{ //0 index sender, 1 index receiver
        type: mongoose.SchemaTypes.ObjectId, ref:'User'
    }],
    accepted:{
        type: Boolean,
        default: false,
    }
})

FriendshipSchema.methods.getSender= async function(){
    const user = await User.findById(this.users[0], 'full_name')
    return user
}

export default mongoose.model('Friendship', FriendshipSchema)