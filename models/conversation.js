import mongoose from "mongoose"

const ConvoSchema= new mongoose.Schema({ 
    users:[{
        type: mongoose.SchemaTypes.ObjectId, ref:'User'
    }]
})

export default mongoose.model('Conversation', ConvoSchema)