import { useEffect, useState } from "react";
import {
  startBackendWS,
  subscribeTokens,
  initSocketClient,
} from "../services/angelServices/angelWebsocketClient";

export default function AngelLive() {
  const [user, setUser] = useState(null);
  const [angel, setAngel] = useState(null);

  // 1️⃣ Load data from localStorage
  useEffect(() => {
    try {
      const authUserRaw = localStorage.getItem("auth_user");
      const angelTokenRaw = localStorage.getItem("angel_tokenData");

      if (authUserRaw) {
        setUser(JSON.parse(authUserRaw));
      }

      if (angelTokenRaw) {
        setAngel(JSON.parse(angelTokenRaw));
      }
    } catch (err) {
      console.error("Failed to load auth data", err);
    }
  }, []);

  // 2️⃣ Init Socket.IO once user is available
  useEffect(() => {
    if (!user?.id) return;

    initSocketClient(user.id, (tick) => {
      console.log("📊 LIVE TICK:", tick);
    });
  }, [user?.id]);

  // 3️⃣ Guard UI
  if (!user || !angel) {
    return <div>Loading user...</div>;
  }

  // 4️⃣ Connect backend → Angel WS
  const connectWS = async () => {
    try {
      console.log("🚀 Connecting with angel data:", angel);

      const res = await startBackendWS({
        apiKey: angel.apiKey,         // Angel API Key
        jwtToken: angel.jwtToken,     // Angel JWT
        feedToken: angel.feedToken,   // Angel Feed Token
        clientCode: angel.clientCode, // Angel Client Code (string)
      });

      console.log("✅ Angel WS connect response:", res);
    } catch (err) {
      console.error("❌ Angel WS connect failed:", err);
    }
  };

  // 5️⃣ Subscribe to token
  const subscribe = async () => {
    try {
      const res = await subscribeTokens({
        correlationID: "sbin-test",
        action: 1,          // subscribe
        mode: 1,            // LTP
        exchangeType: 1,    // NSE
        tokens: ["3045"],   // SBIN
      });

      console.log("✅ Subscription response:", res);
    } catch (err) {
      console.error("❌ Subscription failed:", err);
    }
  };

  return (
    <div>
      <h3>Angel Live Market</h3>

      <button onClick={connectWS}>
        Connect Angel WS
      </button>

      <button onClick={subscribe}>
        Subscribe SBIN
      </button>
    </div>
  );
}
