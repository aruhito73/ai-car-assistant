import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider } from '@/context/ThemeContext.jsx';
import { CarProvider } from '@/context/CarContext.jsx';
import ServiceView from '@/views/ServiceView.jsx';
import { storage } from '@/services/storage.js';

describe('ServiceView Adversarial & Robustness Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <CarProvider>
          <ServiceView />
        </CarProvider>
      </ThemeProvider>
    );
  };

  it('renders correctly with empty states when storage is empty', () => {
    renderComponent();

    // Assert service book empty state message
    expect(screen.getByText(/No service records registered yet/i)).toBeInTheDocument();

    // Assert reminders empty state message
    expect(screen.getByText(/No reminders set/i)).toBeInTheDocument();
  });

  it('handles empty state and displays placeholders properly', () => {
    renderComponent();

    // Verify inline form is visible and input fields are empty/have defaults
    const serviceTypeSelect = screen.getByLabelText(/Service Type \*/i);
    expect(serviceTypeSelect.value).toBe('');

    const odometerInput = screen.getByLabelText(/Odometer \(km\) \*/i);
    expect(odometerInput.value).toBe('');

    const costInput = screen.getByLabelText(/Cost \(\$\) \*/i);
    expect(costInput.value).toBe('');
  });

  it('validates date boundaries: rejects future date and accepts valid past/present date in modal', async () => {
    // Seed vehicle profile to allow odometer checks
    storage.saveCarProfile({ make: 'Lada', model: 'Granta', currentMileage: 85200 });

    renderComponent();

    // Open add service modal
    const addSrvBtn = screen.getByRole('button', { name: /Add Service/i });
    fireEvent.click(addSrvBtn);

    // Check that modal is open
    expect(screen.getAllByRole('heading', { name: /Add Service Record/i }).length).toBe(2);

    // Fill form in modal with future date
    const typeSelect = screen.getByRole('combobox', { name: /Service Type \*/i });
    fireEvent.change(typeSelect, { target: { value: 'Oil Change' } });

    const dateInput = screen.getByLabelText(/Date \*/i);
    fireEvent.change(dateInput, { target: { value: '2035-12-31' } }); // Future date

    const costInput = screen.getByRole('spinbutton', { name: /Cost \(\$\) \*/i });
    fireEvent.change(costInput, { target: { value: '150' } });

    // Save
    const saveBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);

    // Assert error for future date
    expect(screen.getByText(/Service date cannot be in the future/i)).toBeInTheDocument();

    // Now correct the date to today/present
    const today = new Date().toISOString().split('T')[0];
    fireEvent.change(dateInput, { target: { value: today } });
    fireEvent.click(saveBtn);

    // Modal should close (heading no longer visible in modal) and record should be present in Past Records
    expect(screen.getAllByRole('heading', { name: /Add Service Record/i }).length).toBe(1);
    expect(screen.getByText(/Past Records/i)).toBeInTheDocument();
  });

  it('validates cost range: rejects negative cost and excessive cost (> 1,000,000) in modal', async () => {
    storage.saveCarProfile({ make: 'Lada', model: 'Granta', currentMileage: 85200 });

    renderComponent();

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Add Service/i }));

    const typeSelect = screen.getByRole('combobox', { name: /Service Type \*/i });
    fireEvent.change(typeSelect, { target: { value: 'Oil Change' } });

    const dateInput = screen.getByLabelText(/Date \*/i);
    fireEvent.change(dateInput, { target: { value: '2026-06-25' } });

    const costInput = screen.getByRole('spinbutton', { name: /Cost \(\$\) \*/i });
    const saveBtn = screen.getByRole('button', { name: /Save/i });

    // 1. Test negative cost
    fireEvent.change(costInput, { target: { value: '-50' } });
    fireEvent.click(saveBtn);
    expect(screen.getByText(/Cost must be a positive number/i)).toBeInTheDocument();

    // 2. Test excessive cost
    fireEvent.change(costInput, { target: { value: '1500000' } }); // > 1,000,000
    fireEvent.click(saveBtn);
    expect(screen.getByText(/Cost must be a positive number/i)).toBeInTheDocument();

    // 3. Test valid cost passes
    fireEvent.change(costInput, { target: { value: '250' } });
    fireEvent.click(saveBtn);
    expect(screen.queryByText(/Cost must be a positive number/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /Add Service Record/i }).length).toBe(1);
  });

  it('recovers gracefully from malformed JSON in localStorage', () => {
    // Seed corrupt data
    localStorage.setItem('ai_car_services', 'corrupt_json_string');
    localStorage.setItem('ai_car_reminders', '{not_an_array}');

    // Mock console.error to avoid noise in test logs
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderComponent();

    // Verify it doesn't crash and displays empty state properly
    expect(screen.getByText(/No service records registered yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No reminders set/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('handles UI toggling (add/cancel/toggle checkbox) and modal operations correctly', async () => {
    renderComponent();

    // 1. Toggle Add Service Modal
    const addSrvBtn = screen.getByRole('button', { name: /Add Service/i });
    fireEvent.click(addSrvBtn);
    expect(screen.getAllByRole('heading', { name: /Add Service Record/i }).length).toBe(2);
 
    const cancelSrvBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelSrvBtn);
    expect(screen.getAllByRole('heading', { name: /Add Service Record/i }).length).toBe(1);

    // 2. Toggle Add Reminder Modal
    const addRemBtn = screen.getByRole('button', { name: /Add Reminder/i });
    fireEvent.click(addRemBtn);
    expect(screen.getByRole('heading', { name: /Add Reminder/i })).toBeInTheDocument();

    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButtons[0]);
    expect(screen.queryByRole('heading', { name: /Add Reminder/i })).not.toBeInTheDocument();
  });
});
