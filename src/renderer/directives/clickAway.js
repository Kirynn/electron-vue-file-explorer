import Vue from 'vue'

const clickAway = {
        
    bind: function(el, bind, vNode) {
        
        if (typeof(bind.value) !== 'function') {
            
            let compName = vNode.context.name
            let warn = `[Vue-click-outside:] provided expression '${bind.expression}' is not a function, but has to be`
            
            if (compName) warn += `Found in component '${compName}'`
            console.warn(warn)
        }

        const handler = (e) => {

            if (!el.contains(e.target) && el !== e.target) bind.value(e)
        }

        el.__vueClickOutside__ = handler
        document.addEventListener('click', handler)
    },

    unbind: function(el, bind) {

        document.removeEventListener('click', el.__vueClickOutside__)
        el.__vueClickOutside__ = null;
    }
}

export default clickAway

Vue.directive('clickAway', clickAway)