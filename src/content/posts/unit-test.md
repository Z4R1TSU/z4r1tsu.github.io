---
title: "用 Mockey 进行单元测试"
description: "这是一篇关于 单元测试 的文章。"
pubDatetime: 2025-03-20
author: Zari Tsu
featured: false
draft: false
tags:
  - Go
---

# 单元测试

久病成医。在被 70% 的单元测试覆盖率硬性标准下，我从一个从无单测编写经验的小白，一路磨砺进化进化，成为了单测领域中神。

这里采用的单测框架是 Golang 的官方测试框架 `testing` 和 字节跳动开源的 Mockey。

## 为什么要写单元测试

对于实际开发中，多数项目都是纯线上的，我们直接进行测试是不太现实的。一是因为不能对线上环境的影响；二是测试环境的复杂性，调用链路和涉及的组建和模块众多。我们想要快速且自如地对开发的代码进行测试和 debug，就需要用到单元测试。

## 常见概念

在单元测试中，我们有几个概念需要了解一下：

- Mock：动词的模拟，是指在测试中用一个虚拟对象来代替真实对象，模拟真实对象的行为。
- Convey：Convey 是 Golang 官方提供的一个测试框架，它可以帮助我们编写更易读的测试用例。
- So：So 是一种测试用例的组织方式，它可以帮助我们更好地组织我们的测试用例。

在覆盖率中，我们常常有两个概念，一个是 Full Coverage，另一个是 Diff Coverage。

- Full Coverage：全覆盖，意味着所有的代码都被测试过。
- Diff Coverage：差异覆盖，意味着只测试了我们此次修改（本次 MR 涉及）的代码。

在单元测试的编写中，我们要符合以下几个原则：

- 单元测试应该是自动化的，不依赖于人工操作。
- 单元测试应该覆盖尽可能多的场景。
- 单元测试应该快速，不占用太多资源。
- 单元测试应该有明确的输入输出。

### Mock

Mock 是单测中最重要的技术，一般只要是对某个变量，它的赋值是由非本函数，也就是外部函数获取的，那么就可以使用 mock 强行指定这个变量的返回值。

mock 的具体过程分为三步：

1. 确定要被 mock 的对象或方法或变量。
2. 编写被 mock 后的返回值。
3. 构建 mock，以便在测试中走 mock 的结果，而不是走进原函数。

```go
// 使用规范
mockey.Mock(函数名).Return(返回值).Build()
```

## 编写流程

编写单元测试的流程一般是：

1. 测试文件和方法的确定和创建。
2. 调研要覆盖的场景和边界条件，并编写能覆盖大部分分支的测试用例。
3. 创建符合预期的入参。
4. mock 掉所有需要替代的外部方法的返回值。
5. 运行被测试的方法。
6. 断言判断返回值和预期结果的符合情况。

## 分支处理

> 任何控制语句可能出现的所有分支情况，由出现在条件中的变量决定。

比如对于下面这个例子，我们把 `Cond1(a)` 抽象为一个变量 `X`，将 `Cond2(b)` 抽象为另一个变量 `Y`。那么对于它们俩组合可能发生的所有情况，无外乎四种 `X && Y`、`X &&!Y`、`!X && Y`、`!X &&!Y`。

对于简单的分支处理，我们采用这样的形式，用 $n$ 个变量，列出 $2^n$ 种可能的组合，再查看代码中覆盖的实际分支，进行排除，从而快速地进行分支全覆盖。

```go
if Cond1(a) && Cond2(b) {
	// 处理分支1
} else if !Cond1(c) {
	// 处理分支2
} else {
	// 处理分支3
}
```

## 具体实例

假设我们有这样一个文件。如果我们要测试 `order_processor.go` 文件中的 `ProcessOrder` 函数，对这个方法的单测就需要被放在 `order_processor_test.go` 文件的 `TestProcessOrder` 函数中。

```go
// order_processor.go
package order

type Order struct {
	ID      string
	Amount  float64
	Status  string
	Payment string
}

type OrderProcessor struct{}

// 被测试方法（包含多分支、跨包调用、实例方法、类方法）
func (op *OrderProcessor) ProcessOrder(order *Order, paymentType string) error {
	// 分支1：验证订单
	if !op.validate(order) {
		return errors.New("invalid order")
	}
	// 分支2：处理支付
	switch paymentType {
	case "credit":
		// 调用外部包的方法
		txnID, err := external.ProcessPayment(order.Amount)
		if err != nil {
			order.Status = "payment_failed"
			return err
		}
		order.Payment = txnID
		order.Status = "paid"
	case "wallet":
		order.Status = "pending_verification"
	default:
		return errors.New("unsupported payment type")
	}
	// 分支3：生成订单ID
	if order.ID == "" {
		order.ID = op.GenerateOrderID()
	}
	return nil
}

// 实例方法
func (op *OrderProcessor) validate(order *Order) bool {
	return order.Amount > 0
}

// 类自身方法
func (op OrderProcessor) GenerateOrderID() string {
	return "ORD-123456"
}
```

那么根据以上代码，我们为了满足覆盖率，要尽量走过（覆盖）所有分支：

1. 订单验证失败
2. 信用卡支付成功/失败
3. 钱包支付
4. 不支持的支付方式
5. 自动生成订单ID

