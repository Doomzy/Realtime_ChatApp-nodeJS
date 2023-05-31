import express from "express"
import {getUser, userLogin, userSignup, userLogout, findUser} from '../controllers/users.js'

const router= express.Router()

router.post('/find', findUser)
router.get('/profile/:id', getUser)

router.get('/login', (req, res)=> res.render('user/login.ejs', {err: ''}))
router.get('/signup',(req, res)=> res.render('user/signup.ejs', {err:''}))
router.get('/logout', userLogout)

router.post('/login', userLogin)
router.post('/signup', userSignup)

export default router