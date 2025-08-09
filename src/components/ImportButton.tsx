import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState, useCallback } from "react";
import { useAppDispatch } from "../reducerContexts";
import { ItemFactory, ItemJSON } from "../functions/utils/item/index";

export default function ImportButton() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const appDispatch = useAppDispatch();

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleImport = useCallback(() => {
    try {
      const parsedData = JSON.parse(inputValue);

      const isValidItemJSON = (data: unknown): data is ItemJSON => {
        return (
          data !== null &&
          typeof data === "object" &&
          "id" in data && typeof (data as { id: unknown }).id === "string" &&
          "name" in data && typeof (data as { name: unknown }).name === "string" &&
          "duration" in data && typeof (data as { duration: unknown }).duration === "number" &&
          Array.isArray((data as unknown as { children: unknown }).children) &&
          Array.isArray((data as unknown as { parents: unknown }).parents) &&
          "showChildren" in data && typeof (data as { showChildren: unknown }).showChildren === "boolean"
        );
      };

      const itemsToImport = Array.isArray(parsedData) ? parsedData : [parsedData];

      if (!itemsToImport.every(isValidItemJSON)) {
        throw new Error("Invalid JSON structure.");
      }

      const newItems = itemsToImport.map(ItemFactory.fromJSON);

      appDispatch({
        type: "BATCH",
        payload: newItems.map(newItem => ({
          type: "CREATE_ITEM" as const,
          payload: { newItem },
        })),
      });

      setInputValue("");
      handleClose();
      alert(`Successfully imported ${newItems.length} item(s). Data is automatically saved to localStorage.`);
    } catch {
      alert("Invalid JSON input. Please check your data.");
    }
  }, [inputValue, appDispatch, handleClose]);

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
