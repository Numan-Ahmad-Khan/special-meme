const jwt = require("jsonwebtoken")
function authentication (req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(token === null){
        return res.json({ Error : "Required token not found"})
    }
    jwt.verify(token, process.env.JWT_SECRET, (err,user)=>{
        if(err){
            console.log(err)
            return res.json({error : "Error in token verification"})
        }
        req.user = user
        next();
    })
}

module.exports = authentication