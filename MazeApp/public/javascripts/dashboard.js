require.config({
    shim: {
        'socketio': {
            exports: 'io'
        }
    },
    paths: {
        'text': 'lib/text',
        'jsx': 'lib/jsx',
        'react': 'lib/react-with-addons',
        'JSXTransformer': 'lib/JSXTransformer',
        socketio: '../socket.io/socket.io'
    }
});

require(['jsx!components/dashboard'], function(Dashboard){
    var dashboard = new Dashboard();
    dashboard.init();
});

