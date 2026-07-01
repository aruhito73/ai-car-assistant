import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeProvider } from '@/context/ThemeContext.jsx';
import { CarProvider } from '@/context/CarContext.jsx';
import FinanceView from '@/views/FinanceView.jsx';
import { storage } from '@/services/storage.js';

// Mock Recharts components for unit tests to inspect props and avoid JSDOM SVG limitations
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ data, dataKey }) => (
      <div data-testid="pie" data-data={JSON.stringify(data)} data-datakey={dataKey} />
    ),
    Cell: () => <div data-testid="cell" />,
    AreaChart: ({ data, children }) => (
      <div data-testid="area-chart" data-data={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Area: ({ dataKey }) => <div data-testid="area" data-datakey={dataKey} />,
    XAxis: ({ dataKey }) => <div data-testid="x-axis" data-datakey={dataKey} />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />
  };
});

describe('FinanceView Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Use fake timers to mock date and verify future date validation consistently
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <CarProvider>
          <FinanceView />
        </CarProvider>
      </ThemeProvider>
    );
  };

  describe('Initial Empty State', () => {
    it('renders empty UI properly when no expenses are logged', () => {
      renderComponent();

      // Verify empty state cost summary is $0.00
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();

      // Verify empty ledger helper text
      expect(screen.getByText(/Log expenses to see annual and category trends\./i)).toBeInTheDocument();

      // Verify charts are not rendered
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();

      // Verify filter category dropdown is not present (only displays if expenses.length > 0)
      expect(screen.queryByLabelText(/Filter:/i)).not.toBeInTheDocument();
      expect(document.getElementById('filter-category')).toBeNull();
    });
  });

  describe('Normal (Inline) Expense Logging', () => {
    it('shows error when required fields are missing on submit', () => {
      renderComponent();

      // Submit form with empty fields
      const submitBtn = screen.getByRole('button', { name: /Log Expense/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Please fill in all required fields\./i)).toBeInTheDocument();
    });

    it('shows error when amount is zero or negative', () => {
      renderComponent();

      const categorySelect = document.getElementById('expense-category');
      const amountInput = document.getElementById('amount');
      const dateInput = document.getElementById('expense-date');
      const submitBtn = screen.getByRole('button', { name: /Log Expense/i });

      // Fill valid category and date, but negative amount
      fireEvent.change(categorySelect, { target: { value: 'Fuel' } });
      fireEvent.change(dateInput, { target: { value: '2026-06-25' } });
      fireEvent.change(amountInput, { target: { value: '-10' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Amount must be greater than 0/i)).toBeInTheDocument();

      // Test zero amount
      fireEvent.change(amountInput, { target: { value: '0' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Amount must be greater than 0/i)).toBeInTheDocument();
    });

    it('shows error when date is in the future', () => {
      renderComponent();

      const categorySelect = document.getElementById('expense-category');
      const amountInput = document.getElementById('amount');
      const dateInput = document.getElementById('expense-date');
      const submitBtn = screen.getByRole('button', { name: /Log Expense/i });

      fireEvent.change(categorySelect, { target: { value: 'Fuel' } });
      fireEvent.change(amountInput, { target: { value: '50' } });
      fireEvent.change(dateInput, { target: { value: '2026-07-01' } }); // 1 day in the future
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Expense date cannot be in the future/i)).toBeInTheDocument();
    });

    it('successfully submits valid expense data and resets form fields', () => {
      renderComponent();

      const categorySelect = document.getElementById('expense-category');
      const amountInput = document.getElementById('amount');
      const dateInput = document.getElementById('expense-date');
      const notesInput = document.getElementById('expense-notes');
      const submitBtn = screen.getByRole('button', { name: /Log Expense/i });

      fireEvent.change(categorySelect, { target: { value: 'Fuel' } });
      fireEvent.change(amountInput, { target: { value: '50.25' } });
      fireEvent.change(dateInput, { target: { value: '2026-06-28' } });
      fireEvent.change(notesInput, { target: { value: 'Weekly fuel top-up' } });

      fireEvent.click(submitBtn);

      // Verify error is empty
      expect(screen.queryByText(/Please fill in all required fields\./i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Amount must be greater than 0/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Expense date cannot be in the future/i)).not.toBeInTheDocument();

      // Verify inline inputs are reset
      expect(categorySelect.value).toBe('');
      expect(amountInput.value).toBe('');
      expect(notesInput.value).toBe('');
      expect(dateInput.value).toBe('2026-06-30'); // Resets to system today

      // Verify listed expense details are rendered in the ledger table
      expect(screen.getByText('Weekly fuel top-up')).toBeInTheDocument();
      expect(screen.getAllByText('$50.25')).toHaveLength(2);
      expect(screen.getByText('2026-06-28')).toBeInTheDocument();
      
      // Verify storage contains the entry
      const expenses = storage.getExpenses();
      expect(expenses.length).toBe(1);
      expect(expenses[0]).toMatchObject({
        category: 'Fuel',
        cost: 50.25,
        date: '2026-06-28',
        notes: 'Weekly fuel top-up'
      });
    });
  });

  describe('Modal Expense Logging', () => {
    it('opens and closes the modal correctly', () => {
      renderComponent();

      // 1. Assert modal is closed initially
      expect(screen.queryByRole('heading', { name: /Add New Expense/i })).not.toBeInTheDocument();

      // 2. Click Add Expense to open modal
      const openBtn = screen.getByRole('button', { name: /Add Expense/i });
      fireEvent.click(openBtn);
      expect(screen.getByRole('heading', { name: /Add New Expense/i })).toBeInTheDocument();

      // 3. Click Close (X) button to close
      const closeBtn = screen.getByText('×');
      fireEvent.click(closeBtn);
      expect(screen.queryByRole('heading', { name: /Add New Expense/i })).not.toBeInTheDocument();

      // 4. Click Add Expense and then Cancel to close
      fireEvent.click(openBtn);
      expect(screen.getByRole('heading', { name: /Add New Expense/i })).toBeInTheDocument();

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);
      expect(screen.queryByRole('heading', { name: /Add New Expense/i })).not.toBeInTheDocument();
    });

    it('performs validation and submits valid entries inside the modal overlay', () => {
      renderComponent();

      // Open Modal
      fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));

      // Find modal submit button (Save Expense) and form inputs
      // When modal is open, inline inputs take ID 'inline-*' while modal inputs take the clean IDs
      const categorySelect = document.getElementById('expense-category');
      const amountInput = document.getElementById('amount');
      const dateInput = document.getElementById('date');
      const notesInput = document.getElementById('notes');
      const saveBtn = screen.getByRole('button', { name: /Save Expense/i });

      // 1. Check blank validation
      fireEvent.click(saveBtn);
      expect(screen.getByText(/Please fill in all required fields\./i)).toBeInTheDocument();

      // 2. Check negative amount validation
      fireEvent.change(categorySelect, { target: { value: 'Repair' } });
      fireEvent.change(dateInput, { target: { value: '2026-06-25' } });
      fireEvent.change(amountInput, { target: { value: '-120' } });
      fireEvent.click(saveBtn);
      expect(screen.getByText(/Amount must be greater than 0/i)).toBeInTheDocument();

      // 3. Check future date validation
      fireEvent.change(amountInput, { target: { value: '150' } });
      fireEvent.change(dateInput, { target: { value: '2026-07-05' } }); // Future
      fireEvent.click(saveBtn);
      expect(screen.getByText(/Expense date cannot be in the future/i)).toBeInTheDocument();

      // 4. Submit valid entry
      fireEvent.change(dateInput, { target: { value: '2026-06-29' } });
      fireEvent.change(notesInput, { target: { value: 'Brake pads replaced' } });
      fireEvent.click(saveBtn);

      // Verify modal is closed
      expect(screen.queryByRole('heading', { name: /Add New Expense/i })).not.toBeInTheDocument();

      // Verify table rendering and storage
      expect(screen.getByText('Brake pads replaced')).toBeInTheDocument();
      expect(screen.getAllByText('$150.00')).toHaveLength(2);
      expect(storage.getExpenses().length).toBe(1);
    });
  });

  describe('Ledger List Display, Filtering, and Deletion Flow', () => {
    beforeEach(() => {
      // Seed storage with three distinct entries
      storage.saveExpenses([
        { id: 'exp-1', category: 'Fuel', cost: 60.50, date: '2026-06-28', notes: 'Fuel fillup' },
        { id: 'exp-2', category: 'Repair', cost: 120.00, date: '2026-06-29', notes: 'Oil change' },
        { id: 'exp-3', category: 'Insurance', cost: 200.00, date: '2026-06-30', notes: 'Annual policy' }
      ]);
    });

    it('renders all logged entries and calculates total cost correctly', () => {
      renderComponent();

      // Check table elements
      expect(screen.getByText('Fuel fillup')).toBeInTheDocument();
      expect(screen.getByText('Oil change')).toBeInTheDocument();
      expect(screen.getByText('Annual policy')).toBeInTheDocument();

      // Total cost of all three = $380.50
      expect(screen.getByText('$380.50')).toBeInTheDocument();
    });

    it('filters ledger list rows and recalculates cost summary on category selection change', () => {
      renderComponent();

      const filterSelect = document.getElementById('filter-category');
      expect(filterSelect).toBeInTheDocument();

      // Change filter to 'Repair'
      fireEvent.change(filterSelect, { target: { value: 'Repair' } });

      // Only Repair record should be visible
      expect(screen.getByText('Oil change')).toBeInTheDocument();
      expect(screen.queryByText('Fuel fillup')).not.toBeInTheDocument();
      expect(screen.queryByText('Annual policy')).not.toBeInTheDocument();

      // Cost summary should update to $120.00
      expect(screen.getAllByText('$120.00')).toHaveLength(2);

      // Change filter back to 'All'
      fireEvent.change(filterSelect, { target: { value: '' } });

      // All three visible again
      expect(screen.getByText('Fuel fillup')).toBeInTheDocument();
      expect(screen.getByText('Oil change')).toBeInTheDocument();
      expect(screen.getByText('Annual policy')).toBeInTheDocument();
      expect(screen.getByText('$380.50')).toBeInTheDocument();
    });

    it('hides item from list immediately when delete is clicked and opens confirm modal', () => {
      renderComponent();

      // Find delete buttons for 'exp-2' (Oil change)
      // Note: FinanceView renders two buttons per row matching this testid
      const deleteBtns = screen.getAllByTestId('delete-exp-2');
      expect(deleteBtns.length).toBe(2);

      // Trigger deletion modal by clicking the first trash button
      fireEvent.click(deleteBtns[0]);

      // 1. Confirm item is immediately hidden from list
      expect(screen.queryByText('Oil change')).not.toBeInTheDocument();
      // Total cost recalculates immediately based on visible records ($380.50 - $120 = $260.50)
      expect(screen.getByText('$260.50')).toBeInTheDocument();

      // 2. Confirm deletion dialog is open
      expect(screen.getByRole('heading', { name: /Confirm Deletion/i })).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete this expense entry\?/i)).toBeInTheDocument();
    });

    it('restores the hidden item if deletion is cancelled', () => {
      renderComponent();

      const deleteBtns = screen.getAllByTestId('delete-exp-2');
      fireEvent.click(deleteBtns[0]);

      // Cancel deletion in modal
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      // Dialog should close
      expect(screen.queryByRole('heading', { name: /Confirm Deletion/i })).not.toBeInTheDocument();

      // Record and cost must be restored
      expect(screen.getByText('Oil change')).toBeInTheDocument();
      expect(screen.getByText('$380.50')).toBeInTheDocument();
    });

    it('permanently deletes the item and updates storage if deletion is confirmed', async () => {
      renderComponent();

      const deleteBtns = screen.getAllByTestId('delete-exp-2');
      fireEvent.click(deleteBtns[0]);

      // Confirm deletion in modal
      const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
      fireEvent.click(confirmBtn);

      // Flush microtasks to allow the async handleConfirmDelete to finish and trigger state update
      await act(async () => {
        await Promise.resolve();
      });

      // Dialog should close
      expect(screen.queryByRole('heading', { name: /Confirm Deletion/i })).not.toBeInTheDocument();

      // Verify permanently removed from screen
      expect(screen.queryByText('Oil change')).not.toBeInTheDocument();
      expect(screen.getByText('$260.50')).toBeInTheDocument();

      // Verify removed from storage
      const stored = storage.getExpenses();
      expect(stored.length).toBe(2);
      expect(stored.find(e => e.id === 'exp-2')).toBeUndefined();
    });
  });

  describe('Graph Display & Integration', () => {
    it('passes correctly aggregated and formatted data to Recharts charts', () => {
      // Seed data spanning multiple months and categories
      storage.saveExpenses([
        { id: 'exp-1', category: 'Fuel', cost: 100.00, date: '2026-05-15', notes: 'Fuel May' },
        { id: 'exp-2', category: 'Fuel', cost: 150.00, date: '2026-06-10', notes: 'Fuel June' },
        { id: 'exp-3', category: 'Repair', cost: 200.00, date: '2026-06-20', notes: 'Repair June' }
      ]);

      renderComponent();

      // Verify that charts elements exist
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();

      // Verify PieChart props: groups items by category and aggregates costs
      // Category totals: Fuel: $250.00, Repair: $200.00
      const pieComp = screen.getByTestId('pie');
      const pieData = JSON.parse(pieComp.getAttribute('data-data'));
      expect(pieData).toEqual([
        { name: 'Fuel', value: 250 },
        { name: 'Repair', value: 200 }
      ]);
      expect(pieComp.getAttribute('data-datakey')).toBe('value');

      // Verify AreaChart props: groups items by month (YYYY-MM), sorts chronologically
      // Month totals: May 2026: $100.00, June 2026: $350.00
      const areaChartComp = screen.getByTestId('area-chart');
      const trendData = JSON.parse(areaChartComp.getAttribute('data-data'));
      expect(trendData).toEqual([
        { month: 'May 2026', amount: 100 },
        { month: 'June 2026', amount: 350 }
      ]);

      const areaComp = screen.getByTestId('area');
      expect(areaComp.getAttribute('data-datakey')).toBe('amount');
    });
  });
});
