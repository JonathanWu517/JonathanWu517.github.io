---
title: Window系统下QT6 + OpenCV开发环境配置
titleEn: QT6 + OpenCV Dev Environment Setup on Windows
date: 2026-05-29 20:03
tags: [QT6, OpenCV, CMake, Windows, 环境配置]
tagsEn: [QT6, OpenCV, CMake, Windows, Environment Setup]
description: 详细介绍在 Windows 11 系统下配置 QT6 + OpenCV 开发环境的完整流程，包括 OpenCV 编译、CMake 配置、常见报错解决方案。
descriptionEn: A complete guide to setting up QT6 + OpenCV dev environment on Windows 11, including OpenCV compilation, CMake configuration, and common error fixes.
---


# Window 系统下 QT6 + OpenCV 开发环境配置

> This article is also available on [WeChat Official Account](https://mp.weixin.qq.com/s/4Ar77FBhNBwBzsD4fq1nVw).

## 前言

虽然网上有很多教程，但它们通常涉及过时的环境。作为开发者，我们习惯于使用最新的版本。经过一系列的尝试和探索，我终于成功配置了环境。但由于我们的样本数量有限，我们不确定在过程中是否会遇到其他问题。如果您在编译过程中遇到问题，可以在后台留言或者发邮件，欢迎随时咨询我，我会尽力提供帮助。当然，在联系我之前，建议您先在网上搜索相关帖子，看看是否有现成的解决方案。

邮箱地址：krivewyh@163.com

如果你并没有成功编译好 opencv 库，这里我提供我编译好的 opencv 库：

- 百度网盘链接：[https://pan.baidu.com/s/1YtclVnELZiE3tLUVqyxCuQ?pwd=4ZPM](https://pan.baidu.com/s/1YtclVnELZiE3tLUVqyxCuQ?pwd=4ZPM)
- 提取码：`4ZPM`

## 环境介绍

| 组件 | 版本 |
|------|------|
| 系统 | Windows 11 |
| QT IDE | 6.7.1 |
| OpenCV | 4.9.0 |
| CMake | 3.29.3 |

## 一、OpenCV 下载

OpenCV 下载：[https://opencv.org/releases/](https://opencv.org/releases/)

![](/blog/qt6-opencv/01.png)

之后打开这个文件，进行 opencv 源码的解压：

![](/blog/qt6-opencv/02.png)

自己选择路径进行解压：

![](/blog/qt6-opencv/03.png)

## 二、CMake 下载

CMake 下载：[https://cmake.org/download/](https://cmake.org/download/)

选择下列版本：

![](/blog/qt6-opencv/04.png)

选择你的下载路径：

![](/blog/qt6-opencv/05.png)

## 三、QT6 下载

QT 下载：[https://www.qt.io/download-qt-installer-oss](https://www.qt.io/download-qt-installer-oss)

![](/blog/qt6-opencv/06.png)

下载 Windows 版本，点击 **Qt Online Install for Windows**。

之后选择你的下载路径并且记住，**此时一定不要打开下载安装**，因为 Qt 目前使用的是国外的源，下载会很慢，有可能失败。

### 换源方法

打开终端，使用 `Win+R`，输入 `cmd`：

![](/blog/qt6-opencv/07.png)

![](/blog/qt6-opencv/08.png)

找到 `qt-unified-windows-x64-X.X.X-online.exe`，进入该文件的文件夹（这文件夹是上文你的 Qt 下载时你选择所在的路径），具体如下：

```bash
cd yourpath
qt-unified-windows-x64-X.X.X-online.exe --mirror https://mirror.nju.edu.cn/qt
```

![](/blog/qt6-opencv/09.png)

> 注意将 `qt-unified-windows-x64-X.X.X-online.exe` 替换成你下载好的 Qt 下载器的名称。这里我的是 `qt-online-installer-windows-x64-4.8.0.exe --mirror https://mirror.nju.edu.cn/qt`

之后安装程序会自动打开。此时需要登入或注册一个 Qt 账号：

![](/blog/qt6-opencv/10.png)

之后就是常规的 Qt 下载安装了，除了需要下载的组件需要注意外（特殊组件的下载在后面需要的时候可以再下载），其他的下载安装没什么太多需要注意的。这里我选择的是：

![](/blog/qt6-opencv/11.png)

之后不断点击下一步就可以了。

## 四、配置环境变量

打开系统设置：

![](/blog/qt6-opencv/12.png)

![](/blog/qt6-opencv/13.png)

![](/blog/qt6-opencv/14.png)

![](/blog/qt6-opencv/15.png)

![](/blog/qt6-opencv/16.png)

添加以下地址到环境变量中，这些地址需要你们自己去寻找自己文件夹地址进行替换：

![](/blog/qt6-opencv/17.png)

## 五、CMake 编译 OpenCV 库并生成

这一步是最关键的。

### Step 1. 初步配置

![](/blog/qt6-opencv/18.png)

设置好后点击 **Configure**：

![](/blog/qt6-opencv/19.png)

选择 Qt 自带的编译器 MinGW 的 gcc 和 g++：

![](/blog/qt6-opencv/20.png)

路径范例为：

```
D:\Qt\Tools\mingw1120_64\bin\gcc.exe
D:\Qt\Tools\mingw1120_64\bin\g++.exe
```

点击 **Finish**。经过漫长的等待后，应该是能够编译成功的。

### Step 2. 排查错误

以下是我的警告和报错（仅供参考）：

![](/blog/qt6-opencv/21.png)

![](/blog/qt6-opencv/22.png)

![](/blog/qt6-opencv/23.png)

![](/blog/qt6-opencv/24.png)

以下警告报错分别为 248、144、140、54。

#### 解决 54、140、144 报错

取消勾选下面这一条，这个是路径错误的警告，取消勾选不会影响软件的运行：

![](/blog/qt6-opencv/25.png)

#### 解决 248 报错

248 的报错来源于 CMake 编译 opencv 时无法连接服务器，导致下载 ffmpeg.dll、ippicv 等发生失败。

248 的报错是因为 GitHub 是国外的网站，前期试了多种方法，比如梯子和更改电脑上网 IP 都没有解决，最后找到现在这种：**修改 .cmake 文件中的下载网站，利用代理下载**才成功解决。

这里提供一个代理网站，你也可以自己去找一个代理网站：

- 代理网站：[https://ghproxy.com/](https://ghproxy.com/)
- GitHub Proxy 代理加速 (ghproxy.com)

> 建议大家科学上网。

**1. 找到目标文件夹** `F:\opencv\sources\3rdparty\ffmpeg`：

![](/blog/qt6-opencv/26.png)

修改下载路径的代码：

![](/blog/qt6-opencv/27.png)

用记事本打开：

![](/blog/qt6-opencv/28.png)

把这一条网址：

```
https://raw.githubusercontent.com/opencv/opencv_3rdparty/${FFMPEG_BINARIES_COMMIT}/ffmpeg/
```

修改为：

```
https://mirror.ghproxy.com/https://raw.githubusercontent.com/opencv/opencv_3rdparty/${FFMPEG_BINARIES_COMMIT}/ffmpeg/
```

![](/blog/qt6-opencv/29.png)

**2. 找到目标文件夹** `F:\opencv\sources\modules\gapi\cmake`：

![](/blog/qt6-opencv/30.png)

![](/blog/qt6-opencv/31.png)

同理使用代理服务修改：

![](/blog/qt6-opencv/32.png)

把：

```
https://github.com/opencv/ade/archive/
```

修改为：

```
https://mirror.ghproxy.com/https://github.com/opencv/ade/archive/
```

修改后：

![](/blog/qt6-opencv/33.png)

此时查阅后就不再有报错和警告。

### Step 3. 继续配置 QT

参考下面表格：

| Name | Value |
|------|-------|
| WITH_OPENGL | 选中 |
| WITH_QT | 选中 |
| WITH_IPP | 不选 |

选择完成之后点击 **Configure**：

![](/blog/qt6-opencv/34.png)

我们是 Qt6 的版本，所以不管 Qt5，将 **Qt6_DIR** 后面的路径设置为：`D:/Qt/6.7.1/mingw_64/lib/cmake/Qt6`

> 注意表中的路径一定要和所对应的路径一样，如果没有自动填写好，需要一个个去找。

再次点击 **Configure**。

`Configuring done` 之后点击 **Generate**。

### Step 4. MinGW 编译

打开终端，进入输出文件夹：

![](/blog/qt6-opencv/35.png)

输入如下指令开始编译（`-j 16` 多核编译），可以根据自己电脑是几核的来设定，如果不清楚建议使用 `mingw32-make -j 4`：

```bash
mingw32-make -j 16
```

接下来就是漫长的等待，只要没有出现报错就可以：

![](/blog/qt6-opencv/36.png)

编译完成之后，输入如下指令安装：

```bash
mingw32-make install
```

![](/blog/qt6-opencv/37.png)

### 配置环境变量

![](/blog/qt6-opencv/38.png)

## 六、QT 中使用 OpenCV

### Step 1. 新建 Qt 工程并配置

创建新的项目进行测试：

![](/blog/qt6-opencv/39.png)

修改下面这个配置文件（后缀为 `.pro`）：

![](/blog/qt6-opencv/40.png)

![](/blog/qt6-opencv/41.png)

添加路径（注意换成自己文件的路径）：

```makefile
INCLUDEPATH += D:\opencv\opencv\qt-opencv-build\install\include\
               D:\opencv\opencv\qt-opencv-build\install\include\opencv2
LIBS += -L D:\opencv\opencv\qt-opencv-build\lib\libopencv_*.a
```

### Step 2. 测试

![](/blog/qt6-opencv/42.png)

测试代码：

```cpp
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
using namespace cv;

int main()
{
    Mat image = imread("C:\\Users\\86136\\Pictures\\Camera Roll\\1.jpg");    // 换成自己的路径
    resize(image, image, Size(128, 128));
    imshow("Display window", image);
    waitKey();

    return 0;
}
```

## 效果展示

![](/blog/qt6-opencv/43.png)

![](/blog/qt6-opencv/44.png)

---

> **原文链接**：[Window系统下QT6 + opencv开发环境配置](https://mp.weixin.qq.com/s/4Ar77FBhNBwBzsD4fq1nVw)
>
> 如有问题，欢迎邮件联系：krivewyh@163.com
