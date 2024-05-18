---
title: "Stanford CS144 lab 3"
description: "这是一篇关于 Stanford CS144 lab 3 的文章。"
pubDatetime: 2023-09-07
author: Zari Tsu
featured: false
draft: false
tags:
  - Network
---

# Stanford CS144 lab 3

这个lab的主题是实现TCP sender

> **前置要求**: 推荐不但要做完之前几个lab，还需要了解一定的TCP传输的知识，比如**滑动窗口**、**重传策略**啥的


### 超时重传

对于这个策略的搭建是这个lab的一个重要的组成部分，其中包括对时间的计数这个重要思想，还有几个概念需要明晰。

1. 