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

## 任播

在 DNS 协议当中，有一个概念叫做任播，就是当多个 DNS 服务器同时查询同一个域名，会把请求均匀分发到多个服务器上，然后把结果汇总，返回给用户。因为服务器少，节点多，可能有多个服务器拥有同一个我们需要的节点。那么，任播技术就是可以找到最快最近最畅通的那个服务器，然后对它进行查询。这样做的好处是可以提高查询效率，减少网络拥塞。

## DNS

### DNS 服务器

DNS 服务器是域名解析服务的提供者，它负责把域名转换成 IP 地址。当我们输入一个域名，比如 www.baidu.com，DNS 服务器会把域名解析成 IP 地址，比如 192.168.3.11。

## DNS 协议

DNS 协议是基于 TCP/IP 协议族的，它运行在 UDP 端口 53 上。

