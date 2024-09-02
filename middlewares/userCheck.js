const jwt = require("jsonwebtoken")


const checkUser=(req,res)=>{
    const userValid = req.get("userValid") ;
    console.log(userValid)

    if(userValid){

        const {email=null,password=null} = jwt.verify(userValid,"Secret")

        
        return {email:email,password:password}
        
    }

    else{
        res.status(400).json({body:"Not Signed or Logged In"})
    }
}


module.exports = checkUser;