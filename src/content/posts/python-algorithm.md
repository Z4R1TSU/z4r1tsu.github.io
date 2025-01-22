---
title: "Python的输入处理"
description: "这是一篇关于使用 Python 进行面试中的手撕部分时，涉及到的 处理输入输出 的文章。"
pubDatetime: 2025-01-22
author: Zari Tsu
featured: false
draft: false
tags:
  - Algorithm
  - Interview
---

# Python 的输入处理

面试中的手撕——算法题或者是设计题，采用的是 ACM 的形式，即自己处理输入输出。而我们这些在力扣舒适圈待久了的人，这其实是比较陌生的，为了上战场时候的懵逼，我准备先演习一遍。

## 主要函数

### 从标准输入读取

1. **input()**: 
   [https://docs.python.org/3/library/functions.html#input](https://docs.python.org/3/library/functions.html#input)
    这个是我们最常用的用于处理单行输入的函数，注意返回值是 `str` 类型（即别忘了做类型转换），也是我最推荐的万能处理方法。括号里面输入一个字符串，用来在输入前，提示用户输入。
2. **sys.stdin.readline()**:  
    类似 `input()`，需要 import `sys` 模块，这个函数是从标准输入中读取一行，并返回 `str` 类型。
3. **sys.stdin.readlines()**:  
    这个函数是从标准输入中读取所有行，并返回一个 `list` 类型，每个元素是一行的 `str`。

### 字符串处理

1. **split()**:  
   [https://docs.python.org/3/library/stdtypes.html#str.split](https://docs.python.org/3/library/stdtypes.html#str.split)  
   这个函数是用来分割字符串的，默认是以空格为分隔符，返回一个 `list` 类型。括号里面加 `','` 也可以以逗号来分割字符串。
2. **strip()**:  
   [https://docs.python.org/3/library/stdtypes.html#str.strip](https://docs.python.org/3/library/stdtypes.html#str.strip)  
   这个函数是用来去除字符串两端的空格或换行符，返回一个 `str` 类型。括号里面可以加参数来指定去除哪些字符。
3. **replace(old, new)**:  
   [https://docs.python.org/3/library/stdtypes.html#str.replace](https://docs.python.org/3/library/stdtypes.html#str.replace)  
   这个函数是用来替换字符串中的子串，返回一个 `str` 类型。括号里面第一个参数是被替换的子串，第二个参数是替换成的子串。
4. **isdigit()**:  
   [https://docs.python.org/3/library/stdtypes.html#str.isdigit](https://docs.python.org/3/library/stdtypes.html#str.isdigit)  
   这个函数是用来判断字符串是否只包含数字，返回 `True` 或 `False`。
5. **isnumeric()**:  
   [https://docs.python.org/3/library/stdtypes.html#str.isnumeric](https://docs.python.org/3/library/stdtypes.html#str.isnumeric)  
   这个函数是用来判断字符串是否只包含数字和 `.`，返回 `True` 或 `False`。

## 单行

### int

首先是对于 int 类型的处理，比如这个需求

```txt
1️⃣ '1 22 333 4444 55555' -> [1, 22, 333, 4444, 55555]
2️⃣ '1, 22, 333, 4444, 55555' -> [1, 22, 333, 4444, 55555]
3️⃣ '    1  ,  22, 333  ,4444, 55555  ' -> [1, 22, 333, 4444, 55555]
```

1. 那么对于第一个用空格分割的需求我们可以 `line = list(map(int, input().strip().split()))`
2. 对于第二和第三个用逗号分割的需求，我们可以 `line = list(map(int, input().strip().split(',')))`

### str

需求如下

```txt
1️⃣ '1 22 333 4444 55555' -> ['1', '22', '333', '4444', '55555']
2️⃣ '   1, 2   2, 333   , 4444 , 5555 5  ' -> ['1', '2   2', '333', '4444', '5555 5']
3️⃣ '...Q....' -> ['.', '.', '.', 'Q', '.', '.', '.']  // 类似N皇后的输入处理
```

1. 对于第一个用空格分割的需求，我们可以 `line = list(map(str, input().strip().split()))`
2. 对于第二个用逗号分割的需求，我们可以 `line = list(map(str.strip, input().strip().split(',')))`
3. 对于第三个需求，我们可以 `line = list(input())`

## 多行

多行其实就是加个循环就可以了，单行处理都是同上的，一般它也被分为两种。

1. 输入一个 m 行 n 列的矩阵，这里以处理成 `List[List[int]]` 的形式为例。

```python3
m, n = map(int, input().split())
matrix = [list(map(int, input().strip().split())) for _ in range(m)]
```

2. 处理未知行数的矩阵

```python3
matrix = []
while True:
    line = input().strip()
    if line == '':
        break
    matrix.append(list(map(int, line.split())))
```
