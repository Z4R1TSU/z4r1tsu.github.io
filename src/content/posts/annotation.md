---
title: "Annotation 注解"
description: "这是一篇关于 Spring Boot 注解的笔记。cpp转java实录。"
pubDatetime: 2024-07-14
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# Spring Boot 常用注解

目前刚入手，也不会ssm的bean那套，听说spring boot只需要会用类的注解就可以，不需要在xml里面配置bean，所以就记录一下常用的注解。资料来自于[JavaGuide](https://javaguide.cn/system-design/framework/spring/spring-common-annotations.html)

1. @SpringBootApplication
这个注解是SpringBoot的核心注解，可以标注在启动类上(会默认加在主类上)，SpringBoot会自动扫描该类所在的包及其子包下所有的类。并且这玩意由三个注解组合而成：
   1. @EnableAutoConfiguration：启用 SpringBoot 的自动配置机制
   2. @ComponentScan：扫描被@Component (@Repository,@Service,
   @Controller)注解的 bean，注解默认会扫描该类所在的包下所有的类。
   3. @Configuration：允许在 Spring 上下文中注册额外的 bean 或导入其他配置类

2. @Autowired  
加在类的method上，通过容器自动注入bean。当然如果某个类基本都被加@Autowired，那么可以直接加在类上。

3. @Component,@Repository,@Service, @Controller  
@Component：通用的注解，标记某个代码段使得容器可以扫描到它，从而策成为 Spring 组件。如果一个 Bean 不知道属于哪个层，可以使用`@Component` 注解标注。  
@Repository : Dao 层，数据库相关操作。  
@Service : 对应服务层，主要涉及一些复杂的逻辑，需要用到 Dao 层。   
@Controller : 对应 Spring MVC 控制层，主要用于接受用户请求并调用 Service 层返回数据给前端页面。

4. @RestController (@Controller + @ResponseBody)  
@RestController 注解相当于 `@Controller` 和 `@ResponseBody` 注解的组合，可以将返回值直接写入 HTTP 响应体中。现在很少裸用@Controller，一般都是用@RestController。

5. Scope  
`@Scope` 注解用于指定 Spring Bean 的作用域(生命周期)，共有以下几种：
   * singleton：单例模式，Spring 容器中只会存在一个 Bean 实例。
   * prototype：原型模式，每次调用getBean()方法时，都会返回一个新的 Bean 实例。
   * request：请求作用域，每个 HTTP 请求都会产生一个新的 Bean 实例，仅适用于 Web 应用。
   * session：会话作用域，每个 HTTP 会话都会产生一个新的 Bean 实例，仅适用于 Web 应用。
   * global-session：全局会话作用域，一般用于 Portlet 应用。
   * websocket：WebSocket 作用域，每个 WebSocket 会话都会产生一个新的 Bean 实例，仅适用于 WebSocket 应用。

6. @Configuration  
`@Configuration` 注解用于将类声明为 Spring 配置类，可以用来注册 Bean。也可以用`@Component`代替。

7. HTTP 请求
   1. 总结来说 Get获取特定数据，Post创建新数据，Put更新数据，Delete删除特定数据。
   2. `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`  
   这几个注解用于映射 HTTP 请求方法和 URL。
    3. @PathVariable  
   用于绑定 URL 路径参数到方法参数。
    4. @RequestParam  
   用于绑定请求参数到方法参数。
    5. @RequestBody  
   用于绑定请求体中的 JSON 数据到方法参数。
    6. @RequestHeader  
   用于绑定请求头信息到方法参数。

8. 读取配置信息
   1. @Value  
   用于读取简单的配置信息
   2.  @ConfigurationProperties  
   用于读取复杂的配置信息，将配置文件中的属性映射到 bean 的属性上。

9. 校验
   1.  `@NotNull` 被注释元素不能为null
   2.  `@NotEmpty` 被注释的字符串不能为空
   3.  `@NotBlank` 被注释的字符串不能为空并且必须包含一个非空白字符
   4.  `@Email` 被注释的字符串必须是有效的电子邮件地址
   5.  `@Pattern` 被注释的字符串必须匹配指定的正则表达式, 
   6.  `@Positive` 被注释的元素必须是一个正数
   7.  `@Max(value)` 被注释的元素必须小于等于value
   8.  `@Min(value)` 被注释的元素必须大于等于value
   9.  `@DecimalMax` `@DecimalMin` 类似同上
   10. `@Size(max=, min=)` 被注释的元素的大小必须在min和max之间
   11. `@Past` 被注释的元素必须是一个过去的日期
   12. `@Future` 被注释的元素必须是一个将来的日期
   13. `@PastOrPresent` `@FutureOrPresent` 同上
   14. `@Range` 被注释的元素必须在指定的范围内
   15. `@Valid` 被注释的元素必须是一个合法的对象
   16. `@Validated` 被注释的元素必须是一个合法的对象，并且应用 Bean Validation 验证规则

10. JPA (Java Persistence API) 即数据库相关
    1.  `@Entity`声明一个类对应一个数据库实体。
    2.  `@Table` 设置表名
    3.  `@Id` 设置主键
    4.  `@GeneratedValue` 设置主键生成策略，如AUTO(数据库默认), IDENTITY(数据库自增长), SEQUENCE(序列), TABLE(通过特定的表)
    5.  `@Column` 设置列名和类型
    6.  `@Transient` 声明属性不映射到数据库表
    7.  `@Lob` 声明一个大字段，比如图片、视频等
    8.  `@enumerated` 设置枚举类型
    9.  `@Transacional` 声明事务，具体用来配置事务传播属性。

11. 测试
12. `@ActiveProfiles` 作用于测试类种，用于指定激活的配置文件，默认使用 application.properties。
13. @Test 作用于测试方法，对一个method进行测试声明，用于声明测试用例。
14. @Transactional 作用于方法上，声明一个事务，用于测试事务相关的操作。
15. @WithMockUser 作用于测试类上，用于模拟用户登录，可以指定用户名、密码、角色等。