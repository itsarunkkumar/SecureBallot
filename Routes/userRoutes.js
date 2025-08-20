import express from 'express'
const router = express.Router();
import User from './../models/user.js';
import jwtUtils from './../jwt.js';
const { jwtAuthMiddleware, generateToken } = jwtUtils;

// Testing Routes
router.get('/ping' , function(req, res) {
    return res.send('pong');
});

// Sign Up Route
router.post('/signup', async (req, res) => {
  try {
        const data = req.body;

        if(data.role == 'admin'){
            const adminExists = await User.exists({role: data.role})
            if(adminExists){
                res.status(200).json({
                    message:'Admin exists Please change your role'
                });

            }
        }

        const newUser = new User(data);
        const savedUser = await newUser.save(); 

        const payload = {
            id:savedUser.id,
        }
        const token = generateToken(payload); 
        res.status(201).json({
            message: 'Data saved successfully',
            data: savedUser,
            token:token
        });
    }catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: error.stack  
        });
    }
});


// Login Route
router.post('/login', async (req, res) => {
    try {
        const {aadharCardNumber, password} = req.body;
        const user = await User.findOne({aadharCardNumber:aadharCardNumber});
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({
                error: 'Invalida user name or Password',
            })

        }
        // if the validation is passed generate the token
        const payload = {
            id:user.id,
            username:user.username
        }
        const token =  generateToken(payload);
        res.json({token:token})


    } catch (error) {
        console.error(error);
        res.status(500).json({
            error:'Internal Server Error'
        });

        
    }
});

// Profile Route
router.get('/profile', jwtAuthMiddleware ,async (req, res) => {
   try {
        const userData = req.user;
        const userId = userData.id;
        const user =  await User.findById(userId);
        res.status(200).json({
            success:true,
            userData:user
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error:'Internal Server Error'
        });
   }
});

router.put('/profile/password', jwtAuthMiddleware , async (req, res) => {
    try {
        const userId = req.user.id;
        const {currrentPassword , newPassword} = req.body; 

        const user =  await User.findById(userId);

        if(!(await user.comparePassword(currrentPassword))){
            return res.status(401).json({
                error: 'Invalida user name or Password',
            })
        }

        user.password = newPassword
        await user.save();

        console.log('Password Updated');
        res.json(200).json('Password Updated');
    } catch (error) {
        console.error(error);
        res.status(500).jsin({
            status:false,
            'msg': 'Internal server Error'
        })
    }
});



router.get('/', jwtAuthMiddleware , async (req, res) => {
    try {
        const data = await Person.find();
        res.status(200).json({
            data: data
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Internal Serve Error',
        });
    }
}); 


router.get('/:userType', async (req, res) => {

   try{
       const userType = req.params.userType;
        if(userType == 'manager' || userType == 'chef' || userType == 'waiter'){

            const data = await Person.find({work:userType});
            const isEmpty = data.length === 0
            if(isEmpty){
                res.status(404).json({
                    'msg' : 'This role is  not available',
                });
            }
            res.status(200).json(data);

        }else{
            res.status(404).json({
                error: 'Invalid work type'
            });
       }

    } catch(err){
        res.status(500).json({
            error: err,
            msg: 'Internal Server Error'
        })

    }

});


router.put('/update-user', async (req, res) => {
    const { email, ...updateData } = req.body;

    if (!email) {  
     return res.status(400).json({ error: 'Email is required to find the user.' });
    }

  try {
        const updatedPerson = await Person.findOneAndUpdate(
            { email: email },      // find person by email
            updateData,            // update with remaining fields
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedPerson) {
            return res.status(404).json({ error: 'User not found with this email' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            data: updatedPerson
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

export default router; 