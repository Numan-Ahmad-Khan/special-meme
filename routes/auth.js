const express = require("express")
const bcrypt = require("bcrypt")
const z = require("zod")
const User = require("../models/Users")
const Rider = require("../models/Rider")
const Address= require("../models/Address")
const jwt = require("jsonwebtoken")
const router = express.Router()

const signupSchema = z.object({
    name : z.string().trim().min(1),
        email : z.string().email("Invalid Email Format"),
        
        password : z.string().
                        min(8,"Password must be at least 8 characters").
                        regex(/[A-Z]/, "Password must contain at least 1 character in Uppercase/Capital").
                        regex(/[0-9]/, "Password must contain atleast one numeric chracter"),
})
const loginSchema = z.object({
    email : z.string().email(),
    password : z.string().min(8)
})

router.post("/auth/signup", async(req,res)=>{
    const result = signupSchema.safeParse(req.body)
    if(!result.success){
        const formattedErrors = result.error.format();
        return res.status(400).json({ errors: formattedErrors });
    }
    try{
        const role = req.body.role
        const {name , email, password} = result.data
        const hashedPassword = await bcrypt.hash(password, 10)
        
        const createdUser = await User.create({
            name : name,
            email: email,
            password: hashedPassword,
            role : role
        })
        return res.status(200).json({
            message: "User Created",
            name: createdUser.name,
            email: createdUser.email
        })

    }
    catch(err){
        console.error("Error : " + err)
        return res.status(500).json({ msg: "Internal server error"})
    }
})
router.post("/auth/login", async(req,res)=>{
    try{
        const result = loginSchema.safeParse(req.body)
        if(!result.success){
            return res.json({message : "Error invalid input format"})
        }
        const {email, password} = result.data
        const user = await User.findOne({where: { email }})
        if(!user){
            return res.json({message : "Invalid Credentials"})
        }
        if(!user.isActive){
            return res.json({message : "User deactivated"})
        }
        const verification = await bcrypt.compare(password, user.password)
        if(!verification){
            return res.json({message : "Invalid password"})
        }
        const token = jwt.sign({
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        )
        return res.json({msg : "Logged In ", token, user : user.id })
    }
    catch(err){
        console.log(err)
        res.status(500).json({msg:"Server error"})
    }
})

//=======================================================================================
//=======================================================================================
//=======================================================================================

router.post("/auth/rider/signup", async(req,res)=>{
    const result = signupSchema.safeParse(req.body)
    if(!result.success){
        const formattedErrors = result.error.format();
        return res.status(400).json({ errors: formattedErrors });
    }
    try{
        const {name , email, password} = result.data
        const hashedPassword = await bcrypt.hash(password, 10)
        const createdRider = await Rider.create({
            name : name,
            email: email,
            password: hashedPassword,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        })
        return res.status(200).json({
            message: "Rider Created",
            name: createdRider.name,
            email: createdRider.email
        })

    }
    catch(err){
        console.error("Error : " + err)
        return res.status(500).json({ msg: "Internal server error"})
    }
})
router.post("/auth/rider/login", async(req,res)=>{
    try{
        const result = loginSchema.safeParse(req.body)
        if(!result.success){
            return res.json({message : "Error invalid input format"})
        }
        const {email, password} = result.data
        const rider = await Rider.findOne({where: { email }})
        if(!rider){
            return res.json({message : "Invalid Credentials"})
        }
        if(!rider.isActive){
            return res.json({message : "Rider has account deactivated"})
        }
        const verification = await bcrypt.compare(password, rider.password)
        if(!verification){
            return res.json({message : "Invalid password"})
        }
        const token = jwt.sign({
            riderId: rider.id,
            name: rider.name,
            email: rider.email,
            role: rider.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        )
        return res.json({msg : "Logged In ", token, rider : rider.id })
    }
    catch(err){
        console.log(err)
        res.status(500).json({msg:"Server error"})
    }
})



module.exports = router
