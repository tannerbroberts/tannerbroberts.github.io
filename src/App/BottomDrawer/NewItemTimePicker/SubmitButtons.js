import React from "react";
import { Button, Stack } from "@mui/material";
import { useAppContext } from "../../App";

const SubmitButtons = () => {
  const { addToLibrary } = useAppContext();
  const handleSubmitNewItemTemplate = () => {
    addToLibrary("new item template");
  };
  return (
    <Stack direction={"row"} gap={"10px"} padding={"10px"}>
      <Button variant="contained" color="primary">
        Schedule
      </Button>
      <Button variant="contained" color="primary">
        Schedule from new template
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmitNewItemTemplate}
      >
        New Template (needs context)
      </Button>
    </Stack>
  );
};

export default SubmitButtons;
