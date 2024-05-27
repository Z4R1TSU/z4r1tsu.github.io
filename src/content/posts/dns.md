---
title: "DNS 协议"
description: "这是一篇关于 DNS 协议的文章。"
pubDatetime: 2024-05-27
author: Zari Tsu
featured: false
draft: false
tags:
  - Network
---

# DNS 协议

计算机网络虽然理论部分在实际应用基本不会用到，在实际开发中，我们往往掌握一些库和工程性的框架和API就可以了。但是，在面试当中，我们还是需要了解一些基础的网络知识，比如 DNS 协议。

## 域名

> DNS 协议（Domain Name System Protocol，域名系统协议）

### 域名的含义

我们知道，在网络当中，区分每个地址的唯一标识就是IP地址。但是 IPv4 和 IPv6 都是一堆难以记忆，没有什么规律的数字。所以，人们就想到一种更容易记忆的地址，就是域名。域名就是人们可以记忆的名字，比如 www.baidu.com。

### 域名的层级结构

域名的层级结构是通过点号来表示的，比如 www.baidu.com。

- 顶级域名（TLD）：比如 com，net，org，edu，mil，gov，arpa，info，biz，name，pro，aero，coop，museum。
- 二级域名（SLD）：比如 baidu，google，taobao，sina，sohu，jd，wiki，sogou，ifeng，yahoo，amazon，tmall。
- 三级域名（TLD）：比如 www，mail，blog，news，shop，wiki，doc，download，video。

## DNS

### DNS 服务器

DNS 服务器是域名解析服务的提供者，它负责把域名转换成 IP 地址。当我们输入一个域名，比如 www.baidu.com，DNS 服务器会把域名解析成 IP 地址，比如 192.168.3.11。

### DNS 协议

DNS 协议是基于 TCP/IP 协议族的，它运行在 **UDP**  端口 53 上。
*这里注意，DNS 协议是基于 UDP 协议的*

### DNS 解析的过程

比如我们要查看 `www.baidu.com` 的 IP 地址，那么 DNS 解析的过程如下：

1. 本地浏览器或应用发送解析请求给本地 DNS 服务器(解析器)。

2. DNS 服务器查询缓存，如果有缓存记录，则直接返回 IP 地址。

3. 如果本地 DNS 服务器没有缓存记录，则向 DNS 根服务器发出请求。

4. 通过根域名服务器查询到com服务器地址，得到`com`

5. 通过com域名服务器查询到baidu服务器地址，得到`baidu`

6. 通过baidu域名服务器查询到www服务器地址，得到`www.baidu.com`的IP地址。

7. 本地 DNS 服务器把 IP 地址返回给本地浏览器或应用。

## 任播

在 DNS 协议当中，有一种技术叫做任播，就是当多个 DNS 服务器同时查询同一个域名，会把请求发送到多个服务器上，然后把结果汇总返回给用户。这种技术可以提高 DNS 服务器的负载均衡能力，防止单点故障。


## 多播

在 DNS 协议当中，还有一种技术叫做多播，就是当多个 DNS 服务器同时查询同一个域名，会把请求发送到多个服务器上，但是只会返回最快的那个服务器的结果。这种技术可以减少网络拥塞，提高查询效率。