
// Функция для создания VNode
function h(tag, props, children) {
    return {
        tag,
        props,
        children,
    }
}

// Монтирует VNode в DOM
function mount(vNode, container) {
    const el = document.createElement(vNode.tag);
    for (const key in vNode.props) {
        el.setAttribute(key, vNode.props[key]) // Устанавливаем пропы для элемента
    }

    if (typeof vNode.children === 'string') { // Если у vNode нет вложенных элементов
        el.textContent = vNode.children;
    } else {
        vNode.children.forEach(child => { // Монтируем всех детей из children элемента el (рекурсия)
            mount(child, el)
        })
    }
    container.appendChild(el);

    vNode.$el = el; // Теперь знаем в каком реальном месте DOM находится vNode
}

// Демонтируем vNode из DOM
function unmount(vNode) {
    const parentNode = vNode.$el.parentNode; // Находим DOM parent у vNode el
    parentNode.removeChild(vNode.$el); // Удаляем из DOM vNode
}

// Берет 2 ноды, и сравнивает их, oldNode - существующий нод, newNode - новый нод. Ищет разницу
function patch(oldNode, newNode) {

    // Когда разные теги у Nodes
    if (oldNode.tag !== newNode.tag) {
        const container = oldNode.$el.parentNode; // Родитель для oldNode, туда теперь пихаем newNode
        mount(newNode, container);
        unmount(oldNode) // Удаляем oldNode
    } else {
        // Когда теги одинаковые но внутри поменялись (props, children)
        newNode.$el = oldNode.$el;

        if (typeof newNode.children === 'string') {
            newNode.$el.textContent = newNode.children;
        } else {
            while (newNode.$el.attributes.length > 0) { // Удаляем все прошлые атрибуты
                newNode.$el.removeAttribute(newNode.$el.attributes[0].name)
            }
            for (const key in newNode.props) {
                newNode.$el.setAttribute(key, newNode.props[key])
            }

            if (typeof oldNode.children === 'string') {
                newNode.$el.textContent = null;
                newNode.children.forEach(child => {
                    mount(child, newNode.$el)
                })
            } else {
                // Узнаем разницу детей у Node
                // Старые изменим на новые, а новые лишние добавим или лишние старые удалим
                const commonLength = Math.min(oldNode.children.length, newNode.children.length);

                //Пройдемся по количеству совпадающих Node
                for (let i = 0; i < commonLength; i++) {
                    patch(oldNode.children[i], newNode.children[i]); // Заменим старые Node на новые Node
                }

                if (oldNode.children.length > newNode.children.length) {
                    // const different = oldNode.children.length - newNode.children.length;
                    //
                    // for (let i = oldNode.children.length; i > different; i--) {
                    //     unmount(oldNode.children[i])
                    // }
                    // Удаляем лишние старые Nodes
                    oldNode.children.slice(newNode.children.length).forEach(child => {
                        unmount(child)
                    })
                } else if (oldNode.children.length < newNode.children.length) {
                    newNode.children.slice(oldNode.children.length).forEach(child => {
                        mount(child)
                    })
                }

            }
        }

    }
}