import friendship from '../models/friendship.js'
import User from '../models/user.js'
import {createToken} from '../utils/auth.js'

async function getUser(req, res){
    const id= req.params.id
    const curr_uid= res.locals.user.id
    try{
        const user= await User.findById(id, 'full_name email')
        let isFriend= "no"
        const userFriendship= await friendship.findOne({users:{$all:[id, curr_uid]}})
        if(userFriendship?.accepted== true){
            isFriend= 'yes'
        }else if(userFriendship?.accepted== false && userFriendship?.users[0]==curr_uid){
            isFriend= 'sent'
        }
        else if(userFriendship?.accepted== false && userFriendship?.users[1]==curr_uid){
            isFriend= 'pending'
        }
        res.json({user, isFriend})
    }catch(err){
        res.json({'msg': 'Somthing wrong happend'})
    }
}

async function findUser(req, res){
    const searchString= req.body.searchString
    try{
        const matchedUsers= await User.find({
            full_name: {$regex: new RegExp(searchString, "i")},
            _id: {$ne: res.locals.user}
        }
            , 'full_name'
        )
        res.json({matchedUsers})
    }catch(err){
        res.json({'msg': 'cannot find users with this name'})
    }
}

async function userLogin(req, res){
    const {email, password}= req.body
    try{
        const user= await User.login(email, password)
        const token= createToken(user._id)
        res.cookie('JWT', token, {httpOnly: true, maxAge:5*24*60*60 *1000})
        res.redirect('/')
    }catch(err){
        res.render('user/login.ejs', {err})
    }
}

async function userSignup(req, res){
    const {first_name, last_name, password, email}= req.body
    const newUser= new User({
        first_name, last_name, password, email
    })
    try{
        await newUser.save()
        const token= createToken(newUser._id)
        res.cookie('JWT', token, {httpOnly: true, maxAge:5*24*60*60 *1000})
        res.redirect('/')
    }catch(err){
        res.render('user/signup.ejs', {err: err.errors})
    }
}

function userLogout(req, res){
    res.cookie('JWT', '', {maxAge: 1})
    res.redirect('/u/login')
}

export {getUser, userLogin, userSignup, userLogout, findUser}