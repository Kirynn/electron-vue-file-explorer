<template>
    <div class="controls">
        <nav>
            <ul>
                <li class="ui-control" @click="backwards()" v-bind:class="{unClickable: !canGoBackwards}"><i class="fa fa-arrow-left"></i></li>
                <li class="ui-control" @click="forwards()" type="text" v-bind:class="{unClickable: !canGoForwards}"><i class="fa fa-arrow-right"></i></li>
                <li id="current-path">
                    <div class="search-bar" @click="switchMode()" v-clickAway="clickedOff">
                        <div v-show="!typing">{{currentPath}}</div>
                        <input id="inputPath" v-show="typing" v-model="tryPath" @keyup.enter="submit()" v-bind:placeholder="path"></input>
                    </div>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script>


    const nodePath = require('path')

    import clickAway from '../directives/clickAway'

    import {mapState} from 'vuex'

    export default {
        name: 'controls',
        data() {

            return {
                canGoForwards: false,
                canGoBackwards: false,
                typing: false,
                tryPath: ''
            }
        },
        methods: {

            backwards() {

                if (this.canGoBackwards) this.$store.dispatch('moveBack')
                else this.$electron.shell.beep()
            },

            forwards() {

                if (this.canGoForwards) this.$store.dispatch('moveForward')
                else this.$electron.shell.beep()
            },

            submit() {

                if (this.tryPath.length === 1) {
                    
                    this.tryPath = this.tryPath.toUpperCase()
                    this.tryPath += ':\\'
                }
                else if (this.tryPath[this.tryPath.length] != '\\') {
                    
                    this.tryPath += '\\'
                }

                this.$store.commit('SET_TRY', this.tryPath)
                this.tryPath = this.path
            },

            clickedOff() {

                this.typing = false
            },

            switchMode() {
                
                this.typing = true
                document.getElementById('inputPath').focus()
            }
        },
        computed: {

            ...mapState({

                path: state => state.filePath.currentPath,
                root: state => state.filePath.root,
                backwardPath: state => state.filePath.backwardPath,
                forwardPath: state => state.filePath.forwardPath,
                try: state => state.filePath.try,
            }),

            currentPath() {

                if (this.root === this.path) this.$store.commit('SET', this.root)

                if (this.forwardPath.length <= 0) this.canGoForwards = false
                else this.canGoForwards = true

                if (this.backwardPath.length <= 0) this.canGoBackwards = false
                else this.canGoBackwards = true

                return nodePath.normalize(this.path)
            },
        },
    }
</script>

<style lang="scss">

    .controls {

        width: 100%;
        height: 3em;
        font-size: 20px;
        display: block;
        padding: 1em;
        position: absolute;
        background: white;
        z-index: 10000;

        nav {

            width: 100%;
            height: 100%;

            ul {

                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;

                li {

                    padding-right: 8px;
                }

                .ui-control {
                    
                    transition: all 0.3s ease;

                    &:hover {

                        color: skyblue;
                    }
                }

                #current-path {

                    flex-grow: 1;

                    .search-bar {

                        width: 100%;

                        div {

                            border: transparent 1px solid;

                            &:hover {

                                border: lightblue 1px solid;
                            }
                        }

                        input {

                            height: 100%;
                            font-size: inherit;
                            border: transparent 1px solid;

                            &:hover {

                                border: lightblue 1px solid;
                            }

                            &:focus {

                                border: lightblue 1px solid;
                                outline: none;
                            }
                        }

                        & > input, div {

                            width: 100%;
                        }
                    }
                }
            }
        }
    }

    .controls + * {

        margin-top: 5.5em;
    }

    .unClickable {

        .fa {
            
            color: grey;
        }
    }

</style>


