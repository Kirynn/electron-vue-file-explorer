<template>
    <nav class="titlebar windowControl">
        <div>{{windowName}}</div>
        <ul>
            <li @click="minimize()"><span></span></li>
            <li @click="maximize()"><span></span></li>
            <li @click="close()"><span class='titlebarClose'></span></li>
        </ul>
    </nav>
</template>

<script>

    const electron = require('electron')

    let win = electron.remote.getCurrentWindow()

    export default {
        name: 'titlebar',
        data() {
            return {
                windowName: win.getTitle()
            }
        },
        methods: {

            minimize() {

                win.minimize()
            },

            maximize() {

                if (!win.isMaximized()) win.maximize()
                else win.unmaximize()
            },

            close() {

                win.close()
            }
        }
    }
</script>

<style lang="scss">

    .titlebar {

        width: 100%;
        height: 29px;
        position: fixed;
        z-index: 10000;
        display: flex;
        flex-direction: row;
        cursor: default;
        background: #DFDFDF;
        align-items: center;

        div {

            margin-left: 5px;
            flex-grow: 1;
        }

        ul {
            
            display: flex;
            flex-direction: row;

            li {

                padding: 0px 16px;
                -webkit-app-region: no-drag;

                span {

                    width: 12px;
                    height: 12px;
                    border: 2px solid #7E7E7E;
                    border-radius: 12px;
                    background: #7E7E7E;
                    display: block;
                    transition: all 0.4s ease-in-out;
                }

                .titlebarClose {

                    background: #EB6466;
                    border-color: #EB6466;
                }

                &:hover {

                    span {

                        box-shadow: 0px 0px 10px #636363;
                    }

                    .titlebarClose {

                        box-shadow: 0px 0px 10px #CF5657;
                    }
                }
            }
        }

        & + * {

            margin-top: 29px;
        }
    }
    
</style>
