import axios from "axios";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import SupportIcon from "./components/SupportIcon";
import { Outlet, useLocation } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NetworkStatus from "./components/NetworkStatus/NetworkStatus";

export const apiWallet = createContext(null);

export default function App() {
  // ****************disabeled inspect****************
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    // Disable certain key combinations
    const handleKeyDown = (event) => {
      const key = event.key || event.keyCode;

      if (key === "F12" || key === 123) {
        // Disable F12 for Developer Tools
        event.preventDefault();
      } else if ((event.ctrlKey && event.shiftKey && key === "I") ||
        (event.ctrlKey && event.shiftKey && key === "J")) {
        // Disable Ctrl+Shift+I and Ctrl+Shift+J
        event.preventDefault();
      }
    };

    // Add event listeners
    window.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listeners on component unmount
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  // ****************End Code****************

  const { i18n } = useTranslation();
  const storedLanguage = JSON.parse(localStorage.getItem("lang")) || "en";
  const currentLanguage = i18n.language;

  useEffect(() => {
    const direction = i18n.dir(currentLanguage);
    document.body.setAttribute("dir", direction);
  }, [currentLanguage, i18n]);

  useEffect(() => {
    if (storedLanguage !== currentLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, [storedLanguage, currentLanguage, i18n]);

  const [dataUse, setDataUse] = useState([]);
  const [refAPI, setRefAPI] = useState([]);
  const [userTable, setUserTable] = useState();
  const loc = useLocation();

  const fetchDataWithDelay = async (fn, delay) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return fn();
  };

  const usersData = async () => {
    try {
      let userTable = await axios.get("https://yousab-tech.com/unihome/public/api/teachers");
      setUserTable(userTable.data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
  };

  useEffect(() => {
    fetchDataWithDelay(usersData, 1000); // 1 second delay
  }, []);

  const token = localStorage.getItem("accessToken");

  async function ReToken() {
    const intervalId = setInterval(async () => {
      if (token) {
        try {
          const res = await axios.post(
            "https://yousab-tech.com/unihome/public/api/auth/refresh",
            {},
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Save new access token in localStorage
          localStorage.setItem("accessToken", res.data.access_token);
          setRefAPI(res.data.access_token);
        } catch (error) {
          console.log("Error refreshing token:", error);
        }
      }
    }, 660000); // Refresh every 11 minutes

    return intervalId; // Return the interval ID to clear it later if needed
  }

  useEffect(() => {

    let intervalId;

    if (token) {
      intervalId = ReToken(); // Start the interval if there's a token
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Clear the interval on component unmount or if token changes
      }
    };
  }, [token, loc.pathname]);

  useEffect(() => {
    if (refAPI !== null) {
      const getWalletData = async () => {
        try {
          const res = await axios.get("https://yousab-tech.com/unihome/public/api/auth/wallets", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          setDataUse(res.data.data.wallets);
        } catch (error) {
          console.log("Error fetching wallet data:", error);
        }
      };

      fetchDataWithDelay(getWalletData, 1000); // 1 second delay
    }
  }, [loc.pathname, refAPI]);

  return (
    <apiWallet.Provider value={{ dataUse, setDataUse, userTable, setUserTable }}>
      <div>
        {token ? (
          <div className="m-auto">
            <NavBar showLink4={false} showLink1={true} />
          </div>
        ) : (
          <div className="m-auto">
            <NavBar showLink4={true} showLink1={false} />
          </div>
        )}
        <main className="min-h-screen w-full pt-24 bg-[#eee]">
          <Outlet />
        </main>
        <SupportIcon />
        <NetworkStatus />
        <Footer />
      </div>
    </apiWallet.Provider>
  );
}
