import { useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import { TrendingUp, TrendingDown, Balance } from '@mui/icons-material';
import { useAppState } from '../../reducerContexts/App';
import { ItemInstance } from '../../functions/utils/item/index';
import { getItemById } from '../../functions/utils/item/utils';

interface VariableAccountingSummaryProps {
  readonly instances: ItemInstance[];
}

export default function VariableAccountingSummary({ instances }: VariableAccountingSummaryProps) {
  const { items } = useAppState();

  // Calculate overall variable impact from all incomplete instances
  const variableImpact = useMemo(() => {
    const totalImpact: Record<string, number> = {};

    for (const instance of instances) {
      const item = getItemById(items, instance.itemId);
      if (!item) continue;

      // Get variable summary for this item (including children)
      // This would need to be calculated without the hook since we're in a loop
      // For now, we'll use a simplified approach

      // Note: In a real implementation, you'd need to calculate the variable summary
      // for each item without using the hook in a loop
    }

    return totalImpact;
  }, [instances, items]);

  // Group variables by positive/negative impact
  const { positiveVariables, negativeVariables, netImpact } = useMemo(() => {
    const positive: Array<{ name: string; quantity: number }> = [];
    const negative: Array<{ name: string; quantity: number }> = [];
    let netPositive = 0;
    let netNegative = 0;

    Object.entries(variableImpact).forEach(([name, quantity]) => {
      if (quantity > 0) {
        positive.push({ name, quantity });
        netPositive += quantity;
      } else if (quantity < 0) {
        negative.push({ name, quantity: Math.abs(quantity) });
        netNegative += Math.abs(quantity);
      }
    });

    return {
      positiveVariables: positive,
      negativeVariables: negative,
      netImpact: { netPositive, netNegative }
    };
  }, [variableImpact]);

  if (positiveVariables.length === 0 && negativeVariables.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Balance color="primary" />
          <Typography variant="h6">
            Variable Accounting Summary
          </Typography>
          <Chip
            label={`${instances.length} instances`}
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Expected resource impact from completing all incomplete instances:
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Resource Consumption */}
          {negativeVariables.length > 0 && (
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingDown color="error" />
                <Typography variant="subtitle2" color="error.main">
                  Resources Consumed
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {negativeVariables.map(({ name, quantity }) => (
                  <Chip
                    key={name}
                    label={`${quantity} ${name}`}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Divider */}
          {negativeVariables.length > 0 && positiveVariables.length > 0 && (
            <Divider orientation="vertical" flexItem />
          )}

          {/* Resource Production */}
          {positiveVariables.length > 0 && (
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp color="success" />
                <Typography variant="subtitle2" color="success.main">
                  Resources Produced
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {positiveVariables.map(({ name, quantity }) => (
                  <Chip
                    key={name}
                    label={`+${quantity} ${name}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Net Impact Summary */}
        {(netImpact.netPositive > 0 || netImpact.netNegative > 0) && (
          <Box sx={{ mt: 2, p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Net Impact: {netImpact.netNegative} resources consumed, {netImpact.netPositive} resources produced
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
