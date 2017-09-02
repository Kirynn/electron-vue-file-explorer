<template>
    <transition name="mA">
        <section class="modal" @click='close()' v-if="message">
            <div class="modal-mask">
                <div class="modal-container" v-clickAway="close">
                    <div class="modal-text-container">{{message}}</div>
                    <div class="modal-btn-container">
                        <div class="ui-btn modal-btn" @click="modalRespond(false)" @keyup.esc="modalRespond(false)">No</div>
                        <div class="ui-btn modal-btn" @click="modalRespond(true)" @keyup.enter="modalRespond(true)" >Yes</div>
                    </div>
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
                currentEventStream: state => state.windowData.currentEventStream
            })
        },
        directives: {clickAway},
        mounted() {

            this.$store.dispatch({
                type: 'setEventStream',
                locked: true,
                user: 'modal'
            })
        }
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
                display: flex;
                flex-direction: column;
                justify-content: center;

                box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
                background: white;
                transition: all 0.3s ease;

                .modal-text-container {

                    height: 100%;
                    width: 100%;
                }

                .modal-btn-container {

                    width: 100%;
                    display: flex;
                    flex-direction: row;

                    .modal-btn {


                    }
                }
            }
        }
    }

    .mA-enter-active, .mA-leave-active{

        transition: all 0.4s ease;
    }

    .mA-enter, .mA-leave-to {

        .modal-container {

            transform: translateY(50px);

        }
        opacity: 0;
    }

</style>
