const state = {

    modalMsg: '',
    showModal: false,
    currentEventStream: {locked: true, user: null}
}

const mutations = {

    SET_MODAL_MSG(state, msg) {

        state.modalMsg = msg
    },

    TOGGLE_MODAL(state) {

        state.showModal = !state.showModal
        
        if (!state.showModal) state.modalMsg = ''
    },

    SET_EVENT_STREAM(state, locked, user) {

        state.currentEventStream.locked = locked
        state.currentEventStream.user = user
    }
}

const actions = {

    setModalMsg({commit}, msg) {

        commit('SET_MODAL_MSG', msg)
    },

    toggleModal({commit}, name = undefined) {

        // if (name) console.log(name)
        commit('TOGGLE_MODAL')
    },

    setEventStream({commit}, data) {

        commit('SET_EVENT_STREAM', data.locked, data.user)
        
        console.log(`Event stream ${data.locked ? 'is locked' : 'is unlocked'}  ${data.user ? 'by ' + data.user : ''}`)
    }
}

export default {
    state,
    mutations,
    actions
}