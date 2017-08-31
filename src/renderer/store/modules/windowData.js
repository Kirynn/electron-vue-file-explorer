const state = {

    modalMsg: '',
    showModal: false
}

const mutations = {

    SET_MODAL_MSG(state, msg) {

        state.modalMsg = msg
    },

    TOGGLE_MODAL(state) {

        state.showModal = !state.showModal
        
        if (!state.showModal) state.modalMsg = ''
    }
}

const actions = {

    setModalMsg({commit}, msg) {

        commit('SET_MODAL_MSG', msg)
    },

    toggleModal({commit}, name = undefined) {

        // if (name) console.log(name)
        commit('TOGGLE_MODAL')
    }
}

export default {
    state,
    mutations,
    actions
}