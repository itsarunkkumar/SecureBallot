import express from 'express';
const router = express.Router();
import Candidate from './../models/candidate.js';
import User from './../models/user.js';

import jwtUtils from './../jwt.js';
const { jwtAuthMiddleware, generateToken } = jwtUtils;

// this function used to check the User Role
const checkRole = async (userId) =>{
    try {
        const user = await User.findById(userId)
        return user.role === 'admin';

    } catch (error) {
        return false;
    }
}

// Add candidate data
router.post('/' , jwtAuthMiddleware , async (req, res) => {
    try {
        
        if(! await checkRole(req.user.id)){
            return res.status(403).json({
                message: 'User Does Not have Admin Role',
            });
        }
         
        const data = req.body;
        const newCandidate =  new Candidate(data);
        const response = await newCandidate.save();

        console.log('data saved');
        res.status(200).json({
            response:response
        })
    } catch (error) {
        console.error;
        res.status(500).json({
            message:'Internal server error',
            success: false,
            error:error.message
        });
    }
});


router.put('/:candidateId', jwtAuthMiddleware , async (req, res) => {

    try {
        // This function used to check the user role
        if(! await checkRole(req.user.id)){
            return res.status(403).status({
                message: 'User Does Not have Admin Role',
            });
        }

        const candidateId = req.params.candidateId;
        const updateData = req.body;
        const response = await User.findByIdAndUpdate(candidateId, updateData ,{
            new: true, // return the updated document 
            runValidators:true // this will run mongo validation
        });

        if(!response){
            return res.status(404).json({
                message:'User Not Found',
            })
        }
        res.status(200).json({
            status:true,
            message: 'User Updated SuccessFully'
        });

    } catch (error) {
        console.error;
        res.status(500).json({
            error:'Internal Server Error',
            error:error.message
        })
    }
});

router.delete('/:candidateId', jwtAuthMiddleware ,async (req, res) => {

    try {
        // This function used to check the user role
        if(! await checkRole(req.user.id)){
            return res.status(403).status({
                message: 'User Does Not have Admin Role',
            });
        }

        const candidateId = req.params.candidateId;

        console.log('candidateId',candidateId);
        const response = await User.findByIdAndDelete(candidateId);

        if(!response){
            return res.status(404).json({
                status:false,
                message:'User Not Found',
            });
        }

        return res.status(200).json({
            status:true,
            message: 'Candidate deleted Success',
        });
 
    } catch (error) {
        console.error; 
        res.status(500).json({
            status:false,
            message:'Internal Server Error',
        });
    }

});


// Impliment the Vote Logic
router.post('/vote/:candidateId', jwtAuthMiddleware , async (req, res) => {

    const candidateId = req.params.candidateId;
    const userId = req.user.id

    try {
        const candiate = await Candidate.findById(candidateId);
        if(!candiate){
            return res.status(404).json({
                status:false,
                message: 'Candidate Not Found',
            })
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                status:false,
                message: 'User Not Found',
            })
        }
        if(user.isVoted){
            return res.status(400).json({
                status:false,
                message:'You Have Already Voted'
            })
        }
        if(user.role === 'admin'){
            return res.status(403).json({
                status:false,
                message:'Admin is Not Allowed to Vote'
            });
        }


        // Update the Candidate  document to the vote
        candiate.votes.push({user:userId})
        candiate.voteCount ++;
        await  candiate.save();

        // Update the User isVoted Value
        user.isVoted = true;
        await user.save();

        res.status(200).json({
            status:true,
            message:'Vote Recorded Successfully'
        })

    } catch (error) {
        console.error
        res.status(500).json({
            status:false,
            message:'Internal Server Error',
            error:error.message
        });
    }

});

//Vote Count
router.get('/vote/count', async (req, res) => {
    try {

        const candiate = await Candidate.find().sort({
            voteCount: 'desc'
        });

        const record = candiate.map((data) => {
            return{
                party: data.party,
                count:data.voteCount
            }
        });

        return res.status(200).json({
            status:true,
            voteRecord:record
        });
        
    } catch (error) {
        console.error
        res.status(500).json({
            status:false,
            message:'Internal Server Error',
            error:error.message
        });
    }
});

// Routes get to the All candidates
router.get('/candidates', async(req, res) => {
    try {
        const allCandidates = await Candidate.find();
        if(allCandidates.length == 0){
            return res.status(200).json({
                status:true,
                message:'No Any Candidate Found'
            });
        }

       const candidateData = allCandidates.map((data) => {
            return {
                name:data.name,
                party:data.party

            }
       });

        res.status(200).json({
            status:true,
            candidates:candidateData
        });

    } catch (error) {
        console.error;
        res.status(500).json({
            status:false,
            message:'Interval Server Error'
        });
    }
});

export default router;