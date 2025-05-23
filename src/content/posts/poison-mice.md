---
title: "找毒药问题"
description: "这是一篇关于面试中常见的一道智力题——找毒药问题的解答。"
pubDatetime: 2025-03-29
author: Zari Tsu
featured: false
draft: false
tags:
  - Interview
---

# 找毒药问题

## 普通

题面：有 1000 瓶药水，其中只有一瓶是毒药。假设一只小白鼠服下毒药身亡的时间是一个小时，那么在一小时内，至少需要几只小白鼠才能找出毒药？

根据题意，我们可以假设一只小白鼠服下毒药的时间为 1 小时，那么在 1 小时内，易得我们最多只能做一组实验。

### 朴素解法

1000 只瓶子用 1000 只小白鼠，一一对应服下毒药，身亡的那只对应的瓶子为毒药。

### 优化解法

在一只小白鼠喝下药水就有两种状态：活着，代表该瓶没毒；死亡，代表该瓶有毒。那么我们可以往 2 这个方向去靠，可以是二分，也可以是二进制。$2^{10} = 1024$ 大于 1000，因此我们可以拿 10 只小白鼠来表示瓶子对应的编号。如将 1000 瓶药水编号为 0~999，对于第 9 瓶药水，转换成二进制为 0000001001，此时我们就只需要让第一只和第三只小白鼠服下毒药。如果 10 只中只有 1,3 两只老鼠死去，那么有毒的瓶子就是 9 号。

## 进阶

题面：有 1000 瓶药水，其中只有一瓶是毒药。假设一只小白鼠服下毒药身亡的时间是 15 分钟，那么在一小时内，至少需要几只小白鼠才能找出毒药？

那么这个场景我们就可以做 4 次实验了。对于这里就不赘述朴素解法了。

### 二进制解法

根据上一个问题的引导，很容易利用二进制的方式来解答这个问题。

在四组试验中，每一组都有 250 个瓶子需要判断，我们只需要一次排除 250 个瓶子即可。那么也就是用 $2^8 = 256$ 大于 250，用 8 只小白鼠来表示瓶子对应的编号。

### 二分解法

由于我们只有四组实验的时间，因此我们必须保证每次能排除尽可能多的瓶子。那么一次实验需要排除多少瓶子呢？由 $\lfloor\log_x 1000\rfloor = 4$ 计算得 $x_{min} = 6$，即每次排除 $\frac{1}{6}$ 的瓶子就可以做到。

具体地，我们先不考虑小白鼠毒死后的重复利用问题。最开始 6 只小白鼠，每只服下 $1000/6 \approx 167$ 瓶，若第 i 只小白鼠死了，则证明是第 167 *i 到第 167*(i+1) 瓶子中的一瓶有毒。第二轮将范围缩小到 $167/6 \approx 26$。第三轮缩小到 $26/6 \approx 4$。到第四轮则能找出毒药。

即使考虑到小白鼠毒死后的重复利用问题，也只需要 6 + 3 = 9 只即可。

## 状态解法

我们其实被普通题目的二进制解法桎梏了，其实这并不是限制在一个二进制的问题，具体地几进制取决于小白鼠可能的状态。简单来说，如果只有一次实验，那么小白鼠理应只有两种状态，即在结束后要么或者要么死去。而如果实验次数是四次，那么就有可能出现五种状态，分别是：

1. 第一次实验，也就是在 15 分钟后，小白鼠死了
2. 第二次实验，也就是 15 分钟时没死在 30 分钟后小白鼠死去
3. 第三次实验，小白鼠之前两次实验没死，第四次实验小白鼠死了
4. 第四次实验，小白鼠之前三次实验没死，第五次实验小白鼠死了
5. 小白鼠到最后都没死

出于这五种状态，我们可以将进制升维到五进制，那么此时的小白鼠数量则是 $5^5 = 3125$ 大于 1000，也就是五只。

具体的流程是

1. 给药水编号: 将 1000 瓶药水从 0 到 999 编号。

2. 分配老鼠: 我们使用 5 只老鼠，每只老鼠对应五进制数的一个位。例如，老鼠 A 对应最右边的位（个位），老鼠 B 对应倒数第二位（五位），以此类推。

3. 分轮喂药:  
    第一轮 (0-15 分钟): 对于每一瓶药水，查看其五进制表示的每一位。如果某一位的数字是 1，则将该瓶药水（少量）喂给对应的那只老鼠。  
    第二轮 (15-30 分钟): 对于每一瓶药水，如果某一位的数字是 2，则将该瓶药水喂给对应的那只老鼠（前提是这只老鼠在第一轮中没有死亡）。  
    第三轮 (30-45 分钟): 对于每一瓶药水，如果某一位的数字是 3，则将该瓶药水喂给对应的那只老鼠（前提是这只老鼠在前两轮中没有死亡）。  
    第四轮 (45-60 分钟): 对于每一瓶药水，如果某一位的数字是 4，则将该瓶药水喂给对应的那只老鼠（前提是这只老鼠在前三轮中没有死亡）。  
    如果某一位的数字是 0，则对应的老鼠在任何轮次都不需要喝这瓶药水。 

4. 观察结果: 在一小时结束后，观察每只老鼠的状态。
如果某只老鼠在第一轮死亡，则中毒药水的对应位上的数字是 1。
如果某只老鼠在第二轮死亡，则中毒药水的对应位上的数字是 2。
如果某只老鼠在第三轮死亡，则中毒药水的对应位上的数字是 3。
如果某只老鼠在第四轮死亡，则中毒药水的对应位上的数字是 4。
如果某只老鼠在一小时内都活着，则中毒药水的对应位上的数字是 0。

5. 确定毒药: 根据每只老鼠的状态，我们可以得到中毒药水编号的五进制表示。将这个五进制数转换回十进制，就可以找到是哪一瓶药水是毒药。

举个例子，如果最后的结果是：第二只老鼠在第三轮死，第五只老鼠在第一轮死，其他都没死，那么毒药的编号则是 `10030`，转换成十进制则是 $1*5^{4} + 3*5^{1} = 640$ 号瓶药水。

## 总结

那么由此可见，对于“有 a 瓶药水，其中只有一瓶是毒药。假设一只小白鼠服下毒药身亡的时间是 i 分钟，那么在 j 分钟内，至少需要几只小白鼠才能找出毒药？”这种问题，我们就使用状态解法来解答，那么通式如下。

1. 计算实验的组数 $\lceil j/i \rceil$。
2. 状态数或者说进制数取决于实验次数，为组数加一。
3. 确定最终结果为 $log_x (\lceil j/i \rceil + 1) >= a$，求解 $x_{min}$ 的问题了。
