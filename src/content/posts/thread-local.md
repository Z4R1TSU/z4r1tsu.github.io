---
title: "ThreadLocal"
description: "这是一篇关于 ThreadLocal 的文章。讲讲Java当中是如何利用 ThreadLocal 来保存当前用户信息的"
pubDatetime: 2024-10-02
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# ThreadLocal

之前我们聊了如何利用JWT实现单点登录。它先验证用户发过来的登录请求体（一般由账号、密码、验证码组成），验证成功后返回给客户端一个token（也称令牌）。接着客户端每次请求都带上这个token，服务器端收到请求后验证token，具体在拦截器中对token进行操作，通过`HttpServletRequest`类请求的`header`的`Authorization`字段获取token，再经过验证和解析，从而得到用户信息。

但在实际开发中，我们可能还需要保存一些用户信息，比如当前登录的用户信息、当前请求的用户信息等。这些信息一般都是与线程绑定的，比如在一个线程中，我们需要保存当前登录的用户信息，那么其他线程就无法获取到这个信息。

## 特点

首先我们需要知道，ThreadLocal 是一个基于线程本地存储和线程隔离的，防止线程间对共享资源的竞争，而为每个线程提供自己单独的实例副本的机制。

它不同于锁，最终目的是需要控制同一时间只有一个线程在操作共享资源，锁的特点是这个资源的共享性，即这个资源可以被多个线程同时获取。而 ThreadLocal 的特点是这个资源仅仅只能被一个线程获取。

它内部是由一个 ThreadLocalMap 维护的，ThreadLocalMap 是一个 Map，其中 key 为 ThreadLocal 对象，value 为线程要存入的局部变量。每个线程都有自己的 ThreadLocalMap，ThreadLocalMap 存储了线程的局部变量，并且每个线程只能访问自己的 ThreadLocalMap。

## 为什么要用 ThreadLocal

因为在token里面我们仅仅保存了用户的身份信息，而用户的其他信息（比如登录时间、登录IP、登录设备等）都需要我们查询数据库所得，如果每次都要查询数据库，势必会影响效率。所以我们需要利用ThreadLocal来保存这些信息，这样对于每个用户的多次操作，我们都只需要查询以此数据库即可。

## ThreadLocal的使用

### 创建工具类

首先我们可以先创建一个通用的工具类专门用来处理线程级别的用户信息，然后在需要保存的地方创建一个`ThreadLocal`对象，并将需要保存的信息保存到这个对象中。

这里插一句这个`User`类自己设计根据需求来将需要的用户信息封装到这个类中。

```java
public class UserContextHolder {

    private static final ThreadLocal<User> userThreadLocal = new ThreadLocal<>();

    public static void set(User user) {
        userThreadLocal.set(user);
    }

    public static User get() {
        return userThreadLocal.get();
    }

    public static void clear() {
        userThreadLocal.remove();
    }

}
```

### 配置拦截器

通过对request请求解析获取用户名，然后根据用户名查询数据库获取用户信息，并将用户信息保存到`ThreadLocal`中。

```java
@Component
public class UserInterceptor implements HandlerInterceptor {

    @Resource
    private UserService userService;

    @Resource
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 从请求头中的Authorization获取token
        String token = request.getHeader("Authorization");
        // 验证token
        if (!jwtUtil.validateToken(token)) {
            return false;
        }
        // 解析token获取用户名
        String username = jwtUtil.parseToken(token);
        // 根据用户名查询数据库获取用户信息
        User user = userService.findByUsername(username);
        // 将用户信息保存到ThreadLocal中
        UserContextHolder.set(user);
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        UserContextHolder.clear();
    }

}
```

### 添加配置类

添加ThreadLocal拦截器到SpringMVC的拦截器链中。注册使其生效。

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Resource
    private UserInterceptor userInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userInterceptor).addPathPatterns("/**");
    }

}
```

### 查看用户信息

那么在需要查看用户信息的地方，我们只需要通过`UserContextHolder`工具类来获取即可。

```java
@RestController
public class UserController {

    @GetMapping("/user")
    public User getUser() {
        User user = UserContextHolder.get();
        return user;
    }

    @PostMapping("/login")
    public String login(String username, String password) {
        // 省略登录验证逻辑
        // 登录成功后，生成token并返回
        String token = jwtUtil.generateToken(username);
        return token;
    }

    @PostMapping("/logout")
    public void logout() {
        UserContextHolder.clear();
    }

    // 省略其他业务逻辑

}
```

## 多线程下的ThreadLocal

多线程下的ThreadLocal是线程隔离的，每个线程都有自己的ThreadLocalMap，ThreadLocalMap是以ThreadLocal为key，以Object为value的Map。

所以我们需要考虑，如果主线程获取到了当前的用户信息，那么如何在子线程中也能获取到这个信息呢？

我们需要一个装饰器来解决这个问题。

```java
public class UserContextDecorator implements TaskDecorator {

    @Override
    public Runnable decorate(Runnable runnable) {
        User user = UserContextHolder.get();
        return () -> {
            try {
                UserContextHolder.set(user);
                runnable.run();
            } finally {
                UserContextHolder.clear();
            }
        };
    }

}
```
