# 🌐 VPN分流配置 - 让阿里云API直连

## 问题原因

VPN会导致访问阿里云API（`dashscope.aliyuncs.com`）失败，因为：
- 阿里云服务器可能拒绝海外IP访问
- VPN路由延迟过高导致连接超时
- 某些VPN会阻止特定API请求

## 解决方案

### 方案1: Clash/ClashX配置（推荐）

如果使用Clash系列VPN，在配置文件中添加规则：

```yaml
rules:
  # 阿里云相关域名直连
  - DOMAIN-SUFFIX,aliyuncs.com,DIRECT
  - DOMAIN-SUFFIX,dashscope.aliyuncs.com,DIRECT
  - DOMAIN,dashscope.aliyuncs.com,DIRECT
  
  # 其他流量走代理
  - MATCH,Proxy
```

位置：在rules部分的**最前面**添加

### 方案2: V2Ray/V2RayN配置

在路由设置中添加域名直连规则：

```json
{
  "routing": {
    "rules": [
      {
        "type": "field",
        "domain": [
          "aliyuncs.com",
          "dashscope.aliyuncs.com"
        ],
        "outboundTag": "direct"
      }
    ]
  }
}
```

### 方案3: 系统PAC模式

如果VPN支持PAC模式，添加：

```javascript
// PAC文件
function FindProxyForURL(url, host) {
    // 阿里云域名直连
    if (shExpMatch(host, "*.aliyuncs.com")) {
        return "DIRECT";
    }
    if (shExpMatch(host, "dashscope.aliyuncs.com")) {
        return "DIRECT";
    }
    // 其他走代理
    return "PROXY your-proxy-server:port";
}
```

### 方案4: 临时禁用VPN（最简单）

测试时可以临时关闭VPN：
1. 关闭VPN
2. 上传简历测试
3. 重新开启VPN

## ✅ 验证配置

配置后，测试阿里云API是否可达：

```powershell
# PowerShell测试
$response = Invoke-WebRequest -Uri "https://dashscope.aliyuncs.com" -Method GET -TimeoutSec 5
Write-Host "连接成功: $($response.StatusCode)"
```

或使用curl：
```bash
curl -I https://dashscope.aliyuncs.com
```

预期：应该能连接成功（即使返回404或其他错误，只要有响应即可）

## 🔍 常见VPN软件配置位置

| VPN软件 | 配置位置 |
|---------|----------|
| Clash | 配置 → 编辑配置 → rules部分 |
| ClashX | 配置 → 打开配置文件夹 → config.yaml |
| V2RayN | 设置 → 路由设置 → 域名规则 |
| Shadowsocks | 编辑PAC文件 |
| Surge | 配置 → 规则 → DOMAIN-SUFFIX |

## 📝 注意事项

1. 修改配置后需要**重启VPN**或**重载配置**
2. 确保规则在配置文件的**前面**（优先级高）
3. 如果还不行，尝试临时关闭VPN测试

## 🎯 推荐方案

**最快的方法**：
1. 临时关闭VPN
2. 上传简历测试LLM功能
3. 确认工作后再配置VPN分流

这样可以先确保功能正常，再慢慢调整VPN配置。


