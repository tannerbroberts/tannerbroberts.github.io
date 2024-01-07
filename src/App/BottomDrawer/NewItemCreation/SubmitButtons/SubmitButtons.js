import React from "react";
import { Button, Stack } from "@mui/material";
import NewTemplateButton from "./NewTemplateButton";

const SubmitButtons = () => {
  return (
    <Stack
      direction={"row"}
      gap={"10px"}
      padding="10px"
      justifyContent={"space-between"}
    >
      <Button disabled variant="contained" color="primary">
        Schedule
      </Button>
      <Button disabled variant="contained" color="primary">
        Do Both
      </Button>
      <NewTemplateButton />
    </Stack>
  );
};

export default SubmitButtons;
