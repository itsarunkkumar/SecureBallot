import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({  
    name: { 
        type: String, 
        required: true 
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String,
    },
    mobile:{
        type:String
    },
    address:{
        type:String,
        required:true
    },
    aadharCardNumber:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['voter', 'admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }

  
}, 
{
  collection: 'user'
});

userSchema.pre('save', async function(next){
    let person = this;
    
    if(!person.isModified('password')){
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hasedPassword = await bcrypt.hash(person.password, salt);
        person.password = hasedPassword;
        next()
        
    } catch (error) {
        return next(error);
    }
});


userSchema.methods.comparePassword = async function(uerPassword){
    try {
        console.log('compare');
        const isMatch = await bcrypt.compare(uerPassword, this.password);
        return isMatch;
    } 
    catch (error) {
        throw error;
    }
}


const User = mongoose.model('user', userSchema);
export default User;
