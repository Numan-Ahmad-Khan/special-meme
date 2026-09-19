const authorization = (...allowedRoles)=>{
    return (req,res,next)=>{
        if(!allowedRoles.includes(req.user.role)){
            res.json({error: "Access denied"})
        }
        next();
    }
}
module.exports = authorization