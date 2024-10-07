---
title: "网关"
description: "这是一篇关于 Java网关 的文章。"
pubDatetime: 2024-10-06
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# 网关

在微服务当中，如果我们没有网关就很容易出现两大问题。一个是服务地址过多和变化性，导致前端不知道向谁请求；另一个就是每个服务可能都需要登录用户信息，分开登录可能造成泄露或者一致性的问题。

## 网关定义

网关（Gateway）是介于客户端和后端服务之间的一个服务器，它负责接收客户端的请求，并将请求转发给后端的服务。它是网络的关口，负责请求的路由、转发和身份校验。

我们当微服务中的子服务为一个集合，如果有外界请求其中某个服务，势必要经过作为把门的网关。

而网关首先会确认请求要访问或请求的对象，确认是在本微服务集合中继续；下一步外来者自报身份，用于向网关确认自己的身份；外来者再给出身份校验的证据，验证身份成功，网关再将请求转发给相应的服务。

那假如说一个子服务出现了多个实例，那其实也不怕。网关会在初始化的时候，从注册中心拉去服务，而注册中心会将服务实例的地址都注册到网关，那么网关在路由转发请求的时候，也可以做到负载均衡。

所以，当我们有了网关之后，前端再也不用操心要具体发送给哪个子服务了，只需要向网关发送请求，网关再根据请求的路径和参数，将请求转发给相应的子服务，并将结果返回给前端。

而网关呢默认集成在了Spring Cloud体系当中，默认的就是Spring Cloud Gateway。它是Spring官方出品的，基于WebFlux和Netty的异步非阻塞框架响应式编程模型，可以帮助我们快速搭建微服务架构中的API网关。

## 网关使用

1. 创建新模块

    一般命名为gateway有关的名字，专门用来存放网关的启动类，配置文件，路由规则等。

2. 引入依赖

    ```xml
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    ```

3. 配置application.yml

    > 注意！！！配置文件中id和nacos项目名称**不能**带下划线！！！

    注意点：`URL`其实是`URI`的子集，我们在uri模块就填写服务名称，而predicate中的path我们就去controller里面找那个路径。

    ```yaml
    spring:
    cloud:
        gateway:
        routes:
            - id: service-a # 路由的唯一标识，建议和微服务名保持一致
            uri: lb://service-a # 微服务的地址，lb代表负载均衡，后面跟微服务名
            predicates: # 路由的匹配条件，符合则路由到目标
                - Path=/service-a/** # 匹配路径，这里是匹配以/service-a开头的请求
            - id: service-b
            uri: lb://service-b
            predicates:
                - Path=/service-b/**
    ```

4. 编写启动类

    ```java
    @SpringBootApplication
    @EnableDiscoveryClient
    @EnableCircuitBreaker
    public class GatewayApplication {
        public static void main(String[] args) {
            SpringApplication.run(GatewayApplication.class, args);
        }
    }
    ```

5. 创建路由规则

    我们在gateway模块下创建application.yml文件，然后在里面配置路由规则。

    ```yaml
    server:
      port: 8080 # 网关的端口号
    spring:
      application:
        name: gateway # 应用名称
      cloud:
        nacos:
            server-addr: 127.0.0.1:8848 # 注册中心地址
        gateway:
          routes:
            - id: service-a # 路由的唯一标识，建议和微服务名保持一致
              uri: http://localhost:8081 # 微服务的地址，这里是直接访问微服务
              predicates: # 路由的匹配条件，符合则路由到目标
                - Path=/service-a/** # 匹配路径，这里是匹配以/service-a开头的请求
            - id: service-b
              uri: http://localhost:8082
              predicates:
                - Path=/service-b/**
    ```

    这里的uri是直接访问微服务，所以我们需要在微服务的启动类上添加注解`@EnableDiscoveryClient`，让微服务注册到注册中心。

6. 登录校验

    登录校验的实现一般都是通过网关的过滤器，我们可以自定义过滤器，在网关中对请求进行处理。

    ```java
    @Component
    public class MyFilter implements GlobalFilter, Ordered {
        @Override
        public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
            // 自定义过滤器的逻辑
            return chain.filter(exchange);
        }

        @Override
        public int getOrder() {
            // 数值越小，优先级越高
            return 0;
        }
    }
    ```

    然后在配置文件中配置自定义过滤器。

    ```yaml
    server:
      port: 8080 # 网关的端口号
    spring:
      application:
        name: gateway # 应用名称
      cloud:
        nacos:
            server-addr: 127.0.0.1:8848 # 注册中心地址
        gateway:
          routes:
            - id: service-a
              uri: http://localhost:8081
              predicates:
                - Path=/service-a/**
              filters: # 自定义过滤器
                - MyFilter
    ```

## 总结

总的来说，网关在微服务项目中起到的作用就是路由转发，负载均衡。它让前端和多个子服务之间混乱的通讯变的清晰和可控。

而对于用户登录校验，最推荐的方案还是JWT单点登录。但在微服务的背景之下，我们需要将单体架构中的拦截器替换为网关的过滤器，毕竟拦截器只对于单个服务起作用，而网关可以拦截所有请求。
