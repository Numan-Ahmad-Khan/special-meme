const express = require("express")
const authorization = require("../middleware/authorization")
const authentication = require("../middleware/authentication")
const User = require("../models/Users")
const Order = require("../models/Orders")
const Address = require("../models/Address")
const Config = require("../models/Config")
const Rider = require("../models/Rider")
const bcrypt = require("bcrypt")
const haversine = require('haversine-distance')
const { boolean } = require("zod")
const router = express.Router()
router.get("/rider/me",authentication, authorization("RIDER"), async(req,res)=>{
    try{
        const rider = await Rider.findOne({where: {id: req.user.riderId}, attributes: {exclude : ["password"]}})
        console.log(rider)
        if(!rider){
            return res.json({msg:"Error not found"})
        }
        return res.json({rider})
    }
    catch(err){
        console.log(err)
        res.json({error : "Server Error"})
    }
})

router.get("/rider/update_order", authentication, authorization("RIDER"), async(req,res)=>{
    try{
        const rider = await Rider.findOne({where: {id: req.user.riderId}})
        const order =  await Order.findOne({where: {id: req.body.id }})
        if(!order){
            return res.json({ msg: "Invalid Order ID"})
        }
        if(!order.riderId === rider.id){
            return res.json({ msg: "Denied, cannot update"})
        }
        order.status = "DELIVERED"
        await order.save()
        return res.json({msg: "Status changed to delivered"})
    }
    catch(err){
        console.log(err)
        return res.json({error: "Internal server Error"})
    }
})

module.exports = router