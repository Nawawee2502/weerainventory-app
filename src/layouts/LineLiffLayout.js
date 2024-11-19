import React, { useEffect } from "react";
import liff from "@line/liff";

const LineLiffLayout = ({ children }) => {
  useEffect(async () => {
    await liff.init({ liffId: "2006454877-A8GOwb1j" });
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      // console.log(profile);
      
    } else {
      liff.login();
    }
  }, []);

  return (
    <div className="line-liff-layout">
      <main>{children}</main>
    </div>
  );
};

export default LineLiffLayout;
