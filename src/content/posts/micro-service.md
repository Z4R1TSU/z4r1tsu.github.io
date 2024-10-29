---
title: "微服务架构设计"
description: "这是一篇关于微服务架构设计的文章。"
pubDatetime: 2024-10-27
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# 微服务架构设计

## 模块划分

在微服务架构下，我们需要大致调整一下模块的划分。首先我们创建一个Spring Boot项目，将里面的src等无用文件删除，只留pom.xml文件这种，然后再创建几个模块(Module)，如果你还需要创建子模块，那么递归地执行上述步骤即可。

一般的模块划分如下：

1. common：公共模块，比如配置类、实体类、工具类、常量等。
2. gateway：网关模块，负责请求的转发、权限控制、负载均衡等。
3. api：接口模块，负责暴露接口，供其他模块调用。
4. service：业务模块，负责具体的业务逻辑。

## pom文件

### 父pom文件

1. 最开始，我们需要先声明自己parent的身份。

    ```xml
    <groupId>com.example</groupId>
    <artifactId>microservice-parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    ```

2. 为了版本管理的便捷性和一致性，我们需要声明依赖管理。

    ```xml
    <properties>
        <java.version>1.8</java.version>
        <maven.plugin.version>3.8.1</maven.plugin.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>

        <spring.boot.version>2.7.1</spring.boot.version>
        <spring.cloud.version>2021.0.3</spring.cloud.version>
        <spring.platform.version>Cairo-SR8</spring.platform.version>

        <docker.registry.url>192.168.0.157</docker.registry.url>
        <docker.registry.host>http://${docker.registry.url}:2375</docker.r  egistry.host>
        <docker.username>admin</docker.username>
        <docker.password>Harbor12345</docker.password>
        <docker.namespace>blade</docker.namespace>
        <docker.plugin.version>1.4.13</docker.plugin.version>
    </properties>
    ```

3. 我们还需要指定自己子模块的名称。

    ```xml
    <modules>
        <module>common</module>
        <module>gateway</module>
        <module>api</module>
        <module>service</module>
    </modules>
    ```

4. 接着就是**dependencyManagement**，声明依赖的版本，这些依赖会被继承到子模块中。

    1. 这里的scope被设置为`import`，代表父模块和子模块都依赖这个依赖。当子模块需要这些依赖时，仍然需要显式声明，但是不需要版本号。
    2. scope为`compiled`（默认）：这个项目在编译、测试、运行阶段都需要这个JAR包在classpath中。
    3. scope为`provided`：可以认为要运行的目标容器已经provide这个依赖，无需我们再打包进去，也就是说，它仅仅影响到编译和测试，而不会影响到运行。
    4. scope为`runtime`：这个依赖仅仅在运行时需要，编译时不需要。
    5. scope为`test`：这个依赖仅仅在测试时需要，编译和运行时不需要。

    ```xml
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring.cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    ```

5. 对于非公共依赖，仅仅只在父模块用到的，我们还需要独立声明。

    ```xml
    <dependencies>
        <dependency>
            <groupId>orj.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    ```

6. 定义项目的构建过程。
   1. `<resources>`: 用于配置项目资源文件的处理。src/main/resources 目录下的所有文件会被打包到最终的 JAR 包中。src/main/java 目录下的所有 .xml 文件也被打包到 JAR 包中。
   2. pluginManagement: 用于配置插件的管理。

    ```xml
    <build>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
            </resource>
            <resource>
                <directory>src/main/java</directory>
                <includes>
                    <include>**/*.xml</include>
                </includes>
            </resource>
        </resources>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                    <version>${spring.boot.version}</version>
                    <configuration>
                        <fork>true</fork>
                        <finalName>${project.build.finalName}</finalName>
                    </configuration>
                    <executions>
                        <execution>
                            <goals>
                                <goal>repackage</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
    ```

### 子模块pom文件

1. 声明父pom文件。

    什么时候需要声明relativePath？当子模块和父模块在同一个项目中时，relativePath可以省略。

    ```xml
    <parent>
        <artifactId>microservice-parent</artifactId>
        <groupId>com.example</groupId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>
    ```

2. 声明自己。

    ```xml
    <artifactId>common</artifactId>
    <name>{project.artifactId}</name>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    ```

3. 声明依赖。

    虽然子模块仍需显式声明父模块已经在 dependencyManagement 中声明的依赖，但是由于父模块起到的版本集中管理的职能，所声明的依赖不需要带上版本号。
