import jwt from 'jsonwebtoken';

const jwtAuthMiddleware = (req , res, next) => {

    const authorizationCheck = req.headers.authorization

    if(!authorizationCheck){
        return res.status(410).json({
            error: 'Token Not Found'
        });
    }

    const token = req.headers.authorization.split(' ')[1];
    if(!token){
        return res.status(401).json({
            error: 'Unauthorized'
        })
    }

    try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded
       next();

    } catch (error) {
        console.error(error);
        res.status(401).json({
            error:'Invalid token'
        });
        
    }
}

// Generate token
const generateToken  = (userdata) => {
    return jwt.sign(userdata,process.env.JWT_SECRET, {expiresIn: 300000})
}

export default {jwtAuthMiddleware, generateToken }; 