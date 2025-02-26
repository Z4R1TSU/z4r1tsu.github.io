---
title: "Go OOP"
description: "这是一篇关于 Go OOP 的文章，主要来聊聊 Go 的面向对象编程。"
pubDatetime: 2025-02-26
author: Zari Tsu
featured: false
draft: false
tags:
  - Go
---

# Go OOP

不同于 Java 从设计上就大量参考了面向对象编程的思想，也不同于 C++ 在 C 的基础上做了 OOP 的调整，Golang 没有直接的类以映射对象，而是采用结构体的方式间接地、简洁地实现 OOP。

## 类的初始化

> 对于方法的**可见性**由方法名开头的大小写决定.如方法名开头为大写则此方法为 public;小写则为 private，仅供内部包调用

```go
// 类的初始化
type Person struct {
    name, id string
    age int
    gender string
    father, mother *Person
}

// 绑定方法（不会修改原对象）
func (p Person) SayHi() {
    fmt.Printfln("Hi, I'm ", p.name)
}

// 绑定方法（会修改原对象）
func (p *Person) SetName(name string) {
    p.name = name
}

// 实例化和调用其方法
somebody1 := Person{}
somebody2 := Person{name: "somebody2"}
somebody1.SayHi()
somebody2.SetName("new name")
```

## 封装继承多态

1. 继承是匿名的：在继承父类时无需为属性命名
2. 接口是隐式的：接口声明时的类，在实现时不需要显式指定
3. 多态是基于接口实现的
4. 空接口 `type empty_interface interface{}` 可以承载任意类型

```go
// 继承
type Student struct {
    Person // 匿名继承 Person
    grade int
    school string
}

// 接口创建
type Person interface {
    teach(Student) bool
    learn() bool
}
// 接口实现
func (s Student) learn() bool {
    fmt.Printfln("Student %s learn", s.name)
    return true
}
func (t Teacher) teach(s Student) bool {
    fmt.Printfln("Teacher %s teach %s", t.name, s.name)
    return true
}
```

还有一个父类子类的隐性转换带来的权限问题，此事在 Java 的学习中亦有记载

在下一个例子中，当我们调用 `phone.send_wechat()` 时会报错，原因是 `phone` 实例的类型时父类，而父类 `Phone` 只有一个方法 `call()`，只有子类 `iPhone` 才有 `send_wechat()` 方法。举个例子，`Person` 是父类，`Athlete` 是子类，运动员能百米十秒内，难道所有人类都能做到吗？

```go
type Phone interface {
    call()
}

type iPhone struct {
    name string
}

func (phone iPhone)call()  {
    fmt.Println("Hello, iPhone.")
}

func (phone iPhone)send_wechat()  {
    fmt.Println("Hello, Wechat.")
}

func main() {
    var phone Phone
    phone = iPhone{name:"ming's iphone"}
    phone.call()
    phone.send_wechat()
}
```

于是我们只需要修改 phone 实例的类型为 iPhone 即可 `phone := iPhone{name:"ming's iphone"}`

## 反射 Reflection

Java 中的反射一般用于通过类的名字，以字符串的方式来获取类对象。而 Golang 中的反射则让我们拥有了获取一个对象的类型，属性及方法的能力
