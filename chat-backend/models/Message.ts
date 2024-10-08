import mongoose, { Types } from "mongoose";
import User from "./User";

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        validate: {
            validator: async(value: Types.ObjectId)=>{
                const user = await User.findById(value);
                return Boolean(user);
            },
            message: 'User not found',
        }
    },
    text: {
        type: String,
        required: true,
    }
});

export default MessageSchema;