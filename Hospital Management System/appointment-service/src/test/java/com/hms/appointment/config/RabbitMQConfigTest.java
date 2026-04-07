package com.hms.appointment.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = RabbitMQConfig.class)
public class RabbitMQConfigTest {

    @MockBean
    private ConnectionFactory connectionFactory; // mock to satisfy RabbitTemplate

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private Queue queue;

    @Autowired
    private TopicExchange exchange;

    @Autowired
    private Binding binding;

    @Test
    void testRabbitMQBeans() {
        assertNotNull(rabbitTemplate, "RabbitTemplate should be created");
        assertNotNull(queue, "Queue should be created");
        assertNotNull(exchange, "Exchange should be created");
        assertNotNull(binding, "Binding should be created");
    }
}

