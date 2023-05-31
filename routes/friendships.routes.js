import express from "express"
import { sendRequest, acceptRequest, deleteFriendship } from '../controllers/friendships.js'

const router= express.Router()

router.post('/send/:id', sendRequest)
router.post('/accept/:id', acceptRequest)
router.post('/delete/:id', deleteFriendship)

export default router