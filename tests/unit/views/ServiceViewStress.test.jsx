import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceView } from '../../../src/views/ServiceView';
import { CarProvider } from '../../../src/context/CarContext';
import { ThemeProvider } from '../../../src/context/ThemeContext';
import { storage } from '../../../src/services/storage';

describe('ServiceView Stress and Adversarial Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderView = () => {
    return render(
      <ThemeProvider>
        <CarProvider>
          <ServiceView />
        </CarProvider>
      </ThemeProvider>
    );
  };

  it('1. should render empty states when no service history or reminders exist', () => {
    renderView();

    // Check empty state text for service records
    expect(screen.getByText(/No service records registered yet/i)).toBeInTheDocument();

    // Check empty state text for reminders
    expect(screen.getByText(/No reminders set/i)).toBeInTheDocument();

    // Check default maintenance recommendations (last service = "Never")
    expect(screen.getByText(/Next Oil Change due at 15,000/i || /Next Oil Change due at 15\s*000/i)).toBeInTheDocument();
    expect(screen.getByText(/Next Brake Inspection due at 30,000/i || /Next Brake Inspection due at 30\s*000/i)).toBeInTheDocument();
    expect(screen.getByText(/Next Tire Rotation due at 10,000/i || /Next Tire Rotation due at 10\s*000/i)).toBeInTheDocument();
    
    const neverElements = screen.getAllByText(/Last: Never/i);
    expect(neverElements.length).toBe(3);
  });

  it('2. should seed active car profile and display correct maintenance planner suggestions', () => {
    storage.saveCarProfile({
      vin: 'XTA219000H1234567',
      make: 'Lada',
      model: 'Granta',
      year: 2017,
      currentMileage: 85200,
      yearlyMileage: 15000
    });

    renderView();

    // Oil Change recommendation: since last is Never (0), next due is 15,000 km.
    // Since current mileage is 85,200 km, Oil change is overdue by 85,200 - 15,000 = 70,200 km.
    expect(screen.getByText(/Overdue by 70\D*200/i)).toBeInTheDocument();
  });

  it('3. should verify inline form validations and reject invalid inputs', () => {
    // Seed vehicle
    storage.saveCarProfile({
      vin: 'XTA219000H1234567',
      make: 'Lada',
      model: 'Granta',
      currentMileage: 85200
    });

    renderView();

    // Submit empty inline form: should show validation error
    const submitBtn = screen.getByRole('button', { name: /Add Record/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();

    // Fill inline form with adversarial inputs:
    // Future date, negative cost, mileage less than current mileage
    // Since modal is closed, inline form inputs are unique in the DOM
    const typeSelect = screen.getByLabelText(/Service Type \*/i);
    const odometerInput = screen.getByLabelText('Odometer (km) *');
    const dateInput = screen.getByLabelText(/Date \*/i);
    const costInput = screen.getByLabelText(/Cost \(\$\) \*/i);
    const notesInput = screen.getByLabelText('Notes');

    // Test 1: Future Date
    fireEvent.change(typeSelect, { target: { value: 'Oil Change' } });
    fireEvent.change(odometerInput, { target: { value: '1000' } }); 
    fireEvent.change(dateInput, { target: { value: '2099-12-31' } }); // future date
    fireEvent.change(costInput, { target: { value: '250' } }); 
    fireEvent.change(notesInput, { target: { value: 'Adversarial entry' } });

    fireEvent.click(submitBtn);
    expect(screen.getByText(/Service date cannot be in the future|Дата обслуживания не может быть в будущем/i)).toBeInTheDocument();
    expect(storage.getServiceHistory().length).toBe(0);

    // Test 2: Negative Cost
    fireEvent.change(dateInput, { target: { value: '2025-05-10' } });
    fireEvent.change(costInput, { target: { value: '-250' } }); // negative cost

    fireEvent.click(submitBtn);
    expect(screen.getByText(/Cost must be a positive number|Стоимость должна быть положительным числом/i)).toBeInTheDocument();
    expect(storage.getServiceHistory().length).toBe(0);

    // Test 3: Correct values
    fireEvent.change(costInput, { target: { value: '250' } }); // valid cost

    fireEvent.click(submitBtn);

    // Verify it was successfully added (no crash, form was cleared, and it appears in the list)
    expect(screen.queryByText(/Please fill in all required fields|Cost must be a positive number|Service date cannot be in the future/i)).not.toBeInTheDocument();
    
    // Check that it's rendered in the list
    expect(screen.getAllByText('Oil Change').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mileage:\s*1\D*000/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Adversarial entry')).toBeInTheDocument();
    
    // Verify it's persisted in storage
    const logs = storage.getServiceHistory();
    expect(logs.length).toBe(1);
    expect(logs[0].mileage).toBe(1000);
    expect(logs[0].date).toBe('2025-05-10');
    expect(logs[0].cost).toBe(250);
  });

  it('4. should verify strict validations on the modal popup form', () => {
    // Seed vehicle
    storage.saveCarProfile({
      vin: 'XTA219000H1234567',
      make: 'Lada',
      model: 'Granta',
      currentMileage: 85200
    });

    renderView();

    // Open modal
    const addBtn = screen.getByRole('button', { name: /Add Service/i });
    fireEvent.click(addBtn);

    // Submit empty modal: should show errors
    const saveBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);

    // There should now be two headings with name "Add Service Record" (one inline card, one modal)
    expect(screen.getAllByRole('heading', { name: /Add Service Record/i }).length).toBe(2);

    expect(screen.getByText(/Service Type is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Service Date is required/i)).toBeInTheDocument();

    // Select Service Type (we target index 0 inside the modal)
    const modalTypeSelect = screen.getAllByLabelText(/Service Type \*/i)[0];
    fireEvent.change(modalTypeSelect, { target: { value: 'Oil Change' } });

    // Test Future Date Validation (we target index 0 inside the modal)
    const modalDateInput = screen.getAllByLabelText(/Date \*/i)[0];
    fireEvent.change(modalDateInput, { target: { value: '2099-12-31' } });
    fireEvent.click(saveBtn);
    expect(screen.getByText(/Service date cannot be in the future/i)).toBeInTheDocument();

    // Test Cost Validation (Negative Cost)
    fireEvent.change(modalDateInput, { target: { value: '2026-06-28' } });
    const modalCostInput = screen.getAllByLabelText(/Cost \(\$\) \*/i)[0];
    fireEvent.change(modalCostInput, { target: { value: '-50' } });
    fireEvent.click(saveBtn);
    expect(screen.getByText(/Cost must be a positive number/i)).toBeInTheDocument();

    // Test Cost Validation (Extreme Cost > 1,000,000)
    fireEvent.change(modalCostInput, { target: { value: '1000001' } });
    fireEvent.click(saveBtn);
    expect(screen.getByText(/Cost must be a positive number/i)).toBeInTheDocument();

    // Test Mileage Validation (Mileage < Vehicle Current Mileage) - Warning shows but does not block save
    fireEvent.change(modalCostInput, { target: { value: '150' } });
    const modalOdometerInput = screen.getByLabelText('Odometer (km)'); // modal label is unique (no asterisk)
    fireEvent.change(modalOdometerInput, { target: { value: '80000' } }); // less than 85200
    
    // Warning should show up in real-time
    expect(screen.getByTestId('odometer-warning')).toHaveTextContent(/Mileage entered is less than the vehicle's current mileage/i);

    // Save should NOT be blocked (modal should save and close)
    fireEvent.click(saveBtn);

    // Verify modal closed (only inline heading remains)
    expect(screen.getAllByRole('heading', { name: /Add Service Record/i }).length).toBe(1);
    expect(screen.getAllByText(/Mileage:\s*80\D*000/i).length).toBeGreaterThan(0);
  });

  it('5. should verify UI toggling (modals opening/closing and Cancel button resets state)', () => {
    renderView();

    // Click Add Service to open modal
    const addBtn = screen.getByRole('button', { name: /Add Service/i });
    fireEvent.click(addBtn);
    expect(screen.getAllByRole('heading', { name: /Add Service Record/i }).length).toBe(2);

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.getAllByRole('heading', { name: /Add Service Record/i }).length).toBe(1);
  });

  it('6. should add, toggle, and delete reminders correctly', () => {
    renderView();

    // Open reminder modal
    const addReminderBtn = screen.getByRole('button', { name: /Add Reminder/i });
    fireEvent.click(addReminderBtn);
    expect(screen.getByRole('heading', { name: /Add Reminder/i })).toBeInTheDocument();

    // Submit empty reminder form: should show validation error
    const saveReminderBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveReminderBtn);
    expect(screen.getByText(/Title and Date are required/i)).toBeInTheDocument();

    // Fill form
    const remTitleInput = screen.getByLabelText(/Title \*/i);
    const remDateInput = screen.getByLabelText(/Due Date \*/i);
    const remMileageInput = screen.getByLabelText(/Due Mileage \(Optional\)/i);

    fireEvent.change(remTitleInput, { target: { value: 'OSAGO Expiration' } });
    fireEvent.change(remDateInput, { target: { value: '2027-06-15' } });
    fireEvent.change(remMileageInput, { target: { value: '120000' } });

    fireEvent.click(saveReminderBtn);

    // Verify reminder is added in active state (capitalization is PascalCase in UI: "Active")
    expect(screen.queryByRole('heading', { name: /Add Reminder/i })).not.toBeInTheDocument();
    expect(screen.getByText('OSAGO Expiration')).toBeInTheDocument();
    expect(screen.getByText('Due: 2027-06-15')).toBeInTheDocument();
    expect(screen.getByText(/120\D*000/i)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Toggle reminder (click checkbox)
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(screen.getByText('Inactive')).toBeInTheDocument();

    // Toggle reminder back to active
    fireEvent.click(checkbox);
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Delete reminder
    const deleteBtn = screen.getByTitle('Delete Reminder');
    fireEvent.click(deleteBtn);
    expect(screen.queryByText('OSAGO Expiration')).not.toBeInTheDocument();
    expect(screen.getByText(/No reminders set/i)).toBeInTheDocument();
  });
});
