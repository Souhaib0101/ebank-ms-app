package net.montaki.customerservice.service;

import net.montaki.customerservice.entities.Customer;
import net.montaki.customerservice.repository.CustomerRepository;
import org.springaicommunity.mcp.annotation.McpTool;
import org.springaicommunity.mcp.annotation.McpToolParam;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @McpTool(description = "Get All customers")
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @McpTool(description = "Find a customer by id")
    public Customer findCustomerById(@McpToolParam(description = "The customer id") Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    @McpTool(description = "Save a new customer")
    public Customer saveCustomer(@McpToolParam(description = "The customer to save (name,email)") Customer customer) {
        return customerRepository.save(customer);
    }

}
