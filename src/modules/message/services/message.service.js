import Message from "../../../db/models/message.model.js";
import User from "../../../db/models/user.model.js";

export const sendMessageService = async (req, res) => {
    const { body, owner } = req.body;
    //check if owner id is vaild 
    const user = await User.findById(owner);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const sendMessage = await Message.create({ body, owner });
    return res.status(200).json({ message: "Message Sent Successfully", sendMessage });
}

export const getMessagesService = async (req, res) => {
    const messages = await Message.find({}).populate(
        [
            {
                path: 'owner',
                select: '-password -__v'
            }
        ]);

    return res.status(200).json({ message: "Messages featched Successfully", messages });
}

export const getUserMessagesService = async (req, res) => {
    const { _id } = req.loggedInUser;
    const messages = await Message.find({ owner: _id });
    return res.status(200).json({ message: "Messages featched Successfully", messages });
}