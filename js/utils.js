function createEl(domName, classArr, styleObj) {
    var dom = document.createElement(domName)
    classArr.forEach(el => {
        dom.classList.add(el)
    });
    for (const key in styleObj) {
        dom.style[key] = styleObj[key]
    }
    return dom
}
// 时间格式化
function formatTime(time) {
    return time > 9 ? time : '0' + time
}
// 排名
function compare(name) {
    return function (a, b) {
        return b[name] - a[name]
    }
}
// 设置缓存
function setLocal(key, value) {
    if (typeof value === "object") {
        value = JSON.stringify(value)
    }
    return localStorage.setItem(key, value)
}
// 获取缓存
function getLocal(key) {
    var result = localStorage.getItem(key)
    if(result == null){return result}
    if ((result.slice(0,1) === '[') || (result.slice(0,1) === '{')) {
        result = JSON.parse(localStorage.getItem(key))
    }
    return result
}