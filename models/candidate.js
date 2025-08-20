import mongoose from 'mongoose';
import { type } from 'os';
// import bcrypt from 'bcrypt';
const candidateSchema = new mongoose.Schema({  
    name: { 
        type: String,
        required: true
    },
    party:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true

    },
    votes:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:true,
            },
            votedAt:{
                type:Date,
                default:Date.now()
            }
        }
    ],
    voteCount:{
        type:Number,
        default:0
    }
    
}, 
{
  collection: 'candidate'
});


const candidate = mongoose.model('candidate', candidateSchema);
export default candidate;
