---
title: "const关键词"
description: "这是一篇关于const的文章，主要讲述了const的作用、用法、以及一些常见的错误。"
pubDatetime: 2023-09-07
author: Zari Tsu
featured: false
draft: false
tags:
  - cpp
---

# const

讲讲C++当中**const**这个修饰符啊

### 解释

const全称constant，就是常量的意思。一般来说，用于修饰一些不变的量。

### 对象

先来聊聊比较重要的一个，const到底怎么看，它修饰的对象是谁？  

> 有一个one-fit-all的万能公式:   
> **先看左边，再看右边**

也就是说，const默认修饰它左边的东西，如果它的左边没有任何东西就修饰它右边的东西。

举几个例子: 

1. `const int i` 在这个例子当中因为const的左边啥也没有，所以它指向了它右边的int，也就是说这个i变量是一个const int类型。
2. `int* const i` 那么这里就修饰了它的左边，即这个指针。也就是说这个i变量是一个const的int指针，我们不能改变这个指针的指向。

### 要点

有几个要注意的点:  

1. const修饰变量: 
   1. 若一个变量被修饰为const时，我们必须得在声明它的当时就直接对它进行分配赋值。  
       ```cpp
       // 错误
       const int i;
       i = 1;
       ```
       ```cpp
       // 正确
       const int i = 1;
       ```

   2. 一个非const变量可以被赋值为const，反之则不行。  
       ```cpp
       // 错误
       const int i = 1;
       int *pj = &i;
       // 因为如果我这里对pj进行修改，就违反了i是const无法被改变的事实
       // 比如下列就相当于通过pj改变了i的值
       *pj = 123;
       ```
       ```cpp
       // 正确
       int j = 1;
       const int& pi = j;
       ```

   3. 对于第二点，有一个比较tricky的点，特此提一下。
        ```cpp
        const int i = 1;
        int j = 2;

        // 这一步毋庸置疑是对的，const指向另一个const
        const int *pi = &i;
        // 而这一步就显得有点争议了...
        pi = &j;
        ```
        这里就要从const修饰的对象开始讲起了，先看左再看右，我们可以发现对于pi而言，它是一个指向const int的指针。所以pi的值是**可以**变化的，而且，不但可以指向cosnt int，甚至可以指向一个int，因为第二点说明了const可以是一个非const。

2. const修饰函数:
    一般来说在const修饰函数的过程会有三个常见的位置。  
   1. const int function (int n) {}; :  
        这里的情况代表了这个函数的返回值是一个const int，应该很好理解。

    2. int function (const int n) {}; :  
        这里的话就代表写入的这个参数n，我们在function()这个函数的实现当中，我们不能改变这个n，即使n它是一个非const。
        ```cpp
        // 正确

        int function(const int n) {
            // 这里不能修改n，比如n ++的这类操作是不被允许的
            std::cout << n << std::endl;
        }

        int n = 1;
        function(n);
        ```

    3. int function (int n) const {}; :  
        这个情况设计到了OOP，即Class这些面向对象的知识。  
        当在类成员函数的声明和定义中的函数名后面加上const关键字，表明这个函数不会修改任何类成员变量，即使那些成员变量并没有被声明为const。  
        ```cpp
        class MyClass {
        public:
            int n;
            int function(int n) const {
                // 这里不能修改类的任何非const成员变量
                std::cout << n << std::endl;
                return n; // 注意这里返回值不会被const修饰
            }
        };
        ```

### 作用

那么const除了防止我们改变它，还有其他的什么作用呢？
1. 类似于我们要尽量把Class当中的属性设高私密级，比如能用`private`就不用`protected`，能用`protected`就不用`public`，是一种符合安全性、规范性的写法。
2. 使用const，可以使得我们的运行速度变快，因为运行的时候就不用想着“哎，这个变量要不要对它发生变化啊”诸如此类的疑问，所以速度会变快。

~~这种作用一般不是我的强项，举不出来几个...太公式了，跟背书文科一样...大家应该能get到就行~~