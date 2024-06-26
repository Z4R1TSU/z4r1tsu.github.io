---
title: "HTTP 协议"
description: "这是一篇关于 HTTP 协议，以及其工作原理的文章。"
pubDatetime: 2024-05-28
author: Zari Tsu
featured: false
draft: false
tags:
  - Network
---

# HTTP 协议

## 介绍

HTTP（Hypertext Transfer Protocol）即超文本传输协议，是用于从 Web 服务器传输超文本到本地浏览器的协议。它是基于 TCP/IP 协议的应用层协议。HTTP 协议是无状态的，也就是说，对于同一个连接，客户端和服务器之间不需要建立持久的连接。

## HTTP/1.1

互联网第一个真正意义上的HTPP标准版本。

它比较落后，因为每一次响应，都得等到完全收到对方的响应之后，才会发出下一步自己的报文。所以说，只有一个连接的影响就是速度很慢，容易造成队头阻塞。

比如说: 
1. 客户端向服务器发送请求报文，请求服务器资源。
2. 经过传输，服务器收到请求报文后，向客户端发送响应报文，响应请求。
3. 客户端收到响应报文后，开始显示服务器资源。

虽然之后出现了很多为了应对“只有一个连接”劣势的解决方案，但是HTTP/1.1显然还是落后的。

## HTTP/2

为了解决HTTP/1.1的队头阻塞问题，HTTP/2使用了多路复用技术，允许多个请求同时通过一个TCP连接。使得单个连接上可以并行处理多个请求，极大地提高了传输性能。

1. 客户端和服务器之间建立一个TCP连接。
2. 客户端发送一个包含多个请求的报文，每个请求都包含一个流标识符。
3. 服务器收到请求报文后，根据流标识符将请求分发给不同的处理线程。
4. 服务器将响应报文分发给对应的请求线程。
5. 客户端收到响应报文后，根据流标识符将响应合并，然后显示给用户。

这个就很像TCP传输，TCP reassembler重排器的作用，也是将无序数组通过类似流标识符的机制，重新组装成有序的报文。

HTTP/2的多路复用技术使得一个TCP连接上可以并行处理多个请求，极大地提高了传输性能。


## HTTP/3

HTTP/3是HTTP的最新版本，主要解决了HTTP/2的一些问题，比如连接建立时间长，TCP层面的队头阻塞和数据重传等。

HTTP/3的主要改进点：

1. 新的二进制格式：HTTP/3使用新的二进制格式，可以更有效地利用网络资源。
2. 多路复用：HTTP/3使用多路复用技术，可以同时发送多个请求，而不用等待响应。
3. 加密传输：HTTP/3使用加密传输，可以防止数据被窃听或篡改。
4. 服务器推送：HTTP/3可以让服务器主动向客户端推送资源，而不需要客户端明确请求。

几大特点: 
1. 整合: HTTPP/3把TCP和TLS的握手整合在一起，使得连接建立更加快速，减少了延迟。对于恢复的会话，甚至不需要重新建立连接。
2. QUIC协议：QUIC协议是一种新的传输层协议，旨在解决TCP协议的一些问题，比如在连接不稳定或者改变的情况下，仍然可以通过双方的协定，识别连接避免重复握手。

<br>

HTTP/2 | HTTP/3
:-: | :-:
TLS | QUIC
TCP | UDP
IP | IP