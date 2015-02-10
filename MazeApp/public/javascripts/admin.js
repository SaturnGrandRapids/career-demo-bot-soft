require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
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

require(['jsx!components/admin'], function(Admin){
    var admin = new Admin();
    admin.init();
});
