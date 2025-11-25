import React, { useEffect, useState } from "react";

export const UseNetworkstatus = () => {
  const [isOnline, setisOnline] = useState<boolean>(true);
  const updateNetworkStatus = () => {
    setisOnline(navigator.onLine);
  };
  useEffect(() => {
    updateNetworkStatus();
    return () => {};
  }, []);
  useEffect(() => {
    window.addEventListener("load", updateNetworkStatus);
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);
    return () => {
      window.removeEventListener("load", updateNetworkStatus);
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);
  return { isOnline };
};
