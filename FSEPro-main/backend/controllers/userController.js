import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Simple in-memory fallback store used when MongoDB isn't connected
const inMemoryUsers = [];

export const registerControllers = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }) 
        }

        let user = await User.findOne({email});

        if(user){
            return res.status(409).json({
                success: false,
                message: "User already Exists",
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        // If DB not connected, use in-memory fallback
        if (mongoose.connection.readyState !== 1) {
            const fakeUser = { _id: Date.now().toString(), name, email, password: hashedPassword };
            inMemoryUsers.push(fakeUser);

            return res.status(200).json({
                success: true,
                message: "User Created Successfully (in-memory)",
                user: fakeUser,
            });
        }

        let newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.status(200).json({
            success: true,
            message: "User Created Successfully",
            user: newUser,
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }

}

export const loginControllers = async (req, res, next) => {
    try{
        console.log('Login request received:', req.body?.email);
        const { email, password } = req.body;
  
        if (!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }); 
        }
    
        // If DB not connected, check in-memory store
        if (mongoose.connection.readyState !== 1) {
            const inUser = inMemoryUsers.find((u) => u.email === email);
            console.log('Using in-memory user store, found:', !!inUser);
            if (!inUser) {
                return res.status(401).json({ success: false, message: "User not found (in-memory)" });
            }

            const isMatch = await bcrypt.compare(password, inUser.password);
            if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect Email or Password" });

            const safeUser = { ...inUser };
            delete safeUser.password;
            return res.status(200).json({ success: true, message: `Welcome back, ${safeUser.name}`, user: safeUser });
        }

        const user = await User.findOne({ email });

        console.log('User lookup result:', !!user);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect Email or Password" });
        }

        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;

        return res.status(200).json({ success: true, message: `Welcome back, ${userObj.name}`, user: userObj });

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const setAvatarController = async (req, res, next)=> {
    try{

        const userId = req.params.id;
       
        const imageData = req.body.image;
      
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage: imageData,
        },
        { new: true });

        return res.status(200).json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
          });


    }catch(err){
        next(err);
    }
}

export const allUsers = async (req, res, next) => {
    try{
        const user = await User.find({_id: {$ne: req.params.id}}).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);

        return res.json(user);
    }
    catch(err){
        next(err);
    }
}