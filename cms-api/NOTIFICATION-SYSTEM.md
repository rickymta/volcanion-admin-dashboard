# 📢 Notification System Documentation

## Tổng quan

Hệ thống thông báo 2 chiều sử dụng SignalR để gửi thông báo real-time từ server tới client và nhận phản hồi từ client khi người dùng đã đọc thông báo.

## 🏗️ Kiến trúc

### Database Schema
```sql
CREATE TABLE Notifications (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Message VARCHAR(1000) NOT NULL,
    Type VARCHAR(50) DEFAULT 'Info',
    ActionUrl VARCHAR(500) NULL,
    ActionText VARCHAR(100) NULL,
    UserId INT NOT NULL,
    SenderId INT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    ReadAt DATETIME NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    MetaData VARCHAR(2000) NULL,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (SenderId) REFERENCES Users(Id) ON DELETE SET NULL,
    INDEX idx_user_read (UserId, IsRead),
    INDEX idx_created_at (CreatedAt)
);
```

### Components

1. **Models**: `Notification` entity
2. **DTOs**: Request/Response objects
3. **Services**: `NotificationService` - Business logic
4. **Hub**: `NotificationHub` - SignalR real-time communication
5. **Controller**: `NotificationController` - REST API endpoints

## 🔌 SignalR Hub

### Connection
```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/notificationHub`, {
        accessTokenFactory: () => authToken
    })
    .withAutomaticReconnect()
    .build();
```

### Hub Methods (Client → Server)

#### `MarkNotificationAsRead(notificationId)`
Đánh dấu thông báo đã đọc
```javascript
await connection.invoke("MarkNotificationAsRead", notificationId);
```

#### `GetNotifications(page, pageSize)`
Lấy danh sách thông báo
```javascript
await connection.invoke("GetNotifications", 1, 20);
```

#### `JoinGroup(groupName)` / `LeaveGroup(groupName)`
Tham gia/Rời khỏi group để nhận thông báo theo nhóm
```javascript
await connection.invoke("JoinGroup", "AdminGroup");
await connection.invoke("LeaveGroup", "AdminGroup");
```

### Hub Events (Server → Client)

#### `ReceiveNotification`
Nhận thông báo mới
```javascript
connection.on("ReceiveNotification", function (notification) {
    console.log("New notification:", notification);
});
```

#### `UnreadCountUpdated`
Cập nhật số lượng thông báo chưa đọc
```javascript
connection.on("UnreadCountUpdated", function (count) {
    document.getElementById('badge').textContent = count;
});
```

#### `NotificationMarkedAsRead`
Confirmation khi thông báo được đánh dấu đã đọc
```javascript
connection.on("NotificationMarkedAsRead", function (notificationId) {
    updateUIAsRead(notificationId);
});
```

#### `NotificationsReceived`
Nhận danh sách thông báo
```javascript
connection.on("NotificationsReceived", function (notifications) {
    displayNotifications(notifications);
});
```

## 🌐 REST API Endpoints

### GET `/api/notification`
Lấy danh sách thông báo của user hiện tại

**Query Parameters:**
- `page`: Trang (default: 1)
- `pageSize`: Số lượng mỗi trang (default: 20)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Welcome!",
    "message": "Welcome to our system",
    "type": "Info",
    "actionUrl": "https://example.com",
    "actionText": "View Details",
    "userId": 1,
    "senderId": 2,
    "senderName": "Admin User",
    "isRead": false,
    "readAt": null,
    "createdAt": "2024-01-01T10:00:00Z",
    "metaData": "{\"key\":\"value\"}"
  }
]
```

### POST `/api/notification/send-to-user`
Gửi thông báo tới user cụ thể

**Request Body:**
```json
{
  "userId": 1,
  "title": "New Message",
  "message": "You have a new message",
  "type": "Info",
  "actionUrl": "https://example.com/message/123",
  "actionText": "Read Message",
  "metaData": "{\"messageId\": 123}"
}
```

### POST `/api/notification/send-bulk`
Gửi thông báo tới nhiều users

**Request Body:**
```json
{
  "userIds": [1, 2, 3],
  "title": "System Maintenance",
  "message": "System will be down for maintenance",
  "type": "Warning"
}
```

### PUT `/api/notification/{id}/mark-as-read`
Đánh dấu thông báo đã đọc

