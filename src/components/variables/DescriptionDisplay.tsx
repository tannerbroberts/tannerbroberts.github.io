import LinkedDescription from './LinkedDescription';
import { useAppState } from '../../reducerContexts/App';

interface DescriptionDisplayProps {
  description: string;
  maxLines?: number;
  searchTerm?: string;
  onVariableClick?: (definitionId: string) => void;
  showExpandToggle?: boolean;
  compact?: boolean;
  showValidation?: boolean;
}

const DEFAULT_MAX_LINES = 3;

export default function DescriptionDisplay({
  description,
  maxLines = DEFAULT_MAX_LINES,
  searchTerm,
  onVariableClick,
  showExpandToggle = true,
  compact = false,
  showValidation = true
}: Readonly<DescriptionDisplayProps>) {
  const { variableDefinitions } = useAppState();

  // Use the new LinkedDescription component which handles all the formatting
  return (
    <LinkedDescription
      description={description}
      variableDefinitions={variableDefinitions}
      onVariableClick={onVariableClick}
      maxLines={maxLines}
      showValidation={showValidation}
      showExpandToggle={showExpandToggle}
      compact={compact}
      searchTerm={searchTerm}
    />
  );
}
