---
title: "消息队列 Kafka"
description: "这是一篇关于 Kafka 的文章，cpp转java实录。在Spring Boot中集成Kafka，实现消息队列。"
pubDatetime: 2024-08-08
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# 消息队列 Kafka

## 消息队列

我们常常在Web开发当中听到消息队列这个概念，但对于消息队列到底是什么，为什么要使用消息队列，有哪些优点，我们该如何使用消息队列，下面就来一起学习一下。

### 什么是消息队列？

1. 消息队列（Message Queue）是一种应用间通信的技术。
2. 它是一种异步通信方式，生产者（Producer）和消费者（Consumer）之间通过消息队列进行通信。
3. 消息队列可以实现应用解耦，异步处理，削峰填谷，提升系统处理能力。

其本体其实就是一个生产者-消费者模型，生产者生产消息，消费者消费消息。生产者和消费者之间通过消息队列进行通信，实现异步通信。

### 为什么要使用消息队列？

1. 异步处理：消息队列可以异步处理消息，提升系统处理能力。
2. 削峰填谷：消息队列可以削峰填谷，避免单点故障。
3. 解耦：消息队列可以解耦应用，实现应用间的通信。

也就是说，消息队列均摊我们对任务的处理，当任务量增加时，可以自动扩容，提升系统处理能力。

## Kafka

Apache Kafka 是一种高吞吐量的分布式消息系统，它可以处理大量的数据，并提供实时的消费能力。

### 为什么选 Kafka？

大伙肯定听过很多同类MQ软件，比如RabbitMQ、RocketMQ这几个以MQ结尾的，它们才是正统吧，甚至名字都带Message Queue。为什么要选Kafka这个看起来毫不相关的呢？这就要提一提Kafka相较来说的诸多优势了。

1. 高吞吐量：Kafka可以处理大量的数据，单机支持每秒数百万的消息量。
2. 高可用：Kafka集群支持多副本，即使一个节点挂掉，也能保证消息不丢失。
3. 持久化：Kafka支持持久化，可以将消息持久化到磁盘，即使服务器重启也不会丢失消息。
4. 容错性：Kafka支持多副本，即使一个节点挂掉，也能保证消息不丢失。
5. 灵活的消费模式：Kafka支持多种消费模式，比如消费者消费模式、分区消费模式、主题消费模式等。
6. 社区活跃：Kafka有大量的社区贡献者，活跃的社区氛围，是学习Kafka的不二之选。

### Spring Boot 集成 Kafka

1. 添加依赖

这里的版本号，根据你自己的Spring Boot版本号来定。

或者更简单的，你可以在IDEA创建Spring Boot项目，项目的时候就直接添加Kafka依赖。

```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

2. 配置application.yml

```yaml
spring:
  kafka:
    bootstrap-servers: 127.0.0.1:9092 # kafka地址和端口
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
    consumer:
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
```

3. 生产者

```java
@Autowired
private KafkaTemplate<String, String> kafkaTemplate;

// topic是你要发送的消息的主题，message是你要发送的消息
public void send(String topic, String message) {
    kafkaTemplate.send(topic, message);
}
```

4. 消费者

```java
// 指定消费者监听的topic
@KafkaListener(topics = "topic")
public void receive(String message) {
    System.out.println(message);
}
```

这样，你就完成了Kafka的集成。

