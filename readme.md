## 检查浏览器是否打开了开发者模式
```javascript
window.addEventListener('devtoolschange', event => {
    if (event.detail.isOpen) {
        alert('控制台打开了')
    } else {
        alert('控制台关闭了')
    }
});
```
