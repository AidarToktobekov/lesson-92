// import User from "../models/User";
// import mongoose from 'mongoose';
// import { Router } from 'express';

// const userRouter = Router();

// userRouter.post('/', async (req, res, next) => {
//     try{
//         const userMutation = {
//             username: req.body.username,
//             password: req.body.password,
//         };

//         const user = new User(userMutation);

//         user.generateToken();
//         await user.save();
//         return res.send(user);
//     } catch (error) {
//         if (error instanceof mongoose.Error.ValidationError) {
//             return res.status(400).send(error);
//         }

//         return next(error);
//     }
// });

// userRouter.post('/sessions', async (req, res, next) => {
//     try {
//         const user = await User.findOne({username: req.body.username});
        
//         if (!user) {
//             return res.status(400).send({error: 'Username not found!'});
//         }
        
//         const isMatch = await user.checkPassword(req.body.password);
        
//         if (!isMatch) {
//             return res.status(400).send({error: 'Password is wrong!'});
//         }
        
//         user.generateToken();
//         await user.save();
        
//         return res.send(user);
//     } catch (error) {
//         return next(error);
//     }
// });


// userRouter.delete('/sessions', async (req, res, next) => {
//     try {
//       const headerValue = req.get('Authorization');
  
//       if (!headerValue) return res.status(204).send();
  
//       const [_bearer, token] = headerValue.split(' ');
  
//       if (!token) return res.status(204).send();
  
//       const user = await User.findOne({token});
  
//       if (!user) return res.status(204).send();
  
//       user.generateToken();
//       await user.save();
  
//       return res.status(204).send();
//     } catch (error) {
//       return next(error);
//     }
//   });

// export default userRouter;