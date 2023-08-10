/**
 * 判断开发者模式是否打开
 */
(function(){

    // 发送一个 devtoolschange事件
    const emitEvent = (isOpen, orientation) => {
        globalThis.dispatchEvent(new globalThis.CustomEvent('devtoolschange', {
            detail: {
                isOpen,
                orientation,
            },
        }));
    };

    /**
     * 注入方法
     */
    function DevtoolDetector() {

        let fnList = [];
        let devtools = {isOpen: false, orientation: undefined};

        this.register = function(name, order, fn) {
            fnList.push({name: name, order: order, fn: fn()})
        }

        this.run = function (){
            let result = {isOpen: false, orientation: undefined}
            for (var i = 0; i < fnList.length; i++) {
                let fnItem = fnList[i];
                let value = fnItem.fn();
                if (value.isOpen) {
                    result = value;
                    break;
                }
            }
            if (devtools.isOpen != result.isOpen || devtools.orientation !== result.orientation) {
                emitEvent(result.isOpen, result.orientation);
                devtools = result;
            }
            return result;
        }

        let __interval = undefined;
        this.open = function () {
            __interval = setInterval(detector.run, 500);
        }

        this.close = function () {
            clearInterval(this.__interval);
            __interval = undefined;
        }
    }

    let detector = new DevtoolDetector();

    /**
     * 控制台窗口在当前页面窗口
     */
    detector.register('comparePage', 1, () => {
        const threshold = 170;
        const devtools = {
            isOpen: false, // 是否打开
            orientation: undefined, // 打开方式，vertical=左右，horizontal=上下，single=单独窗口
        }; 

        return () => {
            const widthThreshold = globalThis.outerWidth - globalThis.innerWidth > threshold;
            const heightThreshold = globalThis.outerHeight - globalThis.innerHeight > threshold;
            const orientation = widthThreshold ? 'vertical' : 'horizontal';

            if (
                !(heightThreshold && widthThreshold)
                && ((globalThis.Firebug && globalThis.Firebug.chrome && globalThis.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)
            ) {
                return {isOpen: true, orientation: orientation}
            } 
            return {isOpen: false, orientation: undefined}
        }
    });

    /**
     * 控制台在独立窗口事，通过console api 检查
     */
    detector.register('single', 2, () => {

        let maxPrintTime = 0;

        // 声明一个大的二维数组
        const tableData = function() {
            for (var e = function() {
                for (var e = {}, t = 0; t < 500; t++)
                    e["".concat(t)] = "".concat(t);
                return e
            }(), t = [], n = 0; n < 50; n++)
                t.push(e);
            return t
        }();

        //检查函数执行时间
        const timer = (func) => {
            var now = new Date()
            func();
            return new Date().getTime() - now.getTime();
        }

        return () => {
            let t = timer(() => console.table(tableData));
            let n = timer(() => console.log(tableData));
            console.clear();
            maxPrintTime = Math.max(maxPrintTime, n);
            if (0 === t || 0 === maxPrintTime) {
                return {isOpen: false, orientation: undefined};
            }
            if (t > 10 * maxPrintTime) {
                return {isOpen: true, orientation: 'single'}
            }
            return {isOpen: false, orientation: undefined}
        }
    });

    detector.open();
    globalThis.devtoolDetector = detector;

})()
