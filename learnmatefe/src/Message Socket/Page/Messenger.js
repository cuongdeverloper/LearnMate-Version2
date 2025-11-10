import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import './Messenger.scss'
import Conversation from "../components/conversations";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom"
import ChatBox from "./ChatBox";
import { useParams } from "react-router-dom";
import Header from "../../components/Layout/Header/Header";
import { ApiGetUserByUserId } from "../../Service/ApiService/ApiUser";
import { ApiGetMessageByConversationId, ApiSendMessage, getConversationApi } from "../../Service/ApiService/ApiMessage";


const Messenger = () => {
  const { conversationId } = useParams();

  const user = useSelector(state => state.user);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef();
  const scrollRef = useRef();
  const isAuthenticated = useSelector(user => user.user.isAuthenticated);
  const [receiver, setReceiver] = useState(null);
  useEffect(() => {
    const fetchReceiver = async () => {
      if (currentChat) {
        const friendId = currentChat.members.find((m) => m !== user.account.id);
        if (friendId) {
          try {
            const res = await ApiGetUserByUserId(friendId);
            setReceiver(res);
          } catch (err) {
            console.error("Failed to fetch receiver:", err);
          }
        }
      }
    };
    fetchReceiver();
  }, [currentChat, user.account.id]);
  const navigate = useNavigate();
  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    const matched = conversations.find((c) => c._id === conversationId);
    if (matched) {
      setCurrentChat(matched);
    }
  }, [conversationId, conversations]);



  useEffect(() => {
    socket.current = io("http://localhost:6060", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
        conversationId: data.conversationId,
      });
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);


  useEffect(() => {
    if (!arrivalMessage) return;

    if (currentChat && arrivalMessage.conversationId === currentChat._id) {
      setMessages((prev) => [...prev, arrivalMessage]);
    } else {
      console.log("Tin nhắn đến nhưng khác conversation:", arrivalMessage);
    }
  }, [arrivalMessage, currentChat]);



  useEffect(() => {
    socket.current.emit("addUser", user.account.id);
    socket.current.on("getUsers", (users) => {
      if (Array.isArray(user.followings)) {
        setOnlineUsers(
          user.followings.filter((f) => users.some((u) => u.userId === f))
        );
      }
    });
  }, [user]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage || newMessage.trim() === "") {
      return;
    }

    const receiverId = currentChat.members.find(
      (member) => member !== user.account.id
    );

    socket.current.emit("sendMessage", {
      senderId: user.account.id,
      receiverId,
      text: newMessage,
      conversationId: currentChat._id,
    });

    try {
      const data = await ApiSendMessage(receiverId, newMessage, currentChat._id);

      const newMsg = {
        ...data,
        sender: { _id: user.account.id, image: user.account.image },
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);
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
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    socket.current.on("messageSeen", ({ conversationId }) => {
      if (currentChat && currentChat._id === conversationId) {
        // Cập nhật trạng thái tất cả các tin nhắn là seen
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.sender._id === user.account.id ? { ...msg, seen: true } : msg
          )
        );
      }
    });
  }, [currentChat]);

  return (
    <>
      {/* <Topbar /> */}
      <Header />
      <div className="messenger" >
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input placeholder="Search for friends" className="chatMenuInput" />
            {conversations && Array.isArray(conversations) ? conversations.map((c) => (
              <div key={c._id} onClick={() => navigate(`/messenger/${c._id}`)}>
                <Conversation conversation={c} currentUser={user.account} />
              </div>
            )) : <p>Loading conversations...</p>}


          </div>
        </div>
        <ChatBox
          currentChat={currentChat}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSubmit={handleSubmit}
          scrollRef={scrollRef}
          user={user}
          receiver={receiver}
          socket={socket}
        />

        <div className="chatOnline">
        </div>
      </div>
    </>
  )
}
export default Messenger