```go
// order_processor_test.go
package order


func TestProcessOrder(t *testing.T) {
	PatchConvey("开始测试 OrderProcessor.ProcessOrder", t, func() {
		// 初始化上下文和测试对象
		processor := &OrderProcessor{}
		order := &Order{
			ID:     "ORD-123",
			Amount: 100,
			Status: "pending",
		}

		// 子测试用例
		PatchConvey("Case1-信用卡支付成功", func() {
			// Mock外部支付服务
			Mock(external.ProcessPayment).
				Return("txn-123", nil). // 模拟支付成功
				Build()

			// Mock实例方法 validate
			MockMethod(processor, "validate").
				Return(true). // 验证通过
				Build()

			// 执行测试
			err := processor.ProcessOrder(order, "credit")

			// 断言验证
			So(err, ShouldBeNil)
			So(order.Status, ShouldEqual, "paid")
			So(order.Payment, ShouldEqual, "txn-123")
		})

		PatchConvey("Case2-信用卡支付失败", func() {
			// Mock外部支付服务返回错误
			Mock(external.ProcessPayment).
				Return("", errors.New("payment failed")). // 模拟支付失败
				Build()

			// Mock实例方法 validate
			MockMethod(processor, "validate").
				Return(true). // 验证通过
				Build()

			// 执行测试
			err := processor.ProcessOrder(order, "credit")

			// 断言验证
			So(err, ShouldNotBeNil)
			So(err.Error(), ShouldEqual, "payment failed")
			So(order.Status, ShouldEqual, "payment_failed")
		})

		PatchConvey("Case3-订单验证失败", func() {
			// Mock实例方法 validate
			MockMethod(processor, "validate").
				Return(false). // 验证失败
				Build()

			// 执行测试
			err := processor.ProcessOrder(order, "credit")

			// 断言验证
			So(err, ShouldNotBeNil)
			So(err.Error(), ShouldEqual, "invalid order")
		})

		PatchConvey("Case4-钱包支付", func() {
			// 无需Mock支付服务，钱包支付不调用外部方法
			MockMethod(processor, "validate").
				Return(true). // 验证通过
				Build()

			// 执行测试
			err := processor.ProcessOrder(order, "wallet")

			// 断言验证
			So(err, ShouldBeNil)
			So(order.Status, ShouldEqual, "pending_verification")
		})

		PatchConvey("Case5-不支持的支付方式", func() {
			// 无需Mock，直接测试默认分支
			MockMethod(processor, "validate").
				Return(true). // 验证通过
				Build()

			// 执行测试
			err := processor.ProcessOrder(order, "paypal")

			// 断言验证
			So(err, ShouldNotBeNil)
			So(err.Error(), ShouldEqual, "unsupported payment type")
		})

		PatchConvey("Case6-自动生成订单ID", func() {
			// Mock外部支付服务
			Mock(external.ProcessPayment).
				Return("txn-123", nil). // 模拟支付成功
				Build()

			// Mock实例方法 validate
			MockMethod(processor, "validate").
				Return(true). // 验证通过
				Build()

			// Mock类方法 GenerateOrderID
			Mock(OrderProcessor{}.GenerateOrderID).
				Return("MOCK-ORD-ID"). // 模拟生成的订单ID
				Build()

			// 清空订单ID以触发生成逻辑
			order.ID = ""

			// 执行测试
			err := processor.ProcessOrder(order, "credit")

			// 断言验证
			So(err, ShouldBeNil)
			So(order.ID, ShouldEqual, "MOCK-ORD-ID")
		})
	})
}
```

注意对于实例的 mock，我们需要使用 `MockMethod` 方法，或者采用 `Mock((*OrderProcessor).validate)` 用类作为对象而不是实例，才能走通 mock 逻辑，而不至于走进原方法中。

为什么不能用实例的方法来 mock？对于 mock 我们需要代替这个方法的返回值，使其不会产生外部调用，给它一个虚假的结果作为返回。如果调用的是一个实例，那么就会真的调与这个实例相关的方法了，而不是我们准备的假数据，从而丧失了 mock 的意义。

```go
// 这两种构造是相同的
Mock(GetMethod(op), "validate").Return(true).Build()
Mock((*OrderProcessor).validate).Return(true).Build()
```

## 如何利用 AI 快速编写单元测试

如分支覆盖这种类似状态机的、有特定解法的任务，交给 AI 去做无疑是事半功倍的。况且在 AI 时代，固守窠臼保守不前，也是非常棘手的。

对于 2025 年的 AI 来说，基本已经足够聪明为我们生成单元测试了。恰当地进行使用，我们可以仅出 5% 的力，就能达到 95% 的覆盖率。

我将单测的 AI 辅助总结为几点。

-  点对点编写：修改哪个函数就针对哪个函数编写。
	- 假设我们修改了 a 文件和 b 文件，而 c 文件是 a 和 b 的唯一调用者。为了图快，我们可能会直接对 c 文件写单测。但是这样违反了单测的初衷，我们应该分别对 a 和 b 文件进行单测。
-  为 AI 输入合适的五块语料：  
   1. 修改前的方法
   2. 修改后的方法
   3. 方法中可能会被 mock 的结构体或者说类
   4. 要求达到的覆盖率（一般直接设置成 100% 即可）
   5. 需要特殊指明覆盖的边界条件
