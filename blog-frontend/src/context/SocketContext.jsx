"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8007";

    const socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("[Socket.io] Connected to server:", socketInstance.id);
      if (user?._id || user?.id) {
        socketInstance.emit("register_user", user._id || user.id);
      }
    });

    // Global listener for new blog posts published
    socketInstance.on("new_post", (data) => {
      toast.info(` ${data.message || "A new post was published!"}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    // Global listener for new comments
    socketInstance.on("new_comment", (data) => {
      toast.info(` ${data.message || "New comment posted!"}`, {
        position: "top-right",
        autoClose: 4000,
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
