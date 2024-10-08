import expressWs from "express-ws";
import express from "express";
import cors from "cors";
import { WebSocket } from 'ws';
import { Client, IncomingMessage } from "./types";
import User from "./models/User";
import mongoose, { ObjectId } from "mongoose";
import config from "./config";
import Message from "./models/Message";
import { log } from "console";

const connectedClients:WebSocket[] = [];

const app = express();
const port = 8000;

app.use(cors());

const router = express.Router();
expressWs(app);
router.ws('/chat',  (ws, req) => {
    console.log('Client connected');
    connectedClients.push(ws);
    
    let username = 'Anonimous';
    let id = '';
    
    ws.on('message', async(message)=>{
        try{
            const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;
            if (decodedMessage.type === 'REGISTER') {
                const userMutation = {
                    username: decodedMessage.payload,
                }
                const user = new User(userMutation);
                user.generateToken();
                
                if (user) {
                    console.log(user);
                    await user.save();
                    id = String(user._id);
                    username = user.username; 
                }
            }
            if (decodedMessage.type === 'LOGIN') {
                const token = decodedMessage.payload;
                const user = await User.findOne({token});
                
                if (user) {
                    id = String(user._id);
                    username = user.username; 
                }
                
            }
            if (decodedMessage.type === 'LOGOUT') {
                id = '';
                username = 'Anonimous'; 
            }
            else if(decodedMessage.type === 'SET_MESSAGE'){
                if (id === null) {
                    
                }
                const user = await User.findById(id);
                if (user) {
                    const messageMutation = {
                        user: user._id,
                        text: decodedMessage.payload,
                    }
                    await new Message(messageMutation);
                    connectedClients.forEach((clientWs)=>{
                        clientWs.send(JSON.stringify({
                            type: 'NEW_MESSAGE',
                            
                            payload: {
                                username,
                                message: decodedMessage.payload,
                            }
                        }));
                    })
                }
            }
        }catch(e){
            ws.send(JSON.stringify({error: 'Invalid message'}))
        }
    })
    
    ws.on('close', ()=>{
        console.log('client disconnected');
        const index = connectedClients.indexOf(ws);
        connectedClients.splice(index, 1)
    })
});

app.use(router);
    
const run = async()=>{
    await mongoose.connect(config.database);
    app.listen(port, ()=>{
        console.log(`Server started on ${port} port!`);
    })

    process.on('exit', ()=>{
        mongoose.disconnect();
    });
}

run().catch(console.error);