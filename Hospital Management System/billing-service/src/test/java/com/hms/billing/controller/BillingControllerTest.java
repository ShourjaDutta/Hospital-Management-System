package com.hms.billing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.billing.model.Bill;
import com.hms.billing.service.BillingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BillingController.class)
public class BillingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BillingService billingService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateBill() throws Exception {
        // Setup
        Bill bill = new Bill();
        bill.setId(1L);
        bill.setPatientId(1L);
        bill.setBillAmount(new BigDecimal("100.00"));

        when(billingService.createBill(any(Bill.class))).thenReturn(bill);

        // Execute & Verify
        mockMvc.perform(post("/api/bills")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bill)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.patientId").value(1))
                .andExpect(jsonPath("$.billAmount").value(100.00));
    }

    @Test
    void testGetAllBills() throws Exception {
        // Setup
        Bill bill1 = new Bill();
        bill1.setId(1L);
        bill1.setPatientId(1L);

        Bill bill2 = new Bill();
        bill2.setId(2L);
        bill2.setPatientId(2L);

        List<Bill> bills = Arrays.asList(bill1, bill2);
        when(billingService.getAllBills()).thenReturn(bills);

        // Execute & Verify
        mockMvc.perform(get("/api/bills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    void testGetBillById() throws Exception {
        // Setup
        Bill bill = new Bill();
        bill.setId(1L);
        bill.setPatientId(1L);

        when(billingService.getBillById(1L)).thenReturn(bill);

        // Execute & Verify
        mockMvc.perform(get("/api/bills/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.patientId").value(1));
    }

    @Test
    void testGetBillsByPatient() throws Exception {
        // Setup
        Bill bill1 = new Bill();
        bill1.setId(1L);
        bill1.setPatientId(1L);

        Bill bill2 = new Bill();
        bill2.setId(2L);
        bill2.setPatientId(1L);

        List<Bill> bills = Arrays.asList(bill1, bill2);
        when(billingService.getBillsByPatientId(1L)).thenReturn(bills);

        // Execute & Verify
        mockMvc.perform(get("/api/bills/patient/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].patientId").value(1))
                .andExpect(jsonPath("$[1].patientId").value(1));
    }

    @Test
    void testUpdateBill() throws Exception {
        // Setup
        Bill updatedBill = new Bill();
        updatedBill.setId(1L);
        updatedBill.setBillAmount(new BigDecimal("150.00"));

        when(billingService.updateBill(anyLong(), any(Bill.class))).thenReturn(updatedBill);

        // Execute & Verify
        mockMvc.perform(put("/api/bills/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBill)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.billAmount").value(150.00));
    }

    @Test
    void testMakePayment() throws Exception {
        // Setup
        Bill bill = new Bill();
        bill.setId(1L);
        bill.setPaidAmount(new BigDecimal("50.00"));

        when(billingService.makePayment(anyLong(), any(BigDecimal.class), any(Bill.PaymentMethod.class)))
                .thenReturn(bill);

        // Execute & Verify
        mockMvc.perform(post("/api/bills/1/payment")
                        .param("amount", "50.00")
                        .param("paymentMethod", "CASH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.paidAmount").value(50.00));
    }

    @Test
    void testGetTotalDueAmount() throws Exception {
        // Setup
        when(billingService.getTotalDueAmountByPatient(1L)).thenReturn(new BigDecimal("250.00"));

        // Execute & Verify
        mockMvc.perform(get("/api/bills/patient/1/total-due"))
                .andExpect(status().isOk())
                .andExpect(content().string("250.00"));
    }

    @Test
    void testGetBillsByStatus() throws Exception {
        // Setup
        Bill bill1 = new Bill();
        bill1.setId(1L);
        bill1.setStatus(Bill.BillStatus.PENDING);

        Bill bill2 = new Bill();
        bill2.setId(2L);
        bill2.setStatus(Bill.BillStatus.PENDING);

        List<Bill> bills = Arrays.asList(bill1, bill2);
        when(billingService.getBillsByStatus(Bill.BillStatus.PENDING)).thenReturn(bills);

        // Execute & Verify
        mockMvc.perform(get("/api/bills/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[1].status").value("PENDING"));
    }

    @Test
    void testDeleteBill() throws Exception {
        // Execute & Verify
        mockMvc.perform(delete("/api/bills/1"))
                .andExpect(status().isNoContent());
    }
}