<template>
    <transition name="mA">
        <section class="modal" @click='close()' v-if="message">
            <div class="modal-mask">
                <div class="modal-container" v-clickAway="close">
                    {{message}}
                    <div @click="modalRespond(false)" @keyup.esc="modalRespond(false)">No</div>
                    <div @click="modalRespond(true)" @keyup.enter="modalRespond(true)" >Yes</div>
                </div>
            </div>
        </section>
    </transition>
</template>

<script>

    import clickAway from '../../directives/clickAway'
    import {mapState} from 'vuex'

    export default {
        props: ['message'],
        methods: {

            close() {

                if(this.toggleModal) this.$store.dispatch('toggleModal', 'modal')
            },

            modalRespond(response) {

                this.$events.emit('modal-response', response)
            }
        },
        computed: {

            ...mapState({
                toggleModal: state => state.windowData.showModal,
            })
        },
        directives: {clickAway}
    }
</script>

<style lang="scss">

    .modal {

        width: 100%;
        height: 100%;
        position: absolute;

        .modal-mask {

            width: 100%;
            height: 100%;
            display: flex;
            align-content: center;
            justify-content: center;

            background: rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
            

            .modal-container {

                width: 70%;
                height: 30%;
                align-self: center;

                box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
                background: white;
                transition: all 0.3s ease;
            }
        }
    }

    .mA-enter-active, .mA-leave-active{

        transition: all 0.4s ease;
    }

    .mA-enter, .mA-leave-to {

        transform: scale(1.1);
        opacity: 0;
    }

</style>
