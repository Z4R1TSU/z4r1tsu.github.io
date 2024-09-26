---
title: "区间问题"
description: "这是一篇关于 Intervals 算法的文章。看看笔试题中常常出现的类似合并区间等问题。"
pubDatetime: 2024-09-22
author: Zari Tsu
featured: false
draft: false
tags:
  - Alogorithm
---

# 区间问题

一般模板都是这样

```python
def merge_intervals(intervals: List[List[int]]) -> List[List[int]]:
    # 注意这个排序有讲究的，要按照左端点排序
    intervals.sort(key = lambda x: x[0])
    res = []
    last_start, last_end = intervals[0][0], intervals[0][1]
    for x, y in intervals:
        if x <= last_end:
            last_end = max(last_end, y)
        else:
            res.append([last_start, last_end])
            last_start, last_end = x, y
    res.append([last_start, last_end])
    return res
```
