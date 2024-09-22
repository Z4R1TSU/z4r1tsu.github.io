---
title: "JWT 用户登录系统实现"
description: "这是一篇关于 JWT 用户登录系统 的文章，cpp转java实录。包括了JWT的原理、实现、以及如何使用。"
pubDatetime: 2024-09-20
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# JWT 用户登录系统实现

首先，还是提一下session和token的概念。分别对应有状态和无状态的登录，最大的区别就在于服务器的无状态就是服务器端不保存任何客户端请求者信息，每一次请求都需要客户端自述自证其身份。那么这里聊聊使用token的无状态登录。

其登录流程也比较简单直观:  
1. 客户端首次登录，服务端进行用户信息认证和校验
2. 认证通过，服务器生成token并返回给客户端，token一般包含用户信息，有效期等信息
3. 用户token会被保存在redis中，用来验证用户身份
4. 客户端每次请求都携带token
5. 服务端通过Authorization头部获取token，解密并验证token的有效性，返回数据

再来聊聊注册的逻辑:  
1. 客户端发送注册请求，服务端校验数据是否合法合理
2. 服务器保存用户信息，包括用户名，加密后的密码，头像，创建日期，是否被删除，是否为管理员等

## Q&A

1. 如何获取用户请求携带的token？如何解析token？如何根据token的合法性判别用户的登录状态？

    1. 通过请求头中获取Authorization字段，然后解析token。解析token的过程可以用jwt工具类来实现。
        ```java
        public Result getTokens(@RequestHeader("Authorization") String token) {
            // 这样就可以通过参数的形式操作token了
        }
        ```
    2. 使用拦截器判断用户是否登录，并从token中获取用户信息。
        ```java
        @Component
        public class LoginInterceptor implements HandlerInterceptor {

            @Resource
            private JWTUtil jwtUtil;

            @Resource
            private RedisUtil redisUtil;

            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                if (!(handler instanceof HandlerMethod)) {
                    return true;
                }

                HandlerMethod handlerMethod = (HandlerMethod) handler;
                RequireLogin requireLogin = handlerMethod.getMethodAnnotation(RequireLogin.class);
                if (requireLogin == null) {
                    requireLogin = handlerMethod.getBeanType().getAnnotation(RequireLogin.class);
                }

                if (requireLogin == null) {
                    return true; // 不需要登录验证
                }

                String token = request.getHeader("Authorization");
                if (StrUtil.isBlankIfStr(token)) {
                    response.sendRedirect("/login");
                    return false;
                }

                JWTUtil.TokenValidationResult result = jwtUtil.validateToken(token);
                if (!result.isValid()) {
                    response.sendRedirect("/login");
                    return false;
                }

                String username = jwtUtil.parseToken(token).getStr("username");
                Object storedToken = redisUtil.get(Constants.REDIS_LOGIN_TOKEN_PREFIX + username);
                if (storedToken == null || !token.equals(storedToken.toString())) {
                    response.sendRedirect("/login");
                    return false;
                }

                return true;
            }
        }
        ```

2. jwt工具类怎么写？

    首先我们需要知道，基本三个接口就够用了，生成token，验证token，以及解析token（获取token中的信息）。我们可以自己用jwt库实现，也可以用hutool的工具类。

3. 如何防止未登录用户访问受保护的资源？登录后如何跳转页面？

    这个问题就是重定向，我们可以加一个登录拦截器，用来拦截用户未登录的请求，并重定向到登录页面；在登录成功后，跳转到某个页面。详见问题1的解答代码。
