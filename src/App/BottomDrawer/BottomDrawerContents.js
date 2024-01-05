import React from "react";
import { List } from "@mui/material";
import NameSection from "./NameSection";
import SubmitButtons from "./NewItemTimePicker/SubmitButtons";

export default function BottomDrawerContents() {
  return (
    <div style={{ minWidth: "50vw" }}>
        <List>
          <NameSection />
          <SubmitButtons />
        </List>
    </div>
  );
}
