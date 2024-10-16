import { useEffect, useState } from "react";
import {
  TETabs,
  TETabsContent,
  TETabsItem,
  TETabsPane,
} from "tw-elements-react";
import Cookies from "js-cookie";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

export default function Chat() {
  const [verticalActive, setVerticalActive] = useState();
  const [messages, setMessages] = useState([]);
  const [dataUserSHat, setDataUserSHat] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const newMs = useRef();
  const idParm = new URLSearchParams(location.search);
  const idT = Number(idParm.get("id"));

  const { t } = useTranslation();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let request = await axios.get(
          "https://yousab-tech.com/unihome/public/api/auth/chat/users",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDataUserSHat(request.data.data);
        if (request.data.data.length > 0) {
          setVerticalActive(request.data.data[0].id);
        }
      } catch (error) { }
    };
    fetchUsers();
  }, [token]);

  function sendMessage() {
    if (newMessage.trim()) {
      setNewMessage("");

      const sendMsgToAPI = async () => {
        try {
          await axios.post(
            "https://yousab-tech.com/unihome/public/api/auth/chat/store",
            {
              receiver_id: verticalActive,
              message: newMessage,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (error) {
          console.error(error);
        }
      };

      sendMsgToAPI();
    }
  }

  const handleVerticalClick = (value) => {
    if (value !== verticalActive) {
      setVerticalActive(value);
    }
  };

  useEffect(() => {
    if (verticalActive) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(
            `https://yousab-tech.com/unihome/public/api/auth/chats/${verticalActive}`,
            {
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setMessages(res.data.data.chats);
        } catch (error) { }
      };
      fetchMessages();
    }
  }, [verticalActive, newMessage, token]);

  useEffect(() => {
    if (messages.length === 0 && idT) {
      const sendNewMsgToAPI = async () => {
        try {
          await axios.post(
            "https://yousab-tech.com/unihome/public/api/auth/chat/store",
            {
              receiver_id: idT,
              message: "Hello",
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (error) {
          console.error(error);
        }
      };
      sendNewMsgToAPI();
    }
  }, [idT, messages.length, token]);

  // Filter users based on search query
  const filteredUsers = dataUserSHat.filter((user) =>
    user.firstname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Chat with a Teacher - UniHome</title>
        {/* Meta tags go here */}
      </Helmet>
      <h1 className="text-center text-6xl font-bold text-white my-6 relative">
        <span className="bg-gradient-to-r from-orange-500 to-blue-500 text-transparent bg-clip-text">{t('Chat')}</span>
        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-orange-500 to-blue-500"></span>
      </h1>
      <section className="py-6">
        <div className="flex flex-col md:flex-row bg-gradient-to-r from-orange-100 via-purple-100 to-indigo-200 shadow-xl rounded-xl p-4 gap-4">
          {/* Sidebar Section */}
          <div className="min-w-60 shadow-lg border-r border-gray-300 bg-white p-4 rounded-xl overflow-hidden">
            <h1 className="ps-2 text-6xl font-light font-[Jomhuria-R]">{t('Chat')}:</h1>
            <input
              type="search"
              placeholder={t("placeholerChatSearch")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-ghost focus:bg-gray-200 text-gray-800 focus:outline-none h-10 border border-gray-300 w-full mb-4 rounded-lg px-3 text-sm"
            />
            <div className="flex flex-col space-y-3">
              <TETabs ref={newMs} vertical className="w-full">
                {filteredUsers.map((e) => (
                  <TETabsItem
                    key={e.id}
                    onClick={() => handleVerticalClick(e.id)}
                    active={verticalActive === e.id}
                    className={`p-3 flex items-center rounded-lg cursor-pointer transition-all duration-200 transform ${verticalActive === e.id
                        ? "bg-orange-500 text-white shadow-md scale-105"
                        : "hover:bg-orange-100 hover:shadow-sm text-gray-700"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="chat-image avatar">
                        <div className="w-12 rounded-full border-2 border-orange-500">
                          <img alt="User Avatar" src={e.image} />
                        </div>
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{e.firstname}</h2>
                        <p className="text-sm text-gray-500 truncate">{e.messageSnippet}</p>
                      </div>
                    </div>
                  </TETabsItem>
                ))}
              </TETabs>
            </div>
          </div>

          {/* Main Chat Section */}
          <div className="w-full md:w-4/5 bg-white p-4 rounded-xl shadow-lg">
            <TETabsContent>
              {filteredUsers.map((response) => (
                <TETabsPane
                  key={response.id}
                  show={verticalActive === response.id}
                  className="h-full"
                >
                  <div className="flex flex-col justify-between h-full">
                    {/* Chat Header */}
                    <div className="border-b p-4 bg-orange-500 text-white flex items-center gap-4 rounded-t-lg shadow-sm">
                      <div className="chat-image avatar">
                        <div className="w-12 rounded-full border-2 border-white">
                          <img alt="User Avatar" src={response.image} />
                        </div>
                      </div>
                      <div>
                        <h2 className="font-bold text-xl">{response.firstname}</h2>
                        {/* <span className="text-sm opacity-80">{t("Online")}</span> */}
                      </div>
                    </div>

                    {/* Messages Section */}
                    <div className="p-5 flex-1 overflow-y-auto bg-gray-50 space-y-4">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"
                            }`}
                        >
                          <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                              <img
                                alt="Chat Avatar"
                                src={msg.sender_id === user.id ? user.image : response.image}
                              />
                            </div>
                          </div>
                          <div
                            className={`chat-bubble px-3 flex justify-center items-center rounded-lg shadow-sm ${msg.sender_id === user.id
                                ? "bg-orange-500 text-white shadow-md"
                                : "bg-gray-200 text-gray-800"
                              }`}
                          >
                            {msg.message}
                          </div>
                          <div className="chat-footer opacity-50 text-xs ml-2">
                            {msg.sender_id === user.id ? t("You") : response.firstname}
                            <time className="block">{msg.timestamp}</time>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-3 flex items-center gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="input input-bordered w-full focus:outline-none px-4 py-2 bg-gray-200 rounded-lg"
                        placeholder={t("type_message")}
                      />
                      <button
                        onClick={sendMessage}
                        className="btn btn-primary bg-gradient-to-r from-orange-500 to-purple-500 hover:from-purple-500 hover:to-orange-500 text-white rounded-2xl p-2"
                      >
                        {t("Send")}
                      </button>
                    </div>
                  </div>
                </TETabsPane>
              ))}
            </TETabsContent>
          </div>
        </div>
      </section>
    </>
  );
}
