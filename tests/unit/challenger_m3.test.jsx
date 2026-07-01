import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CarProvider } from '../../src/context/CarContext.jsx';
import ThemeProvider from '../../src/context/ThemeContext.jsx';
import ServiceView from '../../src/views/ServiceView.jsx';
import { storage } from '../../src/services/storage.js';

describe('ServiceView Challenger Stress & Boundary Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Seed a car profile so ServiceView has a vehicle profile
    storage.saveCarProfile({
      vin: 'XTA219000H1234567',
      make: 'Lada',
      model: 'Granta',
      year: 2017,
      currentMileage: 85200,
      yearlyMileage: 15000
    });
  });

  it('verifies that the inline form does not enforce future date validation or cost range validation', async () => {
    render(
      <ThemeProvider>
        <CarProvider>
          <ServiceView />
        </CarProvider>
      </ThemeProvider>
    );

    // Verify page rendered
    expect(screen.getByText('Add Service Record')).toBeInTheDocument();

    // Select input elements for the inline form
    // Note: SelectField uses ID 'service-type'
    const typeSelect = document.getElementById('service-type');
    const odometerInput = document.getElementById('odometer');
    const dateInput = document.getElementById('service-date');
    const costInput = document.getElementById('service-cost');
    const notesInput = document.getElementById('service-notes');
    const submitBtn = screen.getByRole('button', { name: /Add Record/i });

    expect(typeSelect).toBeInTheDocument();
    expect(odometerInput).toBeInTheDocument();

    // 1. Submit with invalid data: future date, negative cost, mileage lower than current mileage
    fireEvent.change(typeSelect, { target: { value: 'Oil Change' } });
    fireEvent.change(odometerInput, { target: { value: '70000' } }); // Lower than 85200
    fireEvent.change(dateInput, { target: { value: '2035-12-31' } }); // Future date
    fireEvent.change(costInput, { target: { value: '-500' } }); // Negative cost
    fireEvent.change(notesInput, { target: { value: 'Bypassing checks' } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Check if error is displayed. It shouldn't be because inline form doesn't validate!
    const errorMsg = screen.queryByText(/Cost must be a positive number/i) || 
                     screen.queryByText(/Service date cannot be in the future/i) ||
                     screen.queryByText(/Mileage entered is less than/i) ||
                     screen.queryByText(/Please fill in all required fields/i);
    
    expect(errorMsg).toBeNull();

    // Verify it is saved in storage regardless
    const logs = storage.getServiceHistory();
    expect(logs.length).toBe(1);
    expect(logs[0].notes).toBe('Bypassing checks');
    expect(logs[0].cost).toBe(-500);
    expect(logs[0].mileage).toBe(70000);
    expect(logs[0].date).toBe('2035-12-31');
  });

  it('verifies that the modal form DOES enforce validation rules', async () => {
    render(
      <ThemeProvider>
        <CarProvider>
          <ServiceView />
        </CarProvider>
      </ThemeProvider>
    );

    // Open add modal
    const addBtn = screen.getByRole('button', { name: /Add Service/i });
    fireEvent.click(addBtn);

    // Verify Modal is open by checking that there are two headings
    expect(screen.getAllByRole('heading', { name: 'Add Service Record' }).length).toBe(2);

    // The form elements inside the modal
    // In ServiceView.jsx, when the modal is open, the modalType selector is also id="service-type"
    // and modalMileage is id="odometer", date is id="date", cost is id="cost"
    const modalTypeSelect = document.getElementById('service-type');
    const modalOdometerInput = document.getElementById('odometer');
    const modalDateInput = document.getElementById('date');
    const modalCostInput = document.getElementById('cost');
    const saveBtn = screen.getByRole('button', { name: /Save/i });

    // Submit empty to check required fields
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(screen.getByText('Service Type is required')).toBeInTheDocument();
    expect(screen.getByText('Service Date is required')).toBeInTheDocument();

    // Fill in invalid cost and future date
    fireEvent.change(modalTypeSelect, { target: { value: 'Oil Change' } });
    fireEvent.change(modalOdometerInput, { target: { value: '70000' } }); // Lower mileage warning check
    fireEvent.change(modalDateInput, { target: { value: '2035-12-31' } }); // Future date error
    fireEvent.change(modalCostInput, { target: { value: '-200' } }); // Negative cost error

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(screen.getByText('Service date cannot be in the future')).toBeInTheDocument();
    expect(screen.getByText('Cost must be a positive number')).toBeInTheDocument();
    
    // Check warning message for mileage
    expect(screen.getByTestId('odometer-warning')).toHaveTextContent("Mileage entered is less than the vehicle's current mileage");

    // Fix date, cost, and mileage to a valid value to verify save and close
    fireEvent.change(modalDateInput, { target: { value: '2026-06-20' } });
    fireEvent.change(modalCostInput, { target: { value: '200' } });
    fireEvent.change(modalOdometerInput, { target: { value: '90000' } });

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Modal should close and save, leaving only 1 heading
    expect(screen.getAllByRole('heading', { name: 'Add Service Record' }).length).toBe(1);
    const logs = storage.getServiceHistory();
    expect(logs.length).toBe(1);
    expect(logs[0].mileage).toBe(90000);
    expect(logs[0].cost).toBe(200);
  });
});
