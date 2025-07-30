import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../components/App';
import { StorageAwareAppProvider } from '../../localStorageImplementation/StorageAwareAppProvider';
import { featureFlags } from '../../localStorageImplementation/integration/featureFlags';

// Test wrapper that provides necessary context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <StorageAwareAppProvider>
    {children}
  </StorageAwareAppProvider>
);

describe('Variable System End-to-End Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    featureFlags.clearAllOverrides();
    featureFlags.setOverride('enableVariableSystem', true);
  });

  describe('New User Workflow', () => {
    it('should complete entire variable creation workflow', async () => {
      render(<App />, { wrapper: TestWrapper });

      // Step 1: Open create new item dialog
      const newItemButton = screen.getByRole('button', { name: /new item/i });
      await user.click(newItemButton);

      // Step 2: Select variable item type
      const variableTypeButton = screen.getByRole('button', { name: /variable/i });
      await user.click(variableTypeButton);

      // Step 3: Fill in variable details
      const nameInput = screen.getByLabelText(/variable name/i);
      await user.type(nameInput, 'eggs');

      const valueInput = screen.getByLabelText(/value/i);
      await user.type(valueInput, '12');

      // Step 4: Add description
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Fresh eggs from the local farm. Related to [milk] and [butter].');

      // Step 5: Create the variable
      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      // Verify variable was created
      await waitFor(() => {
        expect(screen.getByText('eggs')).toBeInTheDocument();
      });
    });

    it('should show variable summaries in items', async () => {
      render(<App />, { wrapper: TestWrapper });

      // Create a variable first
      await createTestVariable('flour', 5, 'All-purpose flour for baking');

      // Create an item that uses the variable
      const newItemButton = screen.getByRole('button', { name: /new item/i });
      await user.click(newItemButton);

      const basicItemButton = screen.getByRole('button', { name: /basic item/i });
      await user.click(basicItemButton);

      const itemNameInput = screen.getByLabelText(/item name/i);
      await user.type(itemNameInput, 'Bake Bread');

      // Add variable to the item
      const addVariableButton = screen.getByRole('button', { name: /add variable/i });
      await user.click(addVariableButton);

      const variableSelect = screen.getByLabelText(/variable/i);
      await user.selectOptions(variableSelect, 'flour');

      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.type(quantityInput, '2');

      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      // Verify variable summary is shown
      await waitFor(() => {
        expect(screen.getByText(/flour: 2/)).toBeInTheDocument();
      });
    });

    it('should filter items by variable quantities', async () => {
      render(<App />, { wrapper: TestWrapper });

      // Create test data
      await createTestVariable('sugar', 10, 'Granulated sugar');
      await createTestItemWithVariable('Make Cookies', 'sugar', 3);
      await createTestItemWithVariable('Make Cake', 'sugar', 8);
      await createTestItemWithVariable('Make Tea', 'sugar', 1);

      // Apply filter for sugar >= 5
      const filterInput = screen.getByLabelText(/filter/i);
      await user.type(filterInput, 'sugar >= 5');

      // Should show only Make Cake (sugar: 8)
      await waitFor(() => {
        expect(screen.getByText('Make Cake')).toBeInTheDocument();
        expect(screen.queryByText('Make Cookies')).not.toBeInTheDocument();
        expect(screen.queryByText('Make Tea')).not.toBeInTheDocument();
      });
    });

    it('should navigate variable descriptions via popup', async () => {
      render(<App />, { wrapper: TestWrapper });

      // Create variables with cross-links
      await createTestVariable('milk', 2, 'Fresh milk from [farm]. Used with [eggs].');
      await createTestVariable('eggs', 12, 'Farm fresh eggs. Goes with [milk].');
      await createTestVariable('farm', 1, 'Local organic farm');

      // Click on milk variable chip
      const milkChip = screen.getByText('milk');
      await user.click(milkChip);

      // Should open description popup
      await waitFor(() => {
        expect(screen.getByText('Fresh milk from')).toBeInTheDocument();
      });

      // Click on farm link
      const farmLink = screen.getByText('farm');
      await user.click(farmLink);

      // Should navigate to farm description
      await waitFor(() => {
        expect(screen.getByText('Local organic farm')).toBeInTheDocument();
      });
    });
  });

  describe('Power User Workflow', () => {
    it('should handle complex variable hierarchies', async () => {
      render(<App />, { wrapper: TestWrapper });

      // Create hierarchical variables
      await createTestVariable('protein', 100, 'Total protein category');
      await createTestVariable('meat', 50, 'Meat proteins. Part of [protein].');
      await createTestVariable('beef', 25, 'Beef products. Type of [meat].');
      await createTestVariable('chicken', 20, 'Chicken products. Type of [meat].');

      // Create complex item using multiple variables
      await createTestItemWithMultipleVariables('Meal Prep', [
        { name: 'beef', quantity: 5 },
        { name: 'chicken', quantity: 8 },
        { name: 'protein', quantity: 15 }
      ]);

      // Verify summaries account for relationships
      await waitFor(() => {
        expect(screen.getByText(/beef: 5/)).toBeInTheDocument();
        expect(screen.getByText(/chicken: 8/)).toBeInTheDocument();
        expect(screen.getByText(/protein: 15/)).toBeInTheDocument();
      });
    });

    it('should handle extensive cross-linking', async () => {
      render(<App />, { wrapper: TestWrapper });

      // Create interconnected variables
      const variables = [
        { name: 'recipe', description: 'Main [recipe] using [flour], [eggs], and [milk].' },
        { name: 'flour', description: 'Used in [recipe] and [bread].' },
        { name: 'eggs', description: 'Used in [recipe] and [pasta].' },
        { name: 'milk', description: 'Used in [recipe] and [cereal].' },
        { name: 'bread', description: 'Made with [flour] from [recipe].' },
        { name: 'pasta', description: 'Made with [eggs] technique from [recipe].' },
        { name: 'cereal', description: 'Served with [milk] from [recipe].' }
      ];

      for (const variable of variables) {
        await createTestVariable(variable.name, 1, variable.description);
      }

      // Test navigation through cross-links
      const recipeChip = screen.getByText('recipe');
      await user.click(recipeChip);

      // Should be able to navigate through all linked variables
      const flourLink = screen.getByText('flour');
      await user.click(flourLink);

      await waitFor(() => {
        expect(screen.getByText('Used in')).toBeInTheDocument();
      });
    });

    it('should apply complex variable filters', async () => {
      render(<App />, { wrapper: TestWrapper });

      // Create test data with various quantities
      await createTestVariable('calories', 2000, 'Daily calorie target');
      await createTestVariable('fat', 50, 'Daily fat limit');
      await createTestVariable('protein', 150, 'Daily protein goal');

      // Create items with different nutritional profiles
      await createTestItemWithMultipleVariables('Light Meal', [
        { name: 'calories', quantity: 300 },
        { name: 'fat', quantity: 5 },
        { name: 'protein', quantity: 25 }
      ]);

      await createTestItemWithMultipleVariables('Heavy Meal', [
        { name: 'calories', quantity: 800 },
        { name: 'fat', quantity: 35 },
        { name: 'protein', quantity: 45 }
      ]);

      await createTestItemWithMultipleVariables('Snack', [
        { name: 'calories', quantity: 150 },
        { name: 'fat', quantity: 2 },
        { name: 'protein', quantity: 5 }
      ]);

      // Apply complex filter: calories < 500 AND fat < 10
      const filterInput = screen.getByLabelText(/filter/i);
      await user.type(filterInput, 'calories < 500 AND fat < 10');

      // Should show Light Meal and Snack
      await waitFor(() => {
        expect(screen.getByText('Light Meal')).toBeInTheDocument();
        expect(screen.getByText('Snack')).toBeInTheDocument();
        expect(screen.queryByText('Heavy Meal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Migration Workflow', () => {
    it('should migrate legacy variable data', async () => {
      // Set up legacy data in localStorage
      const legacyData = {
        items: [
          {
            id: 'item-1',
            name: 'Test Item',
            type: 'basic',
            variables: [
              { name: 'oldVar', quantity: 5 }
            ]
          }
        ]
      };
      localStorage.setItem('atp-data', JSON.stringify(legacyData));

      render(<App />, { wrapper: TestWrapper });

      // Should automatically migrate data
      await waitFor(() => {
        expect(screen.getByText('oldVar')).toBeInTheDocument();
      });

      // Verify new features work with migrated data
      const oldVarChip = screen.getByText('oldVar');
      await user.click(oldVarChip);

      // Should be able to add description to migrated variable
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Migrated variable with new description');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Migrated variable with new description')).toBeInTheDocument();
      });
    });

    it('should preserve all data during migration', async () => {
      const legacyData = {
        items: [
          { id: 'item-1', name: 'Item 1', variables: [{ name: 'var1', quantity: 10 }] },
          { id: 'item-2', name: 'Item 2', variables: [{ name: 'var2', quantity: 20 }] },
          { id: 'item-3', name: 'Item 3', variables: [{ name: 'var1', quantity: 5 }] }
        ]
      };
      localStorage.setItem('atp-data', JSON.stringify(legacyData));

      render(<App />, { wrapper: TestWrapper });

      // Verify all items and variables are preserved
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
        expect(screen.getAllByText('var1')).toHaveLength(2); // Used in 2 items
        expect(screen.getByText('var2')).toBeInTheDocument();
      });
    });
  });

  // Helper functions
  async function createTestVariable(name: string, value: number, description: string) {
    const newItemButton = screen.getByRole('button', { name: /new item/i });
    await user.click(newItemButton);

    const variableTypeButton = screen.getByRole('button', { name: /variable/i });
    await user.click(variableTypeButton);

    const nameInput = screen.getByLabelText(/variable name/i);
    await user.type(nameInput, name);

    const valueInput = screen.getByLabelText(/value/i);
    await user.type(valueInput, value.toString());

    if (description) {
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, description);
    }

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  }

  async function createTestItemWithVariable(itemName: string, variableName: string, quantity: number) {
    const newItemButton = screen.getByRole('button', { name: /new item/i });
    await user.click(newItemButton);

    const basicItemButton = screen.getByRole('button', { name: /basic item/i });
    await user.click(basicItemButton);

    const itemNameInput = screen.getByLabelText(/item name/i);
    await user.type(itemNameInput, itemName);

    const addVariableButton = screen.getByRole('button', { name: /add variable/i });
    await user.click(addVariableButton);

    const variableSelect = screen.getByLabelText(/variable/i);
    await user.selectOptions(variableSelect, variableName);

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.type(quantityInput, quantity.toString());

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(itemName)).toBeInTheDocument();
    });
  }

  async function createTestItemWithMultipleVariables(
    itemName: string,
    variables: Array<{ name: string; quantity: number }>
  ) {
    const newItemButton = screen.getByRole('button', { name: /new item/i });
    await user.click(newItemButton);

    const basicItemButton = screen.getByRole('button', { name: /basic item/i });
    await user.click(basicItemButton);

    const itemNameInput = screen.getByLabelText(/item name/i);
    await user.type(itemNameInput, itemName);

    for (const variable of variables) {
      const addVariableButton = screen.getByRole('button', { name: /add variable/i });
      await user.click(addVariableButton);

      const variableSelect = screen.getByLabelText(/variable/i);
      await user.selectOptions(variableSelect, variable.name);

      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.type(quantityInput, variable.quantity.toString());
    }

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(itemName)).toBeInTheDocument();
    });
  }
});
