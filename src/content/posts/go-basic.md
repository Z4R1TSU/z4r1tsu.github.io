---
title: "Go Basic"
description: "这是一篇关于 Go Basic 的文章，主要来聊聊 Go 的基础知识和类型语法。"
pubDatetime: 2025-02-25
author: Zari Tsu
featured: false
draft: false
tags:
  - Go
---

# Go Basic

Golang 是由 Google 开发的，一门注重性能的静态强类型语言。其显著特点有这几点：变量名在前而变量类型在后；强调高性能和轻量（goroutine协程提供高效的并发能力）；基于 Go Modules 的项目依赖管理；严格的 Exception Handling，需要程序员当场处理异常而非层层上推。

## 变量创建

Go 语言是**静态类型**语言，由于编译时，编译器会检查变量的类型，所以要求所有的变量都要有明确的类型。变量在使用前，需要先声明。声明类型，就约定了你这个变量只能赋该类型的值。

```go
// 1. 先单独声明后赋值：var <name> <type>
var name string

// 2. 声明+赋值初始化：var <name> <type> = <value>
var age int = 18

// 3. 批量声明
var (
    name string = "zari"
    age int = 18
)

// 4. 推导声明（仅适用于函数内部）
name := "zari"

// Go 支持类似 Python 的单行多变量声明
age1, age2 := 10, 20
age1, age2 = age2, age1
```

## 数据类型

### byte

长度为 1Byte = 8bit，一般用 `[]byte` 来表示二进制数据流

### rune

长度为 4Byte = 32bit，表示的是一个 Unicode字符（Unicode是一个可以表示世界范围内的绝大部分字符的编码规范）

### Array

> 固定长度 ！！！

不同长度数组的类型是不同的，如`[5]int`和`[3]int`两个数组的类型不同，同时我们也可以通过`type a3 [3]int`的方式为`[3]int`添加别名

```go
// 1. 声明+初始化
var arr1 [5]int = [5]int{1, 2, 3, 4, 5}

// 2. 推导声明
arr2 := [5]int{1, 2, 3, 4, 5}

// 3. 先声明后赋值
var arr3 [5]int
arr3[0] = 1
arr3[2] = 3

// 4. 定义后续可能会增长的数组
arr4 := [...]int{1, 2, 3, 4, 5}
```

### Slice

> 无法通过切片类型来确定其值的长度
>
> 切片是对数组的一个连续片段的**引用！！！**，因此修改切片会影响原数组
>
> 左闭右开 ！！！

- Go 切片的前两位（a, b）基本用法如 Python，但第三位（c）表示的是切片容量（注意是容量而不是长度），而非步长。如不显式指出第三位，则默认为到原数组的最后一个元素；而指定第三位，切片容量则为`c - a`。

    ```go
    arr := [...]int{1, 2, 3, 4, 5}
    sli := arr[a:b:c]
    ```

-  切片基本用 make 方法创建

    ```go
    // make( []Type, size, capacity )
    sli := make([]string, 5, 10)
    ```

- 针对切片的修改操作

    ```go
    myarr := []int{1}
    // 追加一个元素
    myarr = append(myarr, 2)
    // 追加多个元素
    myarr = append(myarr, 3, 4)
    // 追加一个切片, ... 表示解包，不能省略
    myarr = append(myarr, []int{7, 8}...)
    // 在第一个位置插入元素
    myarr = append([]int{0}, myarr...)
    // 在中间插入一个切片(两个元素)
    myarr = append(myarr[:5], append([]int{5,6}, myarr[5:]...)...)
    ```

### Map

即 Python 中的 Dict，由若干个键值对映射的组合

> map[keyType]valueType

- 创建初始化

    ```go
    // 1. 声明+初始化
    var scores map[string]int = map[string]int{
        "zari": 100,
        "Curry": 90,
    }

    // 2. 推导声明
    score := map[string]int{}

    // 3. make 声明
    score := make(map[string]int)
    score["zari"] = 100
    ```

- CRUD

    ```go
    // 增/改（若不存在则新增，若已存在则覆盖更新）
    score["zari"] = 100
    // 查
    fmt.Println(score["zari"])
    // 删
    delete(score, "zari")

    // 循环（可以直接调用类似 Python 的.item()方法）
    for key, value := range score {
        fmt.Println(key, value)
    }
    ```

## 控制语句

### if-else

这里只提一点，类似 C++ 的， Golang 可以在 if 后直接用创建变量和赋值，并对变量进行判断

```go
if age := calculateAge(birthday); age > 18 {
    // do something 并且此处 age 的生命周期仅限于此大括号内
}
```

### switch-case

```go
switch 表达式 {
    case 表达式1:
        代码块
    case 表达式2:
        代码块
    case 表达式3:
        代码块
    default:
        代码块
}
```

### for

Golang 中没有 `while` 只有 `for`

```go
// for 当 while 用
i := 1
for i <= 10 {
    fmt.Println(i)
    i ++
}

// 正常三段式 for 循环
for i := 1; i <= 10; i ++ {
    fmt.Println(i)
}

// 死循环
for {
    // do something
}

// for-range 类似 Python 的 for-in 和 enumerate 的组合
for index, value := range arr {
    fmt.Println(index, value)
}
```

### defer

纯神器，一般用于延迟做某些事情，如解锁、关闭文件或channel等资源

三个特性：

1. defer 的执行阶段在 return 之后
2. defer 的变量值和状态以 defer 前的状态为准
3. 多重 defer 的执行顺序类似栈，是符合 FIFO 的

```go
var name string = "cpp"

func modifyName() string {
    name := "go"
    defer fmt.Println(name)

    name = "python"
    defer fmt.Println(name)

    name = "java"
    fmt.Println(name)

    return name
}

func main() {
	newName := modifyName()
    fmt.Println(newName)
    fmt.Println(name)
}
// 代码输出为：java python go java cpp
```

### select

可以被理解为 channel 专用的 `switch-case`

```go
c1 := make(chan string, 1)
c2 := make(chan string, 3)

select {
case msg1 := <-c1:
    fmt.Println("c1 received: ", msg1)
case msg2 := <-c2:
    fmt.Println("c2 received: ", msg2)
// select 的 default 是必写的，为了避免无输入引起的死锁
default:
}
```
