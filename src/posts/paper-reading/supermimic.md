---
title: "SuperMimic：算法设计、输入输出与 MDP/POMDP 精读"
titleEn: "SuperMimic: Algorithm Design, Inputs and Outputs, and MDP/POMDP"
date: 2026-11-20
tags: [论文精读, 人形机器人, 强化学习, 世界模型, 运动控制]
tagsEn: [Paper Reading, Humanoid Robots, Reinforcement Learning, World Models, Motion Control]
description: "从 MDP/POMDP 定义出发，逐步解释 SuperMimic 的状态、目标、动作、奖励、动力学学习和 BPTT 策略优化，并对照官方代码说明输入输出与训练部署流程。"
descriptionEn: "A detailed reading of SuperMimic's MDP/POMDP, tensor contracts, learned dynamics, BPTT policy optimization, and training-to-deployment workflow, checked against a pinned official code revision."
---

# SuperMimic：算法设计、输入输出与 MDP/POMDP 精读

Qiayuan Liao、Yiyang Shao、Junfeng Long、Kevin Zakka、Roberto Horowitz、Pieter Abbeel、Koushil Sreenath · UC Berkeley · CoRL 2026

[论文 v2](https://arxiv.org/abs/2610.28480v2) · [作者项目页](https://supermimic.github.io/) · [固定版本官方代码](https://github.com/HybridRobotics/supermimic/tree/698ea39bc901d8fe733b3c8621df3199d241f7e4)

**阅读导航：[算法全貌](#design) · [MDP/POMDP](#mdp) · [输入输出](#io) · [奖励与终止](#reward) · [训练循环](#training) · [如何改变 PPO](#rl) · [代码差异](#code) · [真机部署](#deployment)**

**先回答最容易误解的问题：SuperMimic 没有把强化学习替换掉。它仍是基于模型的强化学习（model-based RL），仍然训练策略去最大化长期奖励。它主要改变的是：用什么环境产生策略学习轨迹，以及怎样计算策略改进的梯度。** 原先在刚体仿真器里大量采样、用 PPO 估计策略梯度；现在学习一个可微动力学替身，在其中生成短轨迹，并用 BPTT 直接对想象回报求导。

本文重点重建算法，而非逐段翻译摘要。论文解释固定为用户提供的 **arXiv:2610.28480v2，2026-11-09，19 页**；代码解释固定为官方仓库 **`698ea39`，2026-11-18**。当前公开代码与论文配置的区别在第八节单列，不把不同版本拼成一个“已经复现”的实现。文中数值小例子均为教学算例；未执行独立训练或真机测试。

## 一、算法为什么这样设计：把“目标动作”和“身体动力学”分开 {#design}

想象同一台 G1 要学习走路、舞蹈和翻滚。三个任务的目标轨迹不同，但机器人仍有相同的连杆、关节、电机和地面接触机制。任务在回答“接下来想做什么”，动力学在回答“现在这样发力，身体实际会怎样变化”。SuperMimic 将两者分开建模。

**参考动作库负责定义目标。** 输入已经重定向到 G1 的参考关节轨迹和机体运动，不是直接输入 RGB 视频。人体动作是数据来源，重定向后的机器人轨迹是期望运动；它们并不直接给出在有惯性、摩擦和扰动时能够稳定执行的电机控制命令。

**actor 负责决定控制动作。** 它结合机器人当前观测和参考目标，输出关节控制量。实际机器人偏离参考时，actor 应调整控制，把它拉回目标附近；因此这是一套闭环控制器，不是简单回放参考关节角。

**世界模型负责预测身体响应。** 它学习“状态 + 动作 + 物理参数 → 下一状态”。走路和翻滚都调用同一个动力学模型，不必为每段参考动作分别训练一个物理模型。参考目标影响 actor 的动作选择，但给定真正执行的动作之后，物理转移无需知道动作来自哪支舞。

**critic 负责估计短展开之后的价值。** 32 个控制步只覆盖约 0.64 s。一个短期看似不错的动作，可能让身体在更晚时失衡。critic 在展开末端估计剩余回报，避免把学习目标局限在这 0.64 s。

<figure>
  <img src="/paper-reading/supermimic/training-loop.png" width="1218" height="417" alt="论文图 2：真实仿真采集数据、拟合世界模型、冻结模型后通过想象轨迹改进策略的循环">
  <figcaption>原论文 Fig. 2，第 4 页。左侧产生真实仿真监督，中间更新模型，右侧通过模型更新 actor。右侧冻结的是模型权重，动作和状态的导数仍被保留。</figcaption>
</figure>

论文的关键设计可以按约束逐一理解：

<div class="sm-table">

| 面临的问题 | 设计选择 | 为什么有用 | 引入的条件或代价 |
| --- | --- | --- | --- |
| 动作很多，但身体物理相同 | 跨动作共享一个动力学模型 | 新动作的数据可继续改善共同动力学 | 共享不代表状态覆盖完全相同；罕见接触仍可能难学 |
| 原仿真器不便微分 | 学习可微代理，不对仿真器求导 | 可直接使用动作对未来结果的导数 | 代理预测和导数都可能有偏差 |
| 长想象误差累积、显存开销大 | 32 步想象 + 末端价值 | 将物理展开控制在短时域内 | critic 的长程估计也可能不准确 |
| 策略进步后访问新状态 | 采集、模型拟合、策略更新持续交替 | 用新仿真数据补充当前策略附近的监督 | 仍然需要物理仿真，不是纯离线学习 |
| 硬摔倒阈值难以传梯度 | 软终止 + 连续存活权重 | 在临近失败边界时提供连续梯度 | 优化的是平滑代理，不能保证真实失败率 |
| 真机不知道完整物理上下文 | 模型/critic 用特权信息，actor 用传感器历史 | 训练可以更充分，部署输入更可获取 | 历史窗口只是有限记忆，不保证恢复全部隐状态 |

</div>

## 二、它的强化学习问题是什么：严格区分 MDP 和 POMDP {#mdp}

*依据论文 §3.1、附录 A、D；以下将论文紧凑记号展开成便于实现的状态描述。扩展状态的写法属于解释性重建，不是作者额外提出的定理。*

### 2.1 先找 agent、environment 和一个时间步

**agent 是可学习的高层关节控制策略 actor。** **environment 是机器人、底层执行器、地面接触和参考动作播放机制共同构成的控制环境。** MuJoCo Warp 在训练中模拟这个环境；部署时则由物理机器人执行动作。

每个策略步约 20 ms，即 50 Hz。一个真实控制步包括：读取观测和参考目标、actor 输出控制量、低层控制器执行、物理状态变化、计算奖励和终止，再进入下一步。仿真中一个控制步由四个 5 ms 物理子步组成。

### 2.2 MDP 中的状态，不能只写“关节角度”

先用 x<sub>t</sub> 表示物理机器人状态：

<div class="sm-equation">
<math display="block"><mtext>xₜ = (pᵇₜ, Qᵇₜ, qₜ, vᵇ,wₜ, ωᵇ,wₜ, q̇ₜ)</mtext></math>
</div>

p<sup>b</sup> 是 root 位置，Q<sup>b</sup> 是四元数，q 是关节角，v<sup>b,w</sup> 和 ω<sup>b,w</sup> 是基座在世界系的线/角速度，q̇ 是关节速度。对于代码的 29 关节 GenCoord 路径，这部分记录为 **71 维 full_state**。它是物理状态编码，不是 actor 的观测。

但仅有 x<sub>t</sub> 还不够描述整个跟踪任务。机器人处于同样的姿态和速度时，如果一条参考要求起跳、另一条参考要求下蹲，奖励与最优动作会不同；即使身体状态一样，上一动作不同时，动作平滑惩罚也不同。因此更完整的任务状态可写作：

<div class="sm-equation">
<math display="block"><mtext>Xₜ = (xₜ, aₜ₋₁, i, φₜ, ξ, ℓₜ)</mtext></math>
</div>

<div class="sm-table">

| 状态组成 | 为什么需要 |
| --- | --- |
| x<sub>t</sub>：当前物理状态 | 决定相同控制量会产生怎样的物理响应。相同关节角、不同速度，下一步不同。 |
| a<sub>t−1</sub>：上一控制动作 | 观测和动作平滑奖励使用它；计算 ∥a<sub>t</sub>−a<sub>t−1</sub>∥² 需要知道前一动作。 |
| i：参考动作片段身份 | 确定正在跟踪哪条参考轨迹以及此后的参考内容。 |
| φ<sub>t</sub>：片段播放索引/相位 | 同一片段不同时间的目标不同；它使随时间变化的参考变成扩展状态的一部分。 |
| ξ：每回合物理上下文 | 摩擦、质心和标定差异会改变转移或观测。它在一个回合内固定，reset 时可以重采。 |
| ℓ<sub>t</sub>：时间/剩余步数 | 如果环境按有限时长截断，需要纳入其依赖的计时信息；无此依赖时可省略。 |

</div>

如果低层系统还有执行器内部状态、延迟队列等记忆，严格的 Markov 状态还须包含相应信息。**不能仅凭“full_state”这个代码名字，就证明 71 维对任何仿真或真实硬件都严格满足 Markov 性。** 上述展开的目的，是说明任务依赖什么，而不是宣称原代码显式拼出了这个完整大向量。

### 2.3 MDP 的其他要素逐项对应什么

把完整任务写为目标条件 MDP，或把目标索引并入 X 后写成普通扩展 MDP，二者是不同的组织记号。这里采用后者：

<div class="sm-equation">
<math display="block"><mtext>𝓜 = (𝓧, 𝓐, P, r, ρ₀, γ, d)</mtext></math>
</div>

<div class="sm-table">

| 要素 | SuperMimic 中的具体含义 |
| --- | --- |
| 状态空间 𝓧 | 上述物理状态、参考身份/进度、上一动作及上下文的可行组合。 |
| 动作空间 𝓐 | 29 维连续归一化关节控制向量；经 scale/offset 转为关节设定值，再由 PD 执行。 |
| 转移 P | 动作经过执行器与刚体接触动力学，得到下一物理状态；同时保存上一动作、推进参考索引和计时。给定 ξ 后可采用确定性仿真转移，但 actor 的观测仍可带噪。 |
| 奖励 r | 跟踪身体/根部位姿和速度的密集奖励，减去动作变化与关节越限惩罚，详见第四节。 |
| 起点分布 ρ₀ | 从参考运动的时间位置重置，混合均匀与低回报难例采样；不是所有回合都从站立、片段第一帧开始。 |
| 折扣 γ | actor–critic 默认 0.99，用于平衡当前和未来收益；不是学习率。 |
| 终止 d | 根高度偏差或重力方向差超阈值时失败；片段结束、时间上限还需与失败终止分别处理。 |

</div>

参考目标特征记为 g<sub>t</sub> = Γ(i, φ<sub>t</sub>, x<sub>t</sub>)。其中参考关节轨迹来自固定数据，但相对 root 姿态依赖当前机器人的姿态，因而 g 的部分数值也会随当前状态变化。有限的 10 帧目标窗口是网络输入特征，不应不加说明就当成整个未来任务的严格 Markov 状态。

完整扩展转移可理解为：

```text
读取 X[t] 中的物理状态、参考索引与上一动作
actor 输出 a[t]，映射为 q_sp，低层执行一个控制周期
x[t+1] = 物理动力学(x[t], a[t], ξ)
上一动作字段更新为 a[t]
参考索引前进，计时递增；ξ 在当前回合内不变
对执行结果计算 r[t+1] 与 d[t+1]
若终止/截断，按重置规则产生下一回合；否则继续
```

### 2.4 为什么论文称它为 POMDP

从环境描述看可以构造 Markov 状态，但真机 actor 并不能直接读取上述全部 X。它不知道摩擦和真实质心，也没有完整世界系状态。因此对可部署 actor 来说，这是**部分可观测马尔可夫决策过程 POMDP**。

在 MDP 基础上增加观测空间 𝓞 与观测模型 Ω。观测和策略可写作：

<div class="sm-equation">
<math display="block"><mtext>oₜ = h(xₜ, aₜ₋₁, ξ) + ηₜ</mtext></math>
<math display="block"><mtext>aₜ = πθ(oₜ₋₉:ₜ, gₜ)</mtext></math>
</div>

η<sub>t</sub> 是传感器噪声。论文 actor 使用 10 帧本体观测：相对默认姿态的关节角 29、关节速度 29、IMU 角速度 3、重力投影 3、上一动作 29，单帧共 **93 维**，10 帧为 930 个标量。当前源码的排列为重力、角速度、关节位置、关节速度、上一动作；同维数不意味着可以随意换排列。

这 930 个数能让策略从近期响应中适应部分未知动态，但它不是精确 belief state，也没有被证明为充分统计量。严格 POMDP 中可以维护对隐状态的后验信念；本方法采用有限历史窗口作为实用近似。

训练时允许不对称信息：**世界模型看到完整状态和 ξ，critic 看到特权状态/目标/ξ；actor 只看到自己的输入。** 训练使用额外信息，不等于部署必须测得 ξ。当前代码默认的 rep_state actor 是另一种配置，不自动拥有这种传感器可部署输入契约，详见第八节。

### 2.5 优化目标仍然是强化学习回报

在物理环境中，策略希望最大化：

<div class="sm-equation">
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>J</mi><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mi mathvariant="double-struck">E</mi><mtext> ⁣</mtext><mrow><mo fence="true">[</mo><munder><mo>∑</mo><mrow><mi>t</mi><mo>≥</mo><mn>0</mn></mrow></munder><msup><mi>γ</mi><mi>t</mi></msup><msub><mi>c</mi><mi>t</mi></msub><msub><mi>r</mi><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo fence="true">]</mo></mrow><mo separator="true">,</mo><mspace width="1em"/><msub><mi>c</mi><mn>0</mn></msub><mo>=</mo><mn>1</mn><mo separator="true">,</mo><mspace width="1em"/><msub><mi>c</mi><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>c</mi><mi>t</mi></msub><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><msub><mi>d</mi><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo stretchy="false">)</mo></mrow></semantics></math>
</div>

硬终止 d 取 0 或 1，c 表示该步之前是否仍存活。提前失败会失去后续奖励。**参考动作提供的是奖励比较目标，不是最优控制动作标签；actor 仍需根据长期结果学会控制。** 参考未来已知不等于物理未来已知，因为未来身体响应仍取决于控制和接触。

## 三、算法每个模块的输入输出到底是什么 {#io}

*以下具体维数来自固定代码的 GenCoord、29 关节路径；33 维上下文以摩擦、质心和 29 个编码偏差全部启用为前提。B 表示批大小，h 表示观测历史，H 表示想象步数，三者不要混淆。*

### 3.1 三种“动作数据”各司其职

<div class="sm-table">

| 数据 | 是什么 | 用来做什么 |
| --- | --- | --- |
| 人体 mocap | 人体骨架运动的来源数据 | 经重定向产生机器人参考。当前 trainer 不负责从视频估计人体。 |
| G1 参考动作 | 目标关节角/速度、机体位姿/速度等参考轨迹 | 构造 g、计算跟踪奖励、选重置位置。 |
| 策略执行的仿真轨迹 | 当前策略控制物理仿真后得到的状态和动作序列 | 监督动力学模型，提供想象起点。 |

</div>

**世界模型学习第三种数据。** 不能直接将第一或第二种数据当成“状态—正确力矩”监督，参考轨迹未提供完成接触控制所需的动作标签。

### 3.2 actor 的输入：本体历史与未来参考

当前代码从参考取 t、t+5、…、t+45 共 10 帧，50 Hz 下覆盖当前到约 0.9 s 后。每帧含 29 维参考角和 29 维参考角速度，合计 580 维；再附 10 帧相对 root 姿态的 rot6d 表示，共 60 维。因此运动 encoder 输入 **640 维 goal_motion**。

完整 wm_goal 还包含 30 维相对 root 位置，合计 670 维。actor 丢弃这 30 维，critic 保留。名字叫 wm_goal，不代表它输入 Dynamics MLP；它属于世界模型环境组织目标和价值输入的那一层。

<div class="sm-table">

| 模块 | 输入 | 中间处理 | 输出 |
| --- | --- | --- | --- |
| Motion Encoder | goal_motion `[B,640]` | 2048→1024→512→256 的隐藏层，输出后 tanh | latent z `[B,32]` |
| Shared Decoder | z 与历史 `[B,10,93]` 展平后的拼接 | 输入 32+930=962；隐藏层同上 | raw action `[B,29]` |
| Critic | rep_state 68 + wm_goal 670 + sim_ctx 33 | 输入 771，隐藏层 256→128 | 未来价值 `[B,1]` |
| Dynamics MLP | rep_state 68 + 处理后的 action 29 + sim_ctx 33 | 输入 130，隐藏层 2048→2048→2048 | 速度增量 `[B,35]` |

</div>

encoder 和 decoder 的职责不同：encoder 把“要做什么”压缩成 32 维任务表示；decoder 把任务表示和“身体现在怎样”结合，算出控制量。这里的 latent 不是物理状态，也不是 32 个关节。`MultiEncoderAE` 虽含 AE 命名，主训练目标并不是重建输入的 autoencoder loss。

### 3.3 actor 的输出不是力矩，也不是预测状态

29 维 a<sub>t</sub> 表示归一化关节设定值控制量。论文用下面的映射：

<div class="sm-equation">
<math display="block"><mtext>qˢᵖₜ = q⁰ + α ⊙ aₜ</mtext></math>
<math display="block"><mtext>τₜ ≈ Kₚ(qˢᵖₜ − qₜ) − K𝒹q̇ₜ</mtext></math>
</div>

q⁰ 是默认姿态，α 是动作尺度，可逐关节设置。第二行是帮助理解 PD 的简化表达，实际还涉及力矩限幅、执行器与控制器配置。论文使用较低 PD 增益，使 setpoint 起到类似力矩调节代理的作用；**接口仍是 setpoint，不应据此说 actor 直接输出力矩。** 它也不是“当前位置加本步增量”的累积参考接口，不能与 PolicyIK 的动作定义混用。

### 3.4 世界模型为何输入 130 维、输出却只有 35 维

GenCoord 先将 71 维 full_state 编成 68 维 rep_state：root 高度 1、root 系重力投影 3、线速度 3、角速度 3、关节角 29、关节速度 29。另保留 root 世界位置 3 和四元数 4，组成 7 维 aux_state。

MLP 只预测控制周期内的速度增量：Δv<sub>b</sub> 3、Δω<sub>b</sub> 3、Δq̇ 29，共 35 维。位置、姿态和派生观测由解析积分与坐标变换计算。`Dynamics.forward` 的整体接口为：

```text
输入：rep_state [B,68]、raw action [B,29]、aux_state [B,7]、sim_ctx [B,33]
内部：action scale/offset → 归一化 → 拼接 130 维 → MLP → 35 维速度增量
输出：next_aux [B,7]、next_rep [B,68]
```

这将已知的运动积分结构与需要学习的速度响应分开。举一个单关节教学算例：q=0.4 rad、q̇=0.2 rad/s，模型预测 Δq̇=0.1 rad/s，dt=0.02 s，四子步积分系数 c=0.625，则：

<div class="sm-equation">
<math display="block"><mtext>q̇′ = 0.3 rad/s，q′ = 0.4 + (0.2 + 0.625 × 0.1) × 0.02 = 0.40525 rad</mtext></math>
</div>

35 维 prediction 是速度增量，29 维 action 是控制输入，下一帧状态是积分后的输出。三者各有不同含义。

## 四、奖励、终止和重置：究竟鼓励什么行为 {#reward}

### 4.1 跟踪奖励是密集反馈，不是只在动作完成后打分

每步都比较实际机器人和参考的身体/根部位姿与速度。论文附录 A.2 的主要项如下，所有项最后乘控制周期 0.02 s：

<div class="sm-table">

| 奖励项 | 误差 | 核尺度 | 权重 |
| --- | --- | --- | --- |
| Body position | 跟踪 body 的位置误差平方均值 | 0.3 m | +1 |
| Body orientation | 旋转差 log-map 范数平方均值 | 0.4 rad | +1 |
| Body linear velocity | 机体线速度误差平方均值 | 1.0 m/s | +1 |
| Body angular velocity | 机体角速度误差平方均值 | 3.14 rad/s | +1 |
| Root position | root 位置误差平方 | 0.3 m | +0.5 |
| Root orientation | root 姿态误差平方 | 0.4 rad | +0.5 |
| Action smoothness | ∥a<sub>t</sub>−a<sub>t−1</sub>∥² | 无指数核 | −0.1 |
| Joint limit | 上下限外的关节角距离之和 | 线性惩罚 | −2 |

</div>

例如 body position 项为：

<div class="sm-equation">
<math display="block"><mtext>rpos = exp[−meanᵦ(∥pᵣₑ𝒻,ᵦ − pᵦ∥²) / 0.3²]</mtext></math>
</div>

误差为零时该项最大，增大误差会平滑衰减。奖励包含平滑性和限位代价，因此并非只关心最后是否完成动作；但软惩罚也不等于硬碰撞约束或稳定性证明。当前代码对 body 参考位置/朝向作 root xy/yaw re-anchor，以匹配相对跟踪语义；根全局跟踪项另算，不能把全部位置项都解释为绝对世界路径误差。

**时间索引需要说清。** 当前 `WorldModelEnv.step(a_t)` 先得到下一预测状态，再与执行前的参考帧比较并计算奖励，随后推进参考时间。因此这里可记为 r<sub>t+1</sub>=r(x<sub>t+1</sub>, a<sub>t</sub>, a<sub>t−1</sub>, R<sub>i</sub>(φ<sub>t</sub>))。它对应刚执行的 a<sub>t</sub>。论文用紧凑 r(s,a,g) 记号时，不要忽略实现中的步前/步后对齐。

### 4.2 失败终止与时间截断不同

运动跟踪失败条件是 root 高度偏离参考超过 0.25 m，或 tilt error 超过 0.8。tilt error 是参考与实际 root 坐标系中重力向量 **z 分量之差的绝对值**，不是直接以弧度表示的倾角；对直立参考，0.8 大致对应 78°。本配置不按 end-effector 偏离直接终止。

片段结束或时间上限造成的 truncated，与摔倒式 terminated 不同。replay 必须记录这些边界，避免把一回合结束后的重置状态当成上一动作的正常下一状态。

### 4.3 想象中的软终止是什么

真实仿真记录硬标记，想象中则需要连续梯度。当前代码把高度和 tilt 误差除以各自阈值，取较大值 e，再用 p<sub>term</sub>=sigmoid((e−1)/ε)，ε 默认 0.05。e=1 时为 0.5，e=0.9 时约 0.119，e=1.1 时约 0.881。

这是一条确定的平滑规则，**不是经过统计校准的真实跌倒概率**。本文沿用论文“终止概率”的记号，但它主要服务可微优化。存活权重由 ĉ<sub>t+1</sub>=ĉ<sub>t</sub>(1−p<sub>term,t+1</sub>) 连续递推，因此未来奖励会被衰减；不能写成始终只取 0/1 的指示器。

### 4.4 重置并非总从第一个动作帧开始

训练把动作时间线分成 1 s bins，记录各位置的折扣回报。reset 分布混合 50% 均匀、40% 偏向低回报位置的 softmax、10% 历史困难位置权重。这让难动作得到更多练习，也保留已学困难项的训练机会。

需要分清两个分布：**真实 episode 的重置分布 ρ₀** 与 **想象 rollout 从 replay 抽取起点的分布 ρ<sub>B</sub>**。后者还包含策略执行中途的状态，二者不相同。这也是 Dyna 风格学习的一部分，不应将基于 replay 起点的代理目标直接称为原始起点目标的无偏估计。

## 五、一次训练循环如何设计，分别更新谁 {#training}

算法包含三个核心阶段，critic 在策略阶段之后拟合。它们反复交替，不是先把世界模型完全训好、永久冻结后才开始训练 actor。

<figure>
  <img src="/paper-reading/supermimic/code-workflow.svg" width="1080" height="1000" alt="官方代码的训练与部署工作流：采集、回放、监督拟合动力学、短想象更新策略、价值回归、只部署 actor">
  <figcaption>依据固定版本官方源码重绘。模型拟合使用日志动作，策略优化使用当前 actor 产生的新动作。橙色路径只在想象策略优化内部表示反向传播，不经过物理仿真器。</figcaption>
</figure>

### 5.1 阶段 A：在物理仿真中采集监督

输入为当前物理状态、参考进度、观测历史和 ξ。actor 给出动作，在物理仿真中执行，产生新状态和奖励。该阶段在代码的 `inference_mode()` 下运行，不对 MuJoCo 求导。

论文采集时可以在确定性 actor 输出上加高斯动作噪声，以扩大动力学模型见到的局部动作范围；**它不是说 actor 改成一个 PPO 风格随机策略**。固定版本的 `Runner.step` 没有显式叠加这项动作噪声，proprio 的传感器噪声是另一件事。

replay 保存 state、action、prev_action、motion_time、sim_ctx、terminated、truncated；历史模式下还可能保存 actor_obs。当前代码没有独立存 reward 或 next_state：下一状态由同一环境连续时间槽中的下一条 state 提供，reward 可解析重算。窗口抽样会排除内部越过 episode 边界的情况。

### 5.2 阶段 B：监督学习世界模型

从 replay 取一段真实状态和动作序列，初始输入为真实首状态，之后用预测状态继续递推，动作始终来自日志。模型想回答：“若执行这些已经执行过的动作，我能否预测出相同的后续状态？”它不在此阶段选择更好的动作。

<div class="sm-equation">
<math display="block"><mtext>ŝ₀ = s₀，ŝⱼ₊₁ = fω(ŝⱼ, aⱼˡᵒᵍ, ξ)</mtext></math>
<math display="block"><mtext>LWM = Σⱼ weighted_error(ŝⱼ, sⱼ)</mtext></math>
</div>

论文允许状态、奖励、观测和终止 head 是学习或解析形式；解析 head 无对应拟合损失。固定代码实际只优化动力学状态损失，奖励、观测、软终止解析构造。GenCoord 的监督 blocks 包括积分后的 root 位置/姿态、关节角和关节速度，按 nominal error 缩放；不是全部状态通道的简单等权 MSE。

这个阶段只更新 ω。默认一次模型 update 有 10 个 batch，各 2048 个窗口。代码 `horizon=8` 采样 8 帧，只有 7 次可与后续真实状态配对的转移；论文 k=8 的预测步记号不可直接等同这个参数。

### 5.3 阶段 C：用当前 actor 在模型里想象新动作

从 replay 选真实状态起点及必要历史，固定模型权重。actor 根据当前预测观测和目标出新动作，模型推进状态，解析计算 reward/term，再将新观测送回 actor，重复 H=32 次。这条序列的动作**不再照抄日志**。

这个阶段每一步的环境接口为：

```text
WorldModelEnv.step(action [B,29])
    → next_obs：history、goal_motion、critic 输入等字段
    → reward [B]
    → term_prob [B]
```

`WorldModelEnv` 内部维护预测状态、参考索引、上一动作、上下文和历史，因此调用签名只显式传 action。它推进的是参考所定义的任务及身体状态，不是在凭空生成新的人体动作片段。

### 5.4 参数与梯度边界

<div class="sm-table">

| 阶段 | 使用的数据 | 优化目标 | 更新参数 | 必须保持固定的东西 |
| --- | --- | --- | --- | --- |
| 真实采集 | 当前策略的真实仿真转移 | 为模型供数、记录回报 | 不做学习更新 | 仿真前向无需构反传图 |
| Dynamics 拟合 | replay 连续窗口 | 预测状态误差 | ω | 日志状态、动作是监督 |
| Actor 更新 | 当前策略的可微想象轨迹 | 想象回报最大化，加接口辅助项 | θ | 模型参数、critic 参数固定，但对输入的导数保留 |
| Critic 拟合 | detach 的想象轨迹 | 价值与固定 λ-return 的 MSE | ψ | 目标、预测轨迹和 actor 不跟着这项回归更新 |

</div>

**固定参数不等于 `detach()` 整个模块输出。** 如果把 dynamics 的下一状态逐步 detach，跨时间梯度就没了；如果对整个动力学前向使用 no_grad，连动作如何影响下一状态的梯度也没了。

## 六、BPTT 与 critic 如何把想象轨迹变成学习信号 {#bptt}

### 6.1 actor 优化的代理目标

论文式 (2) 将短期奖励和末端价值相接：

<div class="sm-equation">
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mover accent="true"><mi>J</mi><mo>^</mo></mover><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mi mathvariant="double-struck">E</mi><mtext> ⁣</mtext><mrow><mo fence="true">[</mo><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>0</mn></mrow><mrow><mi>H</mi><mo>−</mo><mn>1</mn></mrow></munderover><msup><mi>γ</mi><mi>t</mi></msup><msub><mover accent="true"><mi>c</mi><mo>^</mo></mover><mi>t</mi></msub><msub><mover accent="true"><mi>r</mi><mo>^</mo></mover><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>+</mo><msup><mi>γ</mi><mi>H</mi></msup><msub><mover accent="true"><mi>c</mi><mo>^</mo></mover><mi>H</mi></msub><msub><mi>V</mi><mi>ψ</mi></msub><mo stretchy="false">(</mo><msub><mover accent="true"><mi>s</mi><mo>^</mo></mover><mi>H</mi></msub><mo separator="true">,</mo><msub><mi>g</mi><mi>H</mi></msub><mo separator="true">,</mo><mi>ξ</mi><mo stretchy="false">)</mo><mo fence="true">]</mo></mrow></mrow></semantics></math>
</div>

H=32、γ=0.99。前半部分是可微模型内的奖励，后半部分估计第 32 步之后的价值。H 是本次反传展开长度，不是动作片段的最大长度，也不意味着任务只优化 0.64 s 的行为。

ĉ 在计入当前 transition reward 后再更新，用于后续奖励与末端价值。例如前两步 p<sub>term</sub> 为 0.1、0.2，则 c 为 1、0.9、0.72。教学设定 H=2、两个 reward 都为 1、末端 value=5，则目标为 1+0.99×0.9+0.99²×0.72×5=**5.41936**。这是软代理计算，不是作者的实测回报。

### 6.2 梯度为什么能穿过动力学

设一条路径为 θ → a<sub>t</sub> → ŝ<sub>t+1</sub> → 以后奖励。链式法则中出现 ∂f<sub>ω</sub>/∂a 与 ∂f<sub>ω</sub>/∂s。ω 不更新，并不妨碍求这些输入导数。更早的动作还会通过未来状态、未来 actor 输入和软存活权重影响后面的回报，BPTT 将这些路径的贡献汇总到 θ。

可用一个**教学两步系统**看清早期动作的信用分配：s₀=0，s₁=s₀+a₀，s₂=s₁+a₁，目标 g=1，J=−(s₁−g)²−(s₂−g)²。取 a₀=0.2、a₁=0.3，则 s₁=0.2、s₂=0.5、J=−0.89。

<div class="sm-equation">
<math display="block"><mtext>∂J/∂a₀ = −2(s₁−g) − 2(s₂−g) = 2.6</mtext></math>
<math display="block"><mtext>∂J/∂a₁ = −2(s₂−g) = 1.0</mtext></math>
</div>

a₀ 的梯度包括它对第二步结果的影响，不只看第一步。这个例子把动作当独立变量演示局部导数；真实 SuperMimic 中每一步动作都由同一组 θ 的 actor 产生，而且未来 actor 输入依赖当前预测状态，还要继续对这些路径求导。例子不是机器人动力学模型，也不是训练复现。

“analytic gradient”是**对学习代理的自动微分路径导数**，不是真实接触物理的精确无偏梯度。模型即使预测误差小，其局部 Jacobian 也可能不准。由错误导数优化得到的策略可能利用模型漏洞，所以低方差的好处必须与模型偏差一起评价。

### 6.3 critic 的 GAE 训练不是把 actor 重新变成 PPO

critic 将想象轨迹的奖励和价值递推混合。令 V<sub>t</sub>=V<sub>ψ</sub>(ŝ<sub>t</sub>,g<sub>t</sub>,ξ)，λ=0.95，则论文式 (3) 等价为：

<div class="sm-equation">
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover accent="true"><mi>R</mi><mo>^</mo></mover><mi>H</mi></msub><mo>=</mo><msub><mi>V</mi><mi>H</mi></msub></mrow></semantics></math>
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover accent="true"><mi>R</mi><mo>^</mo></mover><mi>t</mi></msub><mo>=</mo><msub><mover accent="true"><mi>r</mi><mo>^</mo></mover><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>+</mo><mi>γ</mi><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><msub><mover accent="true"><mi>d</mi><mo>^</mo></mover><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo stretchy="false">)</mo><mrow><mo fence="true">[</mo><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><mi>λ</mi><mo stretchy="false">)</mo><msub><mi>V</mi><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>+</mo><mi>λ</mi><msub><mover accent="true"><mi>R</mi><mo>^</mo></mover><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo fence="true">]</mo></mrow></mrow></semantics></math>
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>L</mi><mi>V</mi></msub><mo stretchy="false">(</mo><mi>ψ</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mrow><mi mathvariant="normal">mean</mi><mo>⁡</mo></mrow><mi>t</mi></msub><mtext> ⁣</mtext><mrow><mo fence="true">[</mo><msup><mrow><mo fence="true">(</mo><msub><mi>V</mi><mi>ψ</mi></msub><mo stretchy="false">(</mo><msub><mover accent="true"><mi>s</mi><mo>^</mo></mover><mi>t</mi></msub><mo separator="true">,</mo><msub><mi>g</mi><mi>t</mi></msub><mo separator="true">,</mo><mi>ξ</mi><mo stretchy="false">)</mo><mo>−</mo><mi mathvariant="normal">stopgrad</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mover accent="true"><mi>R</mi><mo>^</mo></mover><mi>t</mi></msub><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow><mn>2</mn></msup><mo fence="true">]</mo></mrow></mrow></semantics></math>
</div>

λ=0 时主要使用一步自举，λ=1 时沿这条短轨迹累积到末端自举。代码先计算固定 targets，再做 5 轮、每轮 4 个 minibatch 价值回归。critic 的目标来自**想象轨迹**，它不是额外真实长程数据带来的准确保证。

这里 GAE 用于价值函数拟合。actor 仍对 Ĵ 直接反传，没有因此引入 PPO 的概率比和 clipped surrogate。类似地，actor 更新末端 value 时应固定 ψ、保留 ∂V/∂ŝ，而不是让 actor loss 通过改变 critic 参数“抬高分数”。

## 七、它究竟如何“替代强化学习”：实际替代的是 PPO 路径 {#rl}

更准确的提问是：**它如何用基于模型的可微策略优化，替代原先基于模型自由 PPO 的训练方式？** 两者解的是相同类型的长期奖励控制问题；MDP/POMDP、策略、奖励和交互数据并没有消失。

### 7.1 PPO 的策略更新从哪里来

模型自由方法把转移当黑盒，从执行动作后的奖励估计 advantage，再利用策略对动作的对数概率导数。一个概念性策略梯度表达为：

<div class="sm-equation">
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="normal">∇</mi><mi>θ</mi></msub><mi>J</mi><mo>≈</mo><msub><mrow><mi mathvariant="normal">mean</mi><mo>⁡</mo></mrow><mi>t</mi></msub><mtext> ⁣</mtext><mrow><mo fence="true">[</mo><msub><mi mathvariant="normal">∇</mi><mi>θ</mi></msub><mi>log</mi><mo>⁡</mo><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>a</mi><mi>t</mi></msub><mo>∣</mo><msub><mi>o</mi><mi>t</mi></msub><mo separator="true">,</mo><msub><mi>g</mi><mi>t</mi></msub><mo stretchy="false">)</mo><mtext> </mtext><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi></msub><mo fence="true">]</mo></mrow></mrow></semantics></math>
</div>

PPO 实际还有 old/new policy ratio、clipping、多轮优化等处理。上式只说明梯度来源，不能称为完整 PPO 公式，也不能将 PPO 的整体估计一概说成无偏。它不需要 ∂P/∂a，但需要用采样反馈判断动作好坏，通常有较高采样开销。

### 7.2 SuperMimic 把方向信息换成了模型导数

模型回答“动作稍微改变，下一状态会怎样改变”，再将影响传到奖励。因而 actor 更新使用 ∂Ĵ/∂θ 的路径导数，不必靠动作 log-prob 乘 advantage 来获取主要改进方向。在短时域、模型导数足够有用时，它通常比黑盒采样方向更直接，但也会受到代理误差影响。

<div class="sm-table">

| 维度 | 传统 PPO-Sim | SuperMimic |
| --- | --- | --- |
| 任务定义 | 状态/观测、动作、奖励和终止 | 仍需定义同类要素 |
| 策略学习的轨迹 | 主要由刚体仿真器执行产生 | 短轨迹主要由学习动力学展开 |
| 物理仿真用途 | 同时提供策略采样反馈 | 持续提供模型监督和真实起点 |
| actor 主要梯度 | 概率比/对数概率与 advantage | 奖励经过模型状态和动作的 BPTT |
| 是否学习动力学 | 不要求显式动力学模型 | 显式拟合共享动力学 |
| critic | 支持 advantage/价值估计 | 主要补充短展开末端回报，并回归想象 λ-return |
| 核心风险 | 方差、采样效率、优化配置 | 模型偏差、错误 Jacobian、模型漏洞、价值误差 |
| 训练范式 | 模型自由 RL | 基于模型 RL |

</div>

因此，不能把它概括成“把 RL 变成普通监督学习”。**世界模型是监督学习，critic 是自举价值学习，actor 是通过模型进行的强化学习策略优化。** actor 没有一份“正确动作标签”可直接回归；当前 `.npz` 参考轨迹也不等于 expert action 数据集。

它同样不是完整轨迹优化/MPC 的直接部署形式：训练时反复更新 actor 参数，部署时一次前向输出动作；不是每 20 ms 在线优化 32 个未来动作，然后只执行第一个。BPTT 是训练计算梯度的工具，不是和强化学习并列的任务类别。

### 7.3 为什么更快，为什么不能把倍数随意相乘

效率来源有三层：共享模型摊销跨动作动力学；神经模型 rollout 在实际 batch 下比 MuJoCo Warp 快；使用模型导数又减少达到相近回报所需的想象步数。论文的 PPO-WM 对照在同样使用世界模型时仍观察到约 64 倍想象步效率差，说明不只是前向速度造成收益。

但吞吐倍数、想象步数倍数和系统 GPU-hour 比来自不同实验，不能相乘当作精确加速公式。完整成本还包括采集、模型拟合、BPTT、critic 和工程开销。论文相对 SONIC 的大预算优势也不是同硬件、同数据量的纯算法倍数。

更重要的是，转为可微代理没有解决所有控制问题：接触附近的光滑近似、未见状态、失准 critic 和真机偏差都可能影响策略。论文训练集上的零失败测的是给定条件下的动作覆盖，不是未见动作泛化或真机可靠性保证。

## 八、沿官方代码读完整流程，保留版本差异 {#code}

### 8.1 主调用链

```text
train.py::main
  → 读取 task、动作 .npz/registry、训练配置
  → create_env：构造真实物理仿真
  → SuperMimicRunner：构造 representation、Dynamics、actor、critic、buffer
  → run() 循环
       1. step()：actor → 真实 env.step → 写 replay、更新统计
       2. 按 Ratio 决定本轮是否进入学习
       3. WorldModelLearner.update：日志动作 → 自回归预测 → state loss → 更新 ω
       4. sample_start：取真实起点及因果历史
       5. PolicyLearner.update：模型权重固定，想象 32 步 → 更新 θ
       6. ActorCriticPolicyLearner._fit_critic：GAE → 固定 target → 更新 ψ
       7. 周期保存 actor / world_model / critic，符合条件时导出 ONNX
```

默认频率为 E/(10×2048×8)×replay_ratio；E=4096、replay_ratio=16 时为 0.4。长期平均每个“所有环境各走一步”的采集调用触发 0.4 次模型更新调用及其配套策略更新，不是每一条 transition 更新 0.4 次。模型 update 内部又有 10 次 minibatch 优化。

### 8.2 最关键的策略更新代码应如何读

下面为按源码重写的教学伪代码，省略编译、混合精度、裁剪和多接口细节：

```python
# 教学伪代码：变量 shape 与梯度边界是重点，不是完整可运行 trainer。
freeze_weights(dynamics, representation)
obs = wm_env.reset(start)                 # 真实起点固定，后续预测不断图
ret, survival = 0.0, 1.0
critic_trajectory = []

for t in range(H):
    action = actor(obs)                   # [B, 29]，当前策略生成
    next_obs, reward, p_done = wm_env.step(action)
    ret = ret + gamma**t * survival * reward
    survival = survival * (1.0 - p_done)
    critic_trajectory.append(detach_for_value_fit(obs, reward, p_done))
    obs = next_obs

freeze_weights(critic)                    # 保留 value 对预测状态的导数
value = critic(obs['critic']).squeeze(-1)  # [B]，避免与 [B,1] 意外广播
ret = ret + gamma**H * survival * value
actor_optimizer_step((-ret + auxiliary_loss).mean())
fit_critic_with_fixed_gae_targets(critic_trajectory, obs)
```

其中 `freeze_weights`、`detach_for_value_fit` 等是说明用函数名，不是仓库 API。**ret 路径保留梯度，critic 训练数据副本 detach**；二者是不同用途。补齐任意一条路径之前，要先问：这一步是在更新 ω、θ，还是 ψ？

### 8.3 不应混用的论文与公开代码配置

<div class="sm-table">

| 项目 | 论文 v2 | 代码 `698ea39` |
| --- | --- | --- |
| actor 输入 | 10 帧本体历史 | 默认 `rep_state`、history=1；`proprio`、history>1 可配置 |
| 模型窗口 | k=8 的预测步描述 | L=8 帧，7 次有监督预测 |
| 模型 heads | 可学习或解析 | state 学习，reward/obs/soft term 解析 |
| 采集动作噪声 | 输出后加高斯噪声，可选 | Runner 路径未显式加这一项 |
| 优化器 | Adam 与论文学习率计划 | 中间线性权重用 Muon，其余 Adam；不能据此假定论文学习率计划完整相同 |
| 速度任务 | 任务奖励 RL encoder，heading 速度/世界 yaw；任务梯度只更新 encoder | 参考 body-frame 速度加噪，所有接口共用 motion reward，主回报可更新 shared decoder |
| critic | 一般框架可每接口独立 | runner 创建一个共享 critic |
| 运动数据 | 大规模 BONES-SEED 实验 | 默认 registry 为 LAFAN 的单个动作片段 |

</div>

所以，本页关于“93×10 本体输入”和论文速度任务的描述，不能自动视为默认启动命令会得到的设置。代码有多 encoder 并不等于完整实现论文全部任务奖励实验；latent 对齐辅助损失只更新非 anchor encoder，也不等于主回报梯度同样只更新 encoder。

### 8.4 带着问题读源文件

以下链接固定在同一 commit，不随 main 漂移：

<div class="sm-table">

| 阅读入口 | 要回答的问题 |
| --- | --- |
| [train.py](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/scripts/train.py) | 加载了哪个 task 和哪些参考文件？ |
| [env_cfgs.py](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/tasks/env_cfgs.py) | 哪些观测给 actor，哪些状态仅训练可见？ |
| [representations.py](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/representations.py#L95-L233) | 参考窗口如何变成 640/670 维 goal？ |
| [GenCoordRepresentation](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/representations.py#L453-L593) | 71 维如何编码为 68 维，35 维增量怎样积分？ |
| [models.py](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/models.py) | encoder/decoder 与 Dynamics 的输入输出有什么区别？ |
| [Runner.run](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/runners/supermimic_runner.py#L574-L626) | 采集与两个 learner 怎样交替？ |
| [replay_buffer.py](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/replay_buffer.py) | 窗口怎样避免越过 reset？ |
| [wm_learner.py](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/learners/wm_learner.py#L101-L191) | 动作来自哪里，监督目标对应哪一帧？ |
| [WorldModelEnv](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/envs/world_model_env.py#L67-L151) | 如何从预测状态得到 reward、soft term 与 next_obs？ |
| [policy_learner.py](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/learners/policy_learner.py#L99-L199) | actor 的 BPTT 与 critic 的回归在哪里分开？ |
| [exporter.py](https://github.com/HybridRobotics/supermimic/blob/698ea39bc901d8fe733b3c8621df3199d241f7e4/src/supermimic/runners/exporter.py) | 部署输入的历史排列与目标怎样封装？ |

</div>

MaxCoord 任务使用每个 body 的位置、姿态和速度：若有 M 个 body，full state 为 13M，rep state 为 15M+4，prediction 为 6M，并结合解析 IK 生成关节信息。它与 GenCoord 共用训练骨架，但本页的 71/68/35 数字不能套到 MaxCoord。

## 九、训练结束后，真机每一步执行什么 {#deployment}

训练通常保存 world_model.pt、actor.pt 和 critic.pt；真机需要的是 actor 的推理部分及对应归一化、输入/动作契约，**不需要每个周期重新训练模型、拟合 critic 或做 32 步搜索**。

```text
读关节编码器、IMU、上一动作
  → 更新 10 帧本体历史，按训练时的字段顺序排列
  → 读取参考窗口，构造相对目标姿态
  → Motion Encoder：640 维目标 → 32 维 latent
  → Decoder：latent + 930 维历史 → 29 维 raw action
  → 动作 scale/offset → 关节 setpoint → 底层 PD / 执行器
  → 机器人运动，下一控制周期读取新观测
```

ONNX 的 motion wrapper 输入为 obs 与 time_step；obs 已包含 actor 所需目标，time_step 还用于查表输出附带的参考 joint/body 数据。**这些附加数据是已有参考表，不是 actor 或世界模型现场预测的真实未来。** velocity wrapper 则以本体历史和 3D command 为输入，但对应 encoder 必须实际训练过，不能因导出了文件就假定有能力。

默认 rep_state actor 需要基座线速度等状态量，不能直接当成本体传感器策略部署。proprio 模式还要保证训练的 frame-major 历史与部署接口 term-major 历史正确转换；总维数相同但排列不同，仍会让策略读错输入。

最后，ONNX 导出不等于完整真机部署程序。硬件通信、IMU/坐标标定、动作排序、执行器限制、控制时序与保护机制仍须和实际 G1 系统集成。论文展示了真实机器人迁移，但这里没有重新运行或验证这些硬件实验。

## 十、用一拍控制检查是否真正理解了算法 {#check}

设当前机器人正在跟踪一个跳跃片段。正确的理解顺序是：

1. **知道目标。** i 与 φ 决定此刻的参考及未来窗口；它不是 actor 应该原样输出的 29 个电机指令。
2. **看见身体。** 环境有完整 X，actor 只能看到自己的本体历史与目标。相同目标下，身体速度不同可能需要完全不同的控制。
3. **选择动作。** encoder 处理参考，decoder 结合本体历史输出 29 维控制量，低层控制器将它转成物理作用。
4. **身体响应。** 真实采集时由刚体仿真推进；想象训练时由学习模型加解析积分推进。两者承担同一类转移角色，但精度不同。
5. **得到反馈。** 使用执行后的状态、对应参考和上一动作计算奖励与终止；动作不只为眼前得分，还影响后续平衡。
6. **改进控制器。** 真实转移监督 ω，想象回报通过 BPTT 改进 θ，固定 λ-return 回归 ψ。更新的是可重复使用的策略，而非每次保存一条固定动作轨迹。

<details>
<summary>没有 world model，RL 问题还存在吗？</summary>

存在。只要还有环境交互、动作选择和长期奖励最大化，就能用 PPO 等方法求解。世界模型改变的是求解路径，不是凭空创造或取消这个控制任务。

</details>

<details>
<summary>冻结模型后为什么仍能训练 actor？</summary>

因为只是不更新模型的权重 ω，仍能计算输出状态相对输入动作的导数。若对整个模型前向 no_grad，或逐步 detach 下一状态，主要 BPTT 路径就被切断。

</details>

<details>
<summary>有参考轨迹，为什么不是普通监督模仿学习？</summary>

参考给出期望状态，不给出物理执行时的正确控制动作。actor 通过长期跟踪奖励、终止与动作代价学习控制，而不是只回归 expert action 标签。世界模型的监督训练与 actor 的 RL 训练是不同阶段。

</details>

## 资料出处与阅读范围

1. Qiayuan Liao 等，**SuperMimic: Scaling Humanoid Whole-Body Control with One Differentiable World Model**，arXiv:2610.28480v2，2026-11-09；重点依据 §3、附录 A–D 及 Algorithm A.1。本文未把后续版本自动混入。[固定论文版本](https://arxiv.org/abs/2610.28480v2)
2. **HybridRobotics/supermimic 官方源码**，Apache-2.0，commit `698ea39bc901d8fe733b3c8621df3199d241f7e4`，2026-11-18。本文输入输出、窗口语义、解析积分与更新顺序由此静态核查。[固定源码版本](https://github.com/HybridRobotics/supermimic/tree/698ea39bc901d8fe733b3c8621df3199d241f7e4)
3. [作者项目页](https://supermimic.github.io/)。用于项目身份及展示入口；具体算法以固定论文与源码为准。
4. 用户指定的 [CSDN 概览文章](https://damodev.csdn.net/6addce1749ed150a32d9cbd1.html) 和补充材料用于确定阅读问题；技术细节回到一手来源核查。已重新整理粘贴材料中粘连的代码、公式与来源标签，未将其中指令当作任务要求。

*本笔记是论文与源码的解释性重建。扩展 Markov 状态、教学积分和梯度算例为本文讲解；模型性能、算法复现、真机可靠性与独立读者理解未在本次工作中重新测量。底层 `mjlab_research` 依赖未做完整源码审计。*

<style scoped>
.sm-equation {
  overflow-x: auto;
  margin: 1.2rem 0;
  padding: 0.85rem 0.65rem;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}
.sm-equation math {
  min-width: max-content;
  margin: 0.45rem auto;
  font-size: 1rem;
}
figure { margin: 1.5rem 0; }
figure img { display: block; width: 100%; height: auto; border-radius: 8px; }
figcaption { margin-top: 0.65rem; font-size: 0.9rem; line-height: 1.7; color: var(--vp-c-text-2); }
details { margin: 1rem 0; padding: 0.75rem 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; }
summary { cursor: pointer; font-weight: 600; }
.sm-table { overflow-x: auto; max-width: 100%; margin: 1rem 0; }
.sm-table table { display: table; min-width: 40rem; margin: 0; }
</style>

<!--
阅读审计：中文深度机制解读，面向了解基本神经网络/RL、首次阅读本文的读者。
本地源 PDF SHA256: 66252d821553af508cd3e6c10d4e326fa0595f39a2a7d8f854eafd2a8fbab2a8。
来源覆盖：§1–2 动机/定位→一、七；§3.1 与附录 A/D 状态动作目标奖励重置→二至五；§3.2 与附录 C 动力学→三/五/八；§3.3 Eq2/3→六；§4–6 证据与边界仅保留影响算法判断者→七/九，不作为本页重新完整实验评审。
代码版本固定698ea39；入口、runner、buffer、representations、models、WMEnv、WM learner、policy learner、exporter 已静态追踪；未安装或执行训练依赖。
数值：71/68/35/33/640/670/771/962 为条件明确的维数计算；rho=0.4；q'=0.40525；两步目标J=-0.89，动作偏导2.6/1.0；软存活算例5.41936。
重要解释修正：SuperMimic仍是RL；MDP状态不等于actor观测；有限历史不保证充分；模型梯度不是物理精确梯度；GAE用于critic不等于PPO actor；窗口8帧与8转移不同；代码默认与论文区别单列。
图2保留原图归属；code-workflow为原创源码流程重绘；本次仅发布解释性摘图，不复制原论文全文或作者代码仓库。
交付核验：生产构建通过；浏览器检查19个MathML公式、2张配图、章节锚点和栏目入口；折叠问答通过鼠标/键盘检查；无脚本正文可读；手机宽度390px无页面横向溢出，宽表在表内横向滚动。此为界面与作者/AI核查，不是实验复现或独立读者评测。
-->
