import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import './Messenger.scss'
import Conversation from "../components/conversations";
import { useNavigate, useParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import Header from "../../components/Layout/Header/Header";
import { ApiGetUserByUserId } from "../../Service/ApiService/ApiUser";
import { ApiGetMessageByConversationId, ApiSendMessage, getConversationApi } from "../../Service/ApiService/ApiMessage";
import { toast } from "react-toastify";
import { useSocket } from "../../SocketContext";

const Messenger = () => {
  const { conversationId } = useParams();
  const { socket } = useSocket();

  const user = useSelector(state => state.user);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);

  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [receiver, setReceiver] = useState(null);

  const scrollRef = useRef();
  const navigate = useNavigate();

  // 🟦 Lấy receiver
  useEffect(() => {
    const fetchReceiver = async () => {
      if (currentChat) {
        const friendId = currentChat.members.find((m) => m !== user.account.id);
        if (friendId) {
          const res = await ApiGetUserByUserId(friendId);
          setReceiver(res);
        }
      }
    };
    fetchReceiver();
  }, [currentChat, user.account.id]);

  // 🟦 Lấy danh sách conversation
  useEffect(() => {
    const getConversations = async () => {
      try {
        let response = await getConversationApi();
        setConversations(response);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, []);

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    const matched = conversations.find((c) => c._id === conversationId);
    if (matched) setCurrentChat(matched);
  }, [conversationId, conversations]);

  useEffect(() => {
    if (!currentChat) return;

    const getMessages = async () => {
      try {
        let response = await ApiGetMessageByConversationId(currentChat._id);
        setMessages(response);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
        conversationId: data.conversationId,
        textPreview: data.text
      });
    });

    return () => socket.off("getMessage");
  }, [socket]);

  useEffect(() => {
    if (!arrivalMessage) return;

    if (currentChat && arrivalMessage.conversationId === currentChat._id) {
      setMessages((prev) => [...prev, arrivalMessage]);
    } else {
      toast.info(`💬 Tin nhắn mới: "${arrivalMessage.textPreview}"`);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on("messageSeen", ({ conversationId }) => {
      if (currentChat && currentChat._id === conversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.sender._id === user.account.id
              ? { ...msg, seen: true }
              : msg
          )
        );
      }
    });

    return () => socket.off("messageSeen");
  }, [socket, currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const receiverId = currentChat.members.find(
      (member) => member !== user.account.id
    );

    socket.emit("sendMessage", {
      senderId: user.account.id,
      receiverId,
      text: newMessage,
      conversationId: currentChat._id,
    });

    // 🔥 Gửi vào DB
    try {
      const data = await ApiSendMessage(receiverId, newMessage, currentChat._id);

      const newMsg = {
        ...data,
        sender: { _id: user.account.id, image: user.account.image },
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
    } catch (err) {
      console.error("Lỗi gửi tin:", err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/signin");
  }, [isAuthenticated]);

  return (
    <>
      <Header />
      <div className="messenger">
        {/* LEFT */}
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input placeholder="Search for friends" className="chatMenuInput" />
            {conversations.map((c) => (
              <div key={c._id} onClick={() => navigate(`/messenger/${c._id}`)}>
                <Conversation conversation={c} currentUser={user.account} />
              </div>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <ChatBox
          currentChat={currentChat}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSubmit={handleSubmit}
          scrollRef={scrollRef}
          user={user}
          receiver={receiver}
        />

        {/* RIGHT */}
        <div className="chatOnline"></div>
      </div>
    </>
  );
};

export default Messenger;
