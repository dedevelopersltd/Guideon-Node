import Messages from "../../models/users/messages.js";
import User from "../../models/users/user.js";

export const createMessage = async (req, res, next) => {
  const { from, to, message, files } = req.body;
  try {
    const data = await Messages.create({
      message: { text: message, files: files, read: false },
      users: [from, to],
      sender: from,
      recipient: to,
    });

    await Messages.updateMany(
      {
        $and: [
          {
            users: { $all: [from, to] },
          },
          { sender: to },
        ],
      },
      {
        $set: { "message.read": true },
      }
    );

    if (data) {
      await User.updateOne({ _id: from }, { $addToSet: { UserChats: to } });

      await User.updateOne({ _id: to }, { $addToSet: { UserChats: from } });

      return res.json({ msg: "Message added successfully" });
    }
    return res.json({ msg: "Failed to add message" });
  } catch (ex) {
    next(ex);
  }
};

export const getAllMessages = async (req, res, next) => {
  const { from, to } = req.body;

  try {
    const allMessages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ createdAt: 1 });
    const allFiles = allMessages.map((msg) => msg.message.files);
    const allFilesFlat = allFiles.flat();
    const allFilesUnique = allFilesFlat.filter(
      (value, index, self) => self.indexOf(value) === index
    );

    const projectedMessages = allMessages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        read: msg.message.read,
        files: msg.message.files,
        msgTime: msg.createdAt,
        
      };
    });


    return res.json({projectedMessages, allFilesUnique});
  } catch (ex) {
    next(ex);
  }
};

export const getUnreadMessages = async (req, res, next) => {
  const { userId } = req.user;
  try {
    const unreadMessages = await Messages.find({ to: userId, read: false });
    res.status(200).json(unreadMessages);
  } catch (error) {
    next(error);
  }
};

export const markAllMessagesAsRead = async (req, res, next) => {
  const { userId } = req.user;
  const { otherUserId } = req.body;

  try {
    const result = await Messages.updateMany(
      {
        users: { $all: [userId, otherUserId] },
        "message.read": false,
        sender: otherUserId,
      },
      { $set: { "message.read": true } }
    );

    res
      .status(200)
      .json({ success: true, message: "All messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    next(error);
  }
};

export const clearChatWithUser = async (req, res, next) => {
  const { userId } = req.user;
  const { otherUserId } = req.body;
  try {
    await Messages.deleteMany({ users: { $all: [userId, otherUserId] } });
    res
      .status(200)
      .json({ success: true, message: "Chat with user cleared successfully" });
  } catch (error) {
    next(error);
  }
};

export const fetchAllRecentChats = async (req, res) => {
  try {
    const { userId } = req.user;
    const messages = await Messages.find({ users: userId }).sort({
      createdAt: -1,
    });
    const newUser = User.findById(userId).populate("chats");
    res.status(200).json({ newUser, userId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
