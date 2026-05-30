---
title: QT6 + OpenCV Dev Environment Setup on Windows
titleEn: QT6 + OpenCV Dev Environment Setup on Windows
date: 2026-05-29 20:03
tags: [QT6, OpenCV, CMake, Windows, Environment Setup]
tagsEn: [QT6, OpenCV, CMake, Windows, Environment Setup]
description: A complete guide to setting up QT6 + OpenCV dev environment on Windows 11, including OpenCV compilation, CMake configuration, and common error fixes.
descriptionEn: A complete guide to setting up QT6 + OpenCV dev environment on Windows 11, including OpenCV compilation, CMake configuration, and common error fixes.
---

# QT6 + OpenCV Dev Environment Setup on Windows

> This article is also available on [WeChat Official Account](https://mp.weixin.qq.com/s/4Ar77FBhNBwBzsD4fq1nVw).

## Introduction

While there are many tutorials online, they often involve outdated environments. As developers, we prefer to use the latest versions. After trial and exploration, I successfully set up the environment. Due to the limited sample size, unexpected issues may still arise. If you encounter problems during compilation, feel free to reach out via the comments section or email — I'm happy to help. Of course, before contacting me, I suggest searching online first to see if a solution already exists.

Email: krivewyh@163.com

If you haven't successfully compiled the OpenCV library, here's a pre-compiled version:

- Baidu Netdisk: [https://pan.baidu.com/s/1YtclVnELZiE3tLUVqyxCuQ?pwd=4ZPM](https://pan.baidu.com/s/1YtclVnELZiE3tLUVqyxCuQ?pwd=4ZPM)
- Extraction code: `4ZPM`

## Environment Overview

| Component | Version |
|-----------|---------|
| OS | Windows 11 |
| QT IDE | 6.7.1 |
| OpenCV | 4.9.0 |
| CMake | 3.29.3 |

## 1. OpenCV Download

OpenCV download: [https://opencv.org/releases/](https://opencv.org/releases/)

![](/blog/qt6-opencv/01.png)

Extract the OpenCV source code:

![](/blog/qt6-opencv/02.png)

Choose your extraction path:

![](/blog/qt6-opencv/03.png)

## 2. CMake Download

CMake download: [https://cmake.org/download/](https://cmake.org/download/)

Choose the following version:

![](/blog/qt6-opencv/04.png)

Select your download path:

![](/blog/qt6-opencv/05.png)

## 3. QT6 Download

QT download: [https://www.qt.io/download-qt-installer-oss](https://www.qt.io/download-qt-installer-oss)

![](/blog/qt6-opencv/06.png)

Download the Windows version — click **Qt Online Install for Windows**.

Remember your download path, but **do NOT launch the installer yet**. Qt uses overseas mirrors by default, which can be very slow and may cause failures.

### Mirror Switch Method

Open the terminal — press `Win+R`, type `cmd`:

![](/blog/qt6-opencv/07.png)

![](/blog/qt6-opencv/08.png)

Find `qt-unified-windows-x64-X.X.X-online.exe`, navigate to its folder (the path you chose when downloading Qt):

```bash
cd yourpath
qt-unified-windows-x64-X.X.X-online.exe --mirror https://mirror.nju.edu.cn/qt
```

![](/blog/qt6-opencv/09.png)

> Replace `qt-unified-windows-x64-X.X.X-online.exe` with your actual Qt installer name. Mine is `qt-online-installer-windows-x64-4.8.0.exe --mirror https://mirror.nju.edu.cn/qt`

The installer will launch automatically. You'll need to log in or register a Qt account:

![](/blog/qt6-opencv/10.png)

Then proceed with the standard Qt installation. Apart from component selection (additional components can be installed later as needed), there's nothing special to watch out for. Here's what I chose:

![](/blog/qt6-opencv/11.png)

Click Next through the remaining steps.

## 4. Environment Variables Setup

Open System Settings:

![](/blog/qt6-opencv/12.png)

![](/blog/qt6-opencv/13.png)

![](/blog/qt6-opencv/14.png)

![](/blog/qt6-opencv/15.png)

![](/blog/qt6-opencv/16.png)

Add the following paths to your environment variables — replace with your actual folder paths:

![](/blog/qt6-opencv/17.png)

## 5. CMake Build — Compile OpenCV

This is the most critical step.

### Step 1. Initial Configuration

![](/blog/qt6-opencv/18.png)

After setting paths, click **Configure**:

![](/blog/qt6-opencv/19.png)

Select Qt's built-in MinGW compiler (gcc and g++):

![](/blog/qt6-opencv/20.png)

Example paths:

```
D:\Qt\Tools\mingw1120_64\bin\gcc.exe
D:\Qt\Tools\mingw1120_64\bin\g++.exe
```

Click **Finish**. After a lengthy wait, it should compile successfully.

### Step 2. Troubleshooting Errors

Here are the warnings and errors I encountered (for reference):

![](/blog/qt6-opencv/21.png)

![](/blog/qt6-opencv/22.png)

![](/blog/qt6-opencv/23.png)

![](/blog/qt6-opencv/24.png)

The warnings/errors are numbered 248, 144, 140, and 54 respectively.

#### Fixing Errors 54, 140, 144

Uncheck the following item — this is a path error warning, disabling it won't affect the software:

![](/blog/qt6-opencv/25.png)

#### Fixing Error 248

Error 248 occurs when CMake cannot connect to the server during OpenCV compilation, causing failures downloading ffmpeg.dll, ippicv, etc.

Error 248 is caused by GitHub being inaccessible from mainland China. I tried multiple approaches — VPN, changing DNS — before finding this solution: **modify the .cmake download URLs to use a proxy**.

Here's a proxy service (you can find your own):

- Proxy: [https://ghproxy.com/](https://ghproxy.com/)

> Using a VPN is recommended if available.

**1. Navigate to** `F:\opencv\sources\3rdparty\ffmpeg`:

![](/blog/qt6-opencv/26.png)

Modify the download URL:

![](/blog/qt6-opencv/27.png)

Open with Notepad:

![](/blog/qt6-opencv/28.png)

Change this URL:

```
https://raw.githubusercontent.com/opencv/opencv_3rdparty/${FFMPEG_BINARIES_COMMIT}/ffmpeg/
```

To:

```
https://mirror.ghproxy.com/https://raw.githubusercontent.com/opencv/opencv_3rdparty/${FFMPEG_BINARIES_COMMIT}/ffmpeg/
```

![](/blog/qt6-opencv/29.png)

**2. Navigate to** `F:\opencv\sources\modules\gapi\cmake`:

![](/blog/qt6-opencv/30.png)

![](/blog/qt6-opencv/31.png)

Apply the same proxy modification:

![](/blog/qt6-opencv/32.png)

Change:

```
https://github.com/opencv/ade/archive/
```

To:

```
https://mirror.ghproxy.com/https://github.com/opencv/ade/archive/
```

After modification:

![](/blog/qt6-opencv/33.png)

Now there should be no more errors or warnings.

### Step 3. Continue QT Configuration

Refer to the table below:

| Name | Value |
|------|-------|
| WITH_OPENGL | Checked |
| WITH_QT | Checked |
| WITH_IPP | Unchecked |

After selection, click **Configure**:

![](/blog/qt6-opencv/34.png)

We're using Qt6, so ignore Qt5. Set **Qt6_DIR** to: `D:/Qt/6.7.1/mingw_64/lib/cmake/Qt6`

> Make sure each path matches your actual installation. If not auto-filled, you'll need to locate them manually.

Click **Configure** again.

After `Configuring done`, click **Generate**.

### Step 4. MinGW Build

Open terminal and navigate to the output folder:

![](/blog/qt6-opencv/35.png)

Enter the following command to start compilation (`-j 16` for multi-core; adjust based on your CPU — use `mingw32-make -j 4` if unsure):

```bash
mingw32-make -j 16
```

Now wait. As long as there are no errors, you're good:

![](/blog/qt6-opencv/36.png)

After compilation, install with:

```bash
mingw32-make install
```

![](/blog/qt6-opencv/37.png)

### Configure Environment Variables

![](/blog/qt6-opencv/38.png)

## 6. Using OpenCV in QT

### Step 1. Create a New Qt Project and Configure

Create a new project for testing:

![](/blog/qt6-opencv/39.png)

Modify the `.pro` configuration file:

![](/blog/qt6-opencv/40.png)

![](/blog/qt6-opencv/41.png)

Add the following paths (replace with your own):

```makefile
INCLUDEPATH += D:\opencv\opencv\qt-opencv-build\install\include\
               D:\opencv\opencv\qt-opencv-build\install\include\opencv2
LIBS += -L D:\opencv\opencv\qt-opencv-build\lib\libopencv_*.a
```

### Step 2. Test

![](/blog/qt6-opencv/42.png)

Test code:

```cpp
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
using namespace cv;

int main()
{
    Mat image = imread("C:\\Users\\86136\\Pictures\\Camera Roll\\1.jpg");    // replace with your path
    resize(image, image, Size(128, 128));
    imshow("Display window", image);
    waitKey();

    return 0;
}
```

## Result

![](/blog/qt6-opencv/43.png)

![](/blog/qt6-opencv/44.png)

---

> **Original Article**: [QT6 + OpenCV Dev Environment Setup on Windows](https://mp.weixin.qq.com/s/4Ar77FBhNBwBzsD4fq1nVw)
>
> For questions, email: krivewyh@163.com
