---
title: "单调栈"
description: "这是一篇关于 单调栈 的文章。"
pubDatetime: 2024-09-29
author: Zari Tsu
featured: false
draft: false
tags:
  - Alogorithm
---

# 单调栈

先进先出且结构内元素符合单调性的数据结构被称为单调栈。

一般这种数据结构会被用于解决比如，对于数组内每个元素的下一个更大的元素这样的问题。

一般为了维护一个从栈底到栈顶单调递增的单调栈，有这样的思路：

```python
# 依次弹出过大的元素，使得栈内元素全都小于要插入的x
while stack and stack[-1] > x:
    stack.pop()
stack.append(x)
```
