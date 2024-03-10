const express=require('express');
const User = require('../modules/User');
const router=express.Router();
const {body,validationResult}=require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET="ayushi is the owner"
const fetchuser=require('../middleware/fetchuser')

//ROUTE 1 :
//Creating a User using POST "/api/auth/createUser" . doesn't require auth.
router.post('/createuser',[
   //express validation 
   body('name','invalid Name').isLength({min:3}),
   body('email','invalid email').isEmail(),
   body('password').isLength({min:5}),
],async (req,res)=>{
   let success=false;
   //if there is error then show status 400 with the error
   const error=validationResult(req);
   if(!error.isEmpty()){
      return res.status(400).json({success,error:error.array()});
   }

   //try catch so that if there is some error we can see.
   try {
      
   //verifying whether the email is unique
   let user=await User.findOne({email:req.body.email});
   if(user){
      return res.status(400).json({success,error:"Email ALready Exists"})
   }
   
   //hashing using bcrypt
   //defining salt
   const salt = await bcrypt.genSalt(10);
   //hashing the password
   const secPass=await bcrypt.hash(req.body.password,salt);
   user=await User.create({
      name:req.body.name,
      email:req.body.email,
      password:secPass,
   });

   //authethicate token jwt - json web token
   const data={
      user:{
         id:user.id
      }
   }
   success=true;
   const authtoken=jwt.sign(data,JWT_SECRET);
   console.log(authtoken);
   res.json({success,"authtoken":authtoken});
} catch (error) {
      console.error(error.message);
      res.status(500).send(success,'Internal Server Error');
}
})

//ROUTE 2
//Authenticating the user : POST "/api.auth/login". -> NO LOGIN REQUIRED

router.post('/login',[
   body('email','Enter a valid email').isEmail(),
   body('password','Password cannot be blank').exists(),
],async (req,res) =>{
   let success=false;

   //if error, show error
   const error=validationResult(req);
   if(!error.isEmpty()){
      return res.status(400).json({error:error.array()});
   }

   const {email,password} = req.body;

   try {
      let user = await User.findOne({email});
      if(!user){
         success=false;
         return res.status(400).json({success,error:"Please login with correct credentials"})
      }

      const passwordCompare = await bcrypt.compare(password,user.password);

      if(!passwordCompare){
         success=false;
         return res.status(400).json({success,error:"Please login with correct credentials"})
      }

      const data={
         user:{
            id:user.id
         }
      }
      const authtoken=jwt.sign(data,JWT_SECRET);
      success=true;
      res.json({success,authtoken});

   } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
   }
})

//ROUTE 3: Get loggedin User Details using : POST "api/auth/getUser". Login Required


router.post('/getuser' ,fetchuser, async (req,res) =>{
try {
   userId=req.user.id
   const user = await User.findById(userId).select("-password")
   res.send(user)
} catch (error) {
    console.error(error.message);
      res.status(500).send('Internal Server Error');
}

})

module.exports=router