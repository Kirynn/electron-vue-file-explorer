<template>
    <div id="app">
        <titlebar></titlebar>
        <view-controller></view-controller>
        <router-view></router-view>
    </div>
</template>

<script>

import Titlebar from './components/titlebar'
import Controls from './components/controls'
import viewController from './components/viewController'

export default {

    name: 'App',
    components: {Titlebar, viewController},
}
</script>

<style lang='scss'>

    @import './assets/flx-table';
    @import './assets/ui';

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
    }

    .router-link:link {

        color: black;
        text-decoration: none;
        cursor: default;
    }

    .no-user-select {

        -webkit-user-select: none;
    }

</style>
