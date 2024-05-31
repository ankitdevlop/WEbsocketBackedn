const express =require("express");
const { login, signup } = require("./auth");

const router= express.Router();

router.get("/",(req,res)=>{
res.send ("This is the Code and this is Working")
})

router.use('/login',login)
router.use('/signup',signup)

module.exports=router;