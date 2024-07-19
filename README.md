# Solid-Snake

## 多人線上貪食蛇遊戲

專案網址: [Solid Snake](https://e055339.com)

16-bit 風格的貪食蛇遊戲，功能包含: 即時對戰系統、登入系統、排行榜、遊戲生涯紀錄

遊玩畫面:

![gameplay](./public/images/game.gif)

## 專案使用技術&架構圖

- **前端**: HTML, CSS, Javascript, Socket.io
- **後端**: Node.js, Socket.io
- **CI/CD**: GitHub Actions
- **部署環境**: AWS EC2, RDS, ALB, ElastiCache

![架構圖](./asset/solid%20snake架構圖2.drawio.png)

## 壓力測試報告

使用 [Artillery](https://www.artillery.io/) 針對 Socket.io `startGame` event 進行壓力測試，目的是測試伺服器最高能承受多少玩家同時加入。測試報告如下：

### 測試環境

- **Server**: AWS EC2 t2.micro (記憶體 1G)
- **Redis**: AWS ElastiCache
- **Mysql**: AWS RDS
- **Test Tool**: Artillery
- **Load Balancer**: AWS Application Load Balancer

### 測試流程

- 先測試單台瓶頸點，再以同樣條件測試使用 Load Balancer 查看差異

### 測試條件

- 每秒 25 個新連線，持續 30 秒，連續測試 5 次

### CPU 和記憶體使用情况

#### CPU 使用量

- **單台情況下**: CPU 使用量最高到 **98%**
- **開啟 ALB 情況下**: server1 CPU 使用量最高到 **40%**, server2 CPU 使用量最高到 **24%**

#### 記憶體使用量

- **單台情況下**: 記憶體使用量最高到 **834MB**
- **開啟 ALB 情況下**: server1 記憶體使用量最高到 **448MB**, server2 記憶體使用量最高到 **442MB**

### 測試指標說明

- **vusers.created**: 虛擬用戶創建數量
- **vusers.failed**: 虛擬用戶失敗數量
- **vusers.completed**: 虛擬用戶完成數量
- **engine.socketio.emit_rate**: 在測試期間內 Socket.io 訊息發送速率
- **vusers.session_length.mean**: 虛擬用戶完成每個連線的平均時間

### 測試圖表

以下圖表為壓力測試期間的指標：

#### Metric

- **單台情況下**:

  ![無開啟 ALB](./test/1S25.png)

- **開啟 ALB 情況下**:

  ![有開啟 ALB](./test/ALB1S25.png)

#### vuser.session_length

- **單台情況下**:

  ![無開啟 ALB](./test/1S25-SESSION.png)

- **開啟 ALB 情況下**:

  ![有開啟 ALB](./test/ALB1S25-SESSION.png)

## 測試總結

1. **單台的瓶頸點**: 每秒 25 個連線，測試到第三次時 EC2 掛掉需要重啟。
2. **使用 ALB 的優勢**: 能觀察到 CPU 和記憶體使用率與單台有明顯的差距。
3. **Sticky Session 的影響**: 可能會導致流量分配不夠平均，從兩台 server 的 CPU 使用率可以觀察到。