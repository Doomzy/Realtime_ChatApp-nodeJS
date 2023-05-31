import JWT from 'jsonwebtoken'
import User from '../models/user.js'
import dotenv from 'dotenv'

dotenv.config()

const secretKey= process.env.jwt_secretkey

function createToken(uid){
    return JWT.sign({uid}, secretKey, {expiresIn: 5*24*60*60})
}

function isAuthentecated(req, res, next){ //Middleware
    const token= req.cookies.JWT
    if(token){
        JWT.verify(token, secretKey, (err, validToken)=>{
            if(err){
                res.redirect('/u/login')
            }else{ // token is valid
                next()
            }
        })
    }else{
        res.redirect('/u/login')
    }
}

function getLoggedUser(req, res, next){ //Middleware
    const token= req.cookies.JWT
    if(token){
        JWT.verify(token, secretKey, async (err, validToken)=>{
            if(err){
                res.locals.user= null
            }else{ // token is valid
                let loggedUser= await User.findById(validToken.uid)
                res.locals.user= loggedUser
            }
            next()
        })
    }else{
        res.locals.user= null
        next()
    }
}

export {createToken, isAuthentecated, getLoggedUser}