<template>
    <div class="flx-table-row system-entry"
    ref="entryData.name"
    data-selected=false
    v-clickAway="deselect"
    @keyup.esc="esc()">
        <object class="flx-table-row-item" v-bind:data="entryData.icon" data-type="icon"></object>
        <div class="flx-table-row-item" data-type="name">
            <input v-if="rename"
            v-bind:placeholder="entryData.name"
            v-model="renameText"
            @keyup.enter="submit()"></input>                        
            <span v-if="!rename">{{entryData.name}}</span>
        </div>
        <div class="flx-table-row-item">{{entryData.type}}</div>
        <div class="flx-table-row-item" data-type="size">{{entryData.size}}</div>
        <div class="flx-table-row-item"></div>
    </div>
</template>

<script>

    import clickAway from '../../directives/clickAway'
    import {mapState} from 'vuex'

    export default {
        name: "file",
        props: ['entryData'],
        directives: {clickAway},
        data() {
            return {
                rename: false,
                renameText: '',
                elName: this.entryData.name.toString()
            }
        },
        computed: {

            ...mapState({

                currentEventStream: state => state.windowData.currentEventStream
            }),

            el() {

                return document.querySelectorAll(`[data-path="${this.entryData.name}"]`)[0]
            }
        },
        mounted() {

            this.$events.on(this.elName, () => {

                window.addEventListener('click', (event) => {

                    event.stopPropagation
                    event.preventDefault
                })
                this.rename = true

                console.log(this.el)
            })
        },
        methods: {

            deselect() {

                if (this.rename) {
                    
                    this.rename = false
                    console.log('click away')
                }

            },

            submit() {

                this.$events.emit('rename', this.renameText)
                this.rename = false
            },

            esc(){

                if (this.rename) {

                    this.$events.emit('rename', null)
                    this.rename = false
                }
            }
        },
        watch: {

            rename: function() {

                if (this.rename) {
                    
                    this.$store.dispatch({
                        type: 'setEventStream',
                        locked: true,
                        user: 'file-component'
                    })
                }

                else {

                    this.$store.dispatch({
                        type: 'setEventStream',
                        locked: false,
                        user: undefined
                    })
                }
            }
        }
    }
</script>

<style lang="scss" scoped>

    .flx-table-row-item{
        
        &[data-type="name"] > * {

            width: 90%;
            display: block;
        }
    }
</style>


