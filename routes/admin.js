const express = require("express")
const authorization = require("../middleware/authorization")
const authentication = require("../middleware/authentication")
const User = require("../models/Users")
const Config = require("../models/Config")
const Order = require("../models/Orders")
const Rider = require("../models/Rider")
const Checkpoint = require("../models/Checkpoint")
const { sendEmail } = require("../services/emailServices")

const router = express.Router()

router.get("/admin/me",authentication, authorization("ADMIN"), async(req,res)=>{
    try{
        const user = await User.findOne({where: {id: req.user.userId}, attributes: {exclude : ["password"]}})
        if(!user){
            return res.json({msg:"Error not found"})
        }
        return res.json({user})
    }
    catch(err){
        console.log(err)
        res.json({error : "Server Error"})
    }
})

router.get("/admin/order/:id",authentication, authorization("ADMIN"), async(req,res)=>{
    try{
        const order = await Order.findOne(
            {where: {id : req.params.id},
            attributes:[
                "id",
                "orderName",
                "status",
                ]
            })
        if(!order){
            return res.json({message: "Invalid Order ID"})
        }
        return res.json({   
            Success : "Order Status",
            Details : order
        })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})

router.patch("/admin/order/change_status/:id", authentication, authorization("ADMIN"), async(req,res)=>{
    try{
     
        const {status} = req.body
        const order = await Order.findOne({where:{id: req.params.id}})
        if(!order){
            return res.json({Error : "Order Id invalid"})
        }
        const oldStatus = order.status
        order.status = status
        await order.save()
        return res.json({
            msg: "Updated status",
            oldStatus : oldStatus,
            newStatus : status
        })
        
    }
    catch(err){
        console.log(err)
        res.status(500).json({msg: "Internal server error"})
    }
})
router.patch("/admin/order/checkpoint_update/:id", authentication, authorization("ADMIN"), async(req,res)=>{
    try{
        const { chcekpointId } = req.body
        const order = await Order.findOne({where:{id: req.params.id}})
        if(!order){
            return res.json({Error : "Order Id invalid"})
        }
        if(!order.status === "IN_TRANSIT"){
            return res.json({msg: "Oder not in transit"})
        }
        order.transitDetail = chcekpointId
        await order.save()
        return res.json({
            msg: "Checkpoint Added"
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({msg: "Internal server error"})
    }
})
router.get("/admin/order_list",authentication, authorization("ADMIN"), async(req,res)=>{
    try{
        const order = await Order.findAll(
            {
            attributes:[
                "id",
                "userId",
                "orderName",
                "status",
                ]
            })
        return res.json({   
            Details : order
        })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})
router.get("/admin/user_list",authentication, authorization("ADMIN"), async(req,res)=>{
    try{
        const users = await User.findAll(
            {
            attributes: {exclude:["password"]}
            })
        return res.json({   
            user_list: users
        })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})
router.patch("/admin/change_rate", authentication, authorization("ADMIN"), async(req,res)=>{
    try {
        const { rateDistance, rateDimensions, rateWeight } = req.body;
        if(rateDistance === undefined || rateDistance === null || (typeof rateDistance === 'object' && Object.keys(rate).length ===0)) {
            return res.status(400).json({ Error: "Cannot be empty/undefined" });
        }
        if(rateDimensions === undefined || rateDimensions === null || (typeof rateDimensions === 'object' && Object.keys(rate).length ===0)) {
            return res.status(400).json({ Error: "Cannot be empty/undefined" });
        }
        if(rateWeight === undefined || rateWeight === null || (typeof rateWeight === 'object' && Object.keys(rate).length ===0)) {
            return res.status(400).json({ Error: "Cannot be empty/undefined" });
        }
        await Config.upsert({
            id: "SINGLETON",
            rateValueDistance: rateDistance,
            rateKeyDistance: "RATE_PER_KM",
            rateKeyDimensions: "RATE_VOLUME",
            rateValueDimensions: rateDimensions,
            rateKeyWeight: "RATE_PER_KG",
            rateValueWeight: rateWeight
        });

        return res.json({ msg: `Success, rates have been updated` });
    }
    catch(err){
        console.log(err)
        return res.json({msg: "Internal server error"})
    }
})

router.patch("/admin/add_checkpoint", authentication, authorization("ADMIN"), async(req,res)=>{
    try {
        const {checkpointName, checkpointDetail, longitude, latitude} = req.body
        const checkpoint = await Checkpoint.create({
            checkpointName,
            checkpointDetail,
            longitude,
            latitude
        })
        return res.json({
            msg: "Checkpoint Created Successfully",
            checkpoint
        })
    }

    catch(err){
        console.log(err)
        return res.json({msg: "Internal server error"})
    }
})

router.get("/admin/test-email", async (req, res) => {
    try {
        await sendEmail(
            "sabreenafayaz08@gmail.com",
            "001 Backend Test Email",
            `
                <h2>Email System Working!<br>lalalalluluulululululu</h2>
                <p>This email was sent using Nodemailer.</p>
                <p>Your 001 backend email system is configured correctly.</p>
            `
        );

        res.status(200).json({
            message: "Test email sent successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send test email",
            error: error.message
        });
    }
});


module.exports = router