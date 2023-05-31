import express from "express"
import { getConvo, sendmsg } from '../controllers/conversations.js'

const router= express.Router()

router.post('/send/:id', sendmsg)
router.get('/:id', getConvo)

export default router