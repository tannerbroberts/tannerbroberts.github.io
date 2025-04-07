import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState, useCallback } from "react";
import { useAppDispatch } from "../reducerContexts/App";
import { Item, ItemJSON } from "../functions/utils/item";

export default function ImportButton() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const appDispatch = useAppDispatch();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleImport = useCallback(() => {
    try {
      const parsedData = JSON.parse(inputValue);

      const isValidItemJSON = (data: any): data is ItemJSON => {
        return (
          typeof data.id === "string" &&
          typeof data.name === "string" &&
          typeof data.duration === "number" &&
          Array.isArray(data.children) &&
          Array.isArray(data.parents) &&
          typeof data.showChildren === "boolean"
        );
      };

      const itemsToImport = Array.isArray(parsedData) ? parsedData : [parsedData];

      if (!itemsToImport.every(isValidItemJSON)) {
        throw new Error("Invalid JSON structure.");
      }

      const newItems = itemsToImport.map(Item.fromJSON);

      appDispatch({
        type: "BATCH",
        payload: newItems.map(newItem => ({
          type: "CREATE_ITEM" as const,
          payload: { newItem },
        })),
      });

      handleClose();
    } catch (error) {
      alert("Invalid JSON input. Please check your data.");
    }
  }, [inputValue, appDispatch]);

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        IMPORT
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Import Items</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            rows={10}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste Item JSON or Item JSON Array here"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleImport} variant="contained">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
