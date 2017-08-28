<template>
    <div id="app">
        <titlebar></titlebar>
        <controls></controls>
        <router-view></router-view>
    </div>
</template>

<script>

import Titlebar from './components/titlebar'
import Controls from './components/controls'

export default {

    name: 'App',
    components: {Titlebar, Controls},
}
</script>

<style lang='scss'>

    * {
  
          margin: 0px;
          padding: 0px;
    }

    *, *::before, *::after {

        box-sizing: border-box;
    }

    html, body {

        height: 100%;
        font-family: 'Open Sans', sans-serif;
        overflow: hidden;
    }

    ul {

        list-style: none;
    }

    .windowControl {

        -webkit-app-region: drag;
        user-select: none;
    }

    #app {

        height: 100%;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        
        // & > * {

        //     flex: 1 1 auto;
        // }
    }

    .router-link:link {

        color: black;
        text-decoration: none;
        cursor: default;
    }

</style>
