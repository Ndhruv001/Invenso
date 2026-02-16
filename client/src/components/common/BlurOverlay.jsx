import React from "react";
import { useHideScreenContext } from "@/context/HideScreenContext";

const BlurOverlay = () => {
  const { hideScreen } = useHideScreenContext();

  return (
    <div
      onClick={hideScreen}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "18px",
        fontWeight: 500,
        userSelect: "none",
        pointerEvents: "auto",
        transition: "backdrop-filter 0.2s ease, background-color 0.2s ease"
      }}
    >
      Click anywhere or press ESC to unhide
    </div>
  );
};

export default BlurOverlay;