### PUT `/api/notification/mark-all-as-read`
Đánh dấu tất cả thông báo đã đọc

### GET `/api/notification/unread-count`
Lấy số lượng thông báo chưa đọc

### GET `/api/notification/stats`
Lấy thống kê thông báo

**Response:**
```json
{
  "totalNotifications": 50,
  "unreadCount": 5,
  "readCount": 45,
  "lastNotificationTime": "2024-01-01T15:30:00Z"
}
```

### DELETE `/api/notification/{id}`
Xóa thông báo

## 🎯 Notification Types

- `Info`: Thông tin chung
- `Success`: Thành công
- `Warning`: Cảnh báo
- `Error`: Lỗi
- `Message`: Tin nhắn
- `System`: Hệ thống

## 💡 Usage Examples

### 1. Frontend Integration

```html
<!-- Include SignalR -->
<script src="https://unpkg.com/@microsoft/signalr@latest/dist/browser/signalr.js"></script>

<script>
// Kết nối
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/notificationHub", {
        accessTokenFactory: () => getAuthToken()
    })
    .build();

// Lắng nghe thông báo mới
connection.on("ReceiveNotification", (notification) => {
    showNotification(notification);
    updateUnreadBadge();
});

// Đánh dấu đã đọc khi click
function handleNotificationClick(notificationId) {
    connection.invoke("MarkNotificationAsRead", notificationId);
    // Hoặc gọi API REST
    fetch(`/api/notification/${notificationId}/mark-as-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// Kết nối
connection.start();
</script>
```

### 2. Backend - Gửi thông báo

```csharp
[ApiController]
public class OrderController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    {
        // Tạo order...
        
        // Gửi thông báo
        await _notificationService.SendNotificationToUserAsync(new SendNotificationToUserRequest
        {
            UserId = request.UserId,
            Title = "Order Created",
            Message = $"Your order #{order.Id} has been created successfully",
            Type = "Success",
            ActionUrl = $"/orders/{order.Id}",
            ActionText = "View Order"
        });
        
        return Ok(order);
    }
}
```

### 3. Real-time Updates

```csharp
// Trong service
public async Task ProcessPayment(int orderId)
{
    // Xử lý thanh toán...
    
    if (paymentSuccessful)
    {
        await _notificationService.SendNotificationToUserAsync(new SendNotificationToUserRequest
        {
            UserId = order.UserId,
            Title = "Payment Successful",
            Message = "Your payment has been processed successfully",
            Type = "Success"
        });
    }
    else
    {
        await _notificationService.SendNotificationToUserAsync(new SendNotificationToUserRequest
        {
            UserId = order.UserId,
            Title = "Payment Failed",
            Message = "There was an issue processing your payment",
            Type = "Error",
            ActionUrl = "/payment/retry",
            ActionText = "Retry Payment"
        });
    }
}
```

## 🔒 Security

1. **JWT Authentication**: Tất cả SignalR connections cần JWT token
2. **User Isolation**: Users chỉ có thể xem/đánh dấu thông báo của mình
3. **Authorization**: Kiểm tra quyền trước khi gửi thông báo
4. **Rate Limiting**: Có thể thêm rate limiting cho việc gửi thông báo

## 🚀 Setup Instructions

1. **Chạy migration:**
```powershell
.\add-notification-migration.ps1
```

2. **Test với frontend:**
- Mở `frontend-example/notification-test.html`
- Đăng nhập và lấy JWT token
- Test gửi/nhận thông báo

3. **Integration vào ứng dụng:**
```javascript
// Trong ứng dụng React/Vue/Angular
import { HubConnectionBuilder } from '@microsoft/signalr';

const setupNotifications = (authToken) => {
    const connection = new HubConnectionBuilder()
        .withUrl('/notificationHub', {
            accessTokenFactory: () => authToken
        })
        .build();
    
    connection.on('ReceiveNotification', handleNewNotification);
    connection.start();
    
    return connection;
};
```

## 🎯 Best Practices

1. **Graceful Degradation**: Fallback to polling nếu SignalR fail
2. **Offline Support**: Cache notifications locally
3. **Performance**: Pagination cho danh sách thông báo
4. **User Experience**: Browser notifications, sound alerts
5. **Analytics**: Track notification open rates, click-through rates

## 📊 Monitoring

- Connection count
- Message delivery rates
- Failed deliveries
- Average response times
- User engagement metrics
