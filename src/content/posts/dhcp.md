---
title: "DHCP 协议"
description: "这是一篇关于 DHCP 协议的文章。"
pubDatetime: 2024-05-27
author: Zari Tsu
featured: false
draft: false
tags:
  - Network
---

# DHCP

## 介绍

DHCP（Dynamic Host Configuration Protocol）是一种局域网的网络协议，它允许主机自动获取IP地址、子网掩码、网关地址、DNS服务器地址等网络配置参数，使得用户无需手动配置，从而简化了网络配置工作。

## 步骤

1. DHCP discover 广播

    主机发送广播包，目的地址为 255.255.255.255，源地址为 0.0.0.0，源端口为 68，目的端口为 67，并携带 DHCP discover 消息。

    * 在自己家里，一般这个广播包会被路由器接收到，然后转发给 DHCP server。

2. DHCP offer 响应

    DHCP server 接收到 DHCP discover 消息后，会发送 DHCP offer 消息，包含 IP 地址、子网掩码、网关地址、DNS 服务器地址等网络配置参数。

3. DHCP request 确认

    主机接收到 DHCP offer 消息后，会发送 DHCP request 消息，包含自己的 MAC 地址、IP 地址、子网掩码、网关地址、DNS 服务器地址等网络配置参数。

4. DHCP ack 确认

    DHCP server 接收到 DHCP request 消息后，会发送 DHCP ack 消息，确认 IP 地址、子网掩码、网关地址、DNS 服务器地址等网络配置参数。