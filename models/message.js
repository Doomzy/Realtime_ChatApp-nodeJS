import mongoose from "mongoose"

const MessageSchema= new mongoose.Schema({
    conversation:{
        type: mongoose.SchemaTypes.ObjectId, ref:'Conversation'
    },
    sender:{
        type: mongoose.SchemaTypes.ObjectId, ref:'User'
    },
    content:{
        type: String,
        required: true
    }
})

export default mongoose.model('Message', MessageSchema)