import jwt from "jsonwebtoken"

export const generateToken=(userId)=>{
    const token=jwt.sign({id:userId},process.env.JWT_SECRET,{
        expiresIn:"1d"
    })
    return token;
}