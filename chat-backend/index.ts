import expressWs from "express-ws";
import express from "express";
import cors from "cors";
import { WebSocket } from 'ws';
import { Client, IncomingMessage } from "./types";
import User from "./models/User";
import mongoose, { ObjectId } from "mongoose";
import config from "./config";

const connectedClients:WebSocket[] = [];

const app = express();
const port = 8000;

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

expressWs(app);

app.use(cors());

const router = express.Router();

router.ws('/chat',  (ws, req) => {
    console.log('Client connected');
    connectedClients.push(ws);
    
    let username = 'Anonimous';
    let id = '';
    
    ws.on('message', async(message)=>{
        try{
            const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;
            if (decodedMessage.type === 'LOGIN') {
                const token = decodedMessage.payload;
                console.log(decodedMessage);
                const user = await User.findOne({token});
                console.log('user = ' + user);
                
                if (user) {
                    id = String(user._id);
                    username = user.username; 
                }
            }else if(decodedMessage.type === 'SET_MESSAGE'){
                if (id === null) {
                    
                }
                const user = await User.findById(id);
                if (user) {
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
