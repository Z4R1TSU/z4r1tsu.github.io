---
title: "Spring Boot整合knife4j"
description: "这是一篇关于Spring Boot整合knife4j的文章。"
pubDatetime: 2024-09-14
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# Spring Boot整合knife4j

最近在开发新项目，在整合Swagger的时候出现了很多问题，踩了很多坑，特此记录一下。

首先最需要提的springfox这个其实已经过时了，从Maven Repository上次更新就可以看出，swagger已经停止更新了四年之久。

而网上比如去搜swagger的使用，比如国内经常鼓吹的StackOverFlow网站，上面就说了让我们去用springfox-boot-starter这个依赖，但是它仍然不是一个较好的解决方案。而且比如我使用的是阿里云的仓库，出于国内直连网速的限制，阿里云的maven仓库甚至没有新的(3.0.0)版本的swagger2。

所以我开始探索，现在的主流方案是怎么样的。先叠个甲，还是有很多公司在用swagger的老版本，那当然是可以用的，还有些公司可能直接用apifox，我也觉得蛮好用的。

### 官方文档

其实Knife4j的官方文档写的挺详细的，挺不错的。[quick-start](https://doc.xiaominfo.com/docs/quick-start)

### 引入依赖

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>4.4.0</version>
</dependency>
```

### 配置application.yml

```yaml
# springdoc-openapi项目配置
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
  api-docs:
    path: /v3/api-docs
  group-configs:
    - group: 'default'
      paths-to-match: '/**'
      packages-to-scan: com.xiaominfo.knife4j.demo.web
# knife4j的增强配置，不需要增强可以不配
knife4j:
  enable: true
  setting:
    language: zh_cn
```

### 编写Controller

大概规则就是在Controller类上加注解`@Tag(name = "xxx")`用来注释类，在类内方法上加注解`@Operation(summary = "xxx")`用来注释方法，然后在类内方法上加注解`@Parameter(name = "xxx", description = "xxx", in = ParameterIn.QUERY/path, required = true)`用来注释参数。

### 启动项目

1. 先启动我们的Spring Boot项目，默认端口是8080。
2. 访问http://localhost:8080/swagger-ui.html，可以看到Swagger的页面。这个是我们在application.yml中配置的路径。
3. 点击接口，可以看到接口的详细信息。

### 踩坑记录

1. 如果出现依赖问题，则`mvn clean install`清一下nexus缓存。还不行，则清一下IDEA的缓存，运行`File -> Invalidate Caches / Restart...`来清理缓存、重启项目。如果还不行，就直接把maven本地的依赖全部整个删除，重装整个项目的依赖。
2. swagger3.0.0已不再维护，别用。至于网上说的，什么wagger-ui和swagger二合一的解决方案，别试。
3. swagger2.10.x版本的`@EnableSwagger2`注解被废弃了，改成`@EnableSwagger2WebMvc`注解。
