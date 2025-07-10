import { Button } from "@mui/material";
import { useCallback } from "react";
import { useAppState } from "../reducerContexts/App";
import { Item } from "../functions/utils/item";

export default function ExportButton() {
  const { items } = useAppState();

  const exportItems = useCallback(() => {
    const itemsJSON = Item.toJSONArray(items);
    const jsonString = JSON.stringify(itemsJSON, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "about-time-items.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [items]);

  return (
    <Button variant="contained" onClick={exportItems}>
      EXPORT
    </Button>
  );
}
