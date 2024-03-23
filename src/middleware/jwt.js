const jwt = require('jsonwebtoken')
const {JWT_SECRET_KEY}=require('../config/config')

const jwtConfig = {
    sign(payload){
        const token = jwt.sign(payload, JWT_SECRET_KEY)
        return token

    },
    verifyUser(req, res, next){
      const authHeader = req.headers.authorization;
      
      try{
        if(authHeader){
            const [bearer,token] = authHeader.split(" ");;
              jwt.verify(token, JWT_SECRET_KEY, function (err, decoded) {
                if (err) {
                    res.status(401).send("You are not authorized");
                     
                }
                else {
                    req.user = decoded
                    // console.log(req.user)
                    next()
    
                }
            })
            }
            else{
                res.status(401).send("You are not authorized");


            }
        }
        catch(error){
            // console.log(err);
            res.status(520).send(error)
        }
        
    }
    ,
    authGuard(req, res){
        const authHeader = req.headers.authorization;
        
        try{
          if(authHeader){
              const [bearer,token] = authHeader.split(" ");;
                jwt.verify(token, JWT_SECRET_KEY, function (err, decoded) {
                  if (err) {
                      res.status(401).send("You are not Authorized");
                       
                  }
                  else {
                      req.user = decoded
                    //   console.log(req.user)
                      res.status(200).json({message:"User Authorized",role:decoded.role});
                   
      
                  }
              })
              }
              else{
                  res.status(401).send("You are not Authorized");
  
              }
          }
          catch(error){
             
              res.status(520).send(error)
          }
          
      },
      verifyAdmin(req, res, next){
        const authHeader = req.headers.authorization;
        
        try{
          if(authHeader){
              const [bearer,token] = authHeader.split(" ");;
                jwt.verify(token, JWT_SECRET_KEY, function (err, decoded) {
                  if (err) {
                      res.status(401).send("You are not authorized");
                       
                  }
                  else if(decoded.role !== 'admin'){
                    console.log(decoded.role)
                    res.status(401).send("You are not authorized");

                  }
                  else {
                      req.user = decoded
                      next()
      
                  }
              })
              }
              else{
                  res.status(401).send("You are not authorized");
  
  
              }
          }
          catch(error){
              // console.log(err);
              res.status(520).send(error)
          }
          
      }
      ,
}



module.exports = jwtConfig
