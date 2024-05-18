---
title: "函数的参数传递"
description: "这是一篇关于函数参数传递的文章。"
pubDatetime: 2023-09-07
author: Zari Tsu
featured: false
draft: false
tags:
  - cpp
---

# 函数的参数传递

### passing by value

* 这里传进去的其实是参数的一个copy，而不是参数本身，或者说是参数所对应的地址

```cpp
void func(int fa) {
    fa = 5;
}
int main() {
    int a = 1;
    func(a);
    // 这里如果打印a的值，毋庸置疑还是1
}
```

### passing by pointer

* 这个应该是很常见的

```cpp
// 传入的参数是一个地址
void func(int *fa) {
    // 传入a的地址，fa就是一个指向a的指针，也就是说fa的值就是a的地址
    *fa = 5;
}
int main() {
    int a = 1;
    func(&a);
    // 这里打印a的值会变成5
}
```

### passing by reference

* 先讲一下C++当中的reference，也就是引用。  

它有几个特点:  

1. 可以将其理解成一个变量的别名  
    
```cpp
int original = 100;
int &ref = original; // ref现在是原始变量的引用
ref = 200; // 改变引用将改变原始变量original的值
std::cout << original; // 输出200，证明original的值被改变了
```

2. 引用在定义时必须初始化，一旦与某个变量绑定，就无法再绑定到其它变量

3. 引用在函数传参时尤其有用，因为它可以避免通过指针传参时可能发生的间接访问和解引用操作

4. 引用在C++中提供了一种安全、便捷的替代指针的方式，尤其在函数传参、返回值和操作符重载时更能看到它的优势   

```cpp
void func(int &fa) {
    // 这里传入的fa其实就是a本身，fa就是a的一个别名而已，二者是同一块内存空间
    fa = 5;
}
int main() {
    int a = 1;
    func(a);
    // 这里能改变a的值，打印结果为5
}
```