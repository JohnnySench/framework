let activeEffect = null; //

function watchEffect(fn) { // Функция которая обращается к переменной внутри нашего состояния
    activeEffect = fn;
    fn();
    activeEffect = null;
}

class Dependency{
    constructor() {
        this.subscribers = new Set()  // Все подписчики которые зависимы от переменной
    }

    depend() { // Функция добавляет активный Effect
        if (activeEffect) {
            this.subscribers.add(activeEffect)
        }
    }

    notify() { // Функция будет вызываться когда мы будем изменять переменную внутри состояния
        this.subscribers.forEach(fn => fn()) // Перезапускает все зависимости от реактивной переменной
    }
}

function reactive(obj) { // Делаем из обьекта реактивный обьект
    Object.keys(obj).forEach(key => {
        const dep = new Dependency()
        let value = obj[key];
        Object.defineProperty(obj, key, {
            get() {
                dep.depend()
                return value
            },
            set(newValue) {
                if (newValue !== value) {
                    value = newValue;
                    dep.notify()
                }
            }
        })
    })
    return obj;
}