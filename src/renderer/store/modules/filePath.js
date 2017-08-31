const state = {

    currentPath: 'D:\\',
    backwardPath: [],
    forwardPath: [],
    try: '',
    root: 'D:\\'
}

const mutations = {

    RELOAD(state) {

        state.currentPath = state.currentPath + '\\'
    },

    UPDATE_PATH(state, newPath) {

        state.backwardPath.push(state.currentPath)
        state.currentPath = newPath
    },

    MOVE_BACK(state) {

        state.forwardPath.push(state.currentPath)
        state.currentPath = state.backwardPath.pop()
    },

    MOVE_FORWARD(state) {

        state.backwardPath.push(state.currentPath)
        state.currentPath = state.forwardPath.pop()
    },

    SET(state, path) {

        state.currentPath = ''
        state.root = ''
        state.forwardPath = []
        state.backwardPath = []


        state.currentPath = path
        state.root = path
    },

    SET_TRY(state, tryPath) {

        state.try = tryPath
    }
}

const actions = {

    updatePath({commit}, newPath) {
        return new Promise((resolve, reject) => {
            commit('UPDATE_PATH', newPath)            
            resolve(state.currentPath)
        })
    },

    moveBack({commit}) {

        commit('MOVE_BACK')
    },

    moveForward({commit}) {

        commit('MOVE_FORWARD')
    },

    sendTo({commit}, newPath) {

        return new Promise((resolve, reject) => {
            commit('SET', newPath)
            resolve()
            reject()
        })
    },

    reload({commit}) {

        commit('RELOAD')
    }
}

export default {
    state,
    mutations,
    actions
}