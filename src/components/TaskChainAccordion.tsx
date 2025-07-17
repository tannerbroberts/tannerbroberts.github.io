import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ItemAccordion from "./ItemAccordion";
import { Item } from "../functions/utils/item";

interface TaskChainAccordionProps {
  readonly taskChain: Item[];
  readonly showMoveDeleteButtons?: boolean;
}

export default function TaskChainAccordion({
  taskChain,
  showMoveDeleteButtons = false
}: TaskChainAccordionProps) {

  // Find the deepest item in the chain
  const deepestItem = useMemo(() => {
    return taskChain.length > 0 ? taskChain[taskChain.length - 1] : null;
  }, [taskChain]);

  if (taskChain.length === 0) {
    return (
      <Box sx={{
        width: '100%',
        p: 2,
        textAlign: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: '#f5f5f5'
      }}>
        <Typography variant="h6" color="text.secondary">
          No Active Task Chain
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No tasks are currently scheduled for execution
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Task Hierarchy ({taskChain.length} level{taskChain.length > 1 ? 's' : ''})
      </Typography>

      {taskChain.map((item, index) => {
        const isDeepest = deepestItem?.id === item.id;

        return (
          <Box key={item.id} sx={{
            ml: index * 2, // Indent nested items
            mb: 1
          }}>
            <ItemAccordion
              item={item}
              taskChain={taskChain}
              isDeepest={isDeepest}
              showMoveDeleteButtons={showMoveDeleteButtons}
            />
          </Box>
        );
      })}
    </Box>
  );
}
