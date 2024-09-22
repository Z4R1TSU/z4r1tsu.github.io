---
title: "滑动窗口"
description: "这是一篇关于 sliding window 算法的文章。看看笔试题中常常出现的滑动窗口算法的套路。"
pubDatetime: 2024-09-22
author: Zari Tsu
featured: false
draft: false
tags:
  - Alogorithm
---

# 滑动窗口

一般对于任何题目，都有这样一个模板

```python
def sliding_window(nums: List[int], k: int):
    # 这里的输入k也可以是别的什么条件，反正滑动窗口的题目，就是要保证窗口内的元素满足某种条件
    n = len(nums)
    i = 0 # 窗口左边界
    s = 0 # 窗口内元素的某个条件
    res = inf # 结果是最长超过k的子数组的长度
    # 窗口右边界 x = nums[j]
    for j, x in enumerate(nums):
        s += x # 更新窗口内元素
        while <窗口内元素符合条件>:
            res =  # 更新结果
            s -= nums[i] # 窗口左边界右移，直到窗口内元素不满足条件
            i += 1
    return res if res != inf else -1
```

对于需要hash的题目，如果你坚持用`dict()`或者`{}`做，那么你可以这样初始化

```python
d = {} # d = dict()
for c in s:
    d[c] = d.get(c, 0) + 1
```

或者你可以用`defaultdict()`或者`collections.Counter()`，这样就不需要考虑初始化的问题

```python
buf = defaultdict(int)
buf = Counter(s)
```
