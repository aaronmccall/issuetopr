var colors = require('colors');
var Columnizer = require('columnizer');
var printf = require('util').format;
var yetify = require('yetify');

exports.clone = function (obj) {
    var result = {};
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
    }
    return result;
};

exports.execHandler = function (fn, next) {
    return function (err, stdout, stderr) {
        if (err) return next(err + '\n' + stderr.toString());
        var result = stdout.toString();
        fn(result, next);
    };
};

exports.extractRepoPath = function (repo) {
    if (repo.indexOf('/') > -1) {
        repo = repo.split('/').slice(-2).join('/');
    } else {
        return '';
    }

    if (repo && repo.indexOf('.git') > -1) {
        repo = repo.replace('.git', '').trim();
    }
    return repo.match(/^[\w\-\.]+\/[\w\-\.]+$/) ? repo : '';
};

var helpText = {
    'issue#': {
        description: [
            printf('Creates a pull request from a github issue.')
        ],
        required: ['repo', 'base', 'head', 'user'],
        optional: ['message']
    },
    init: {
        description: [
            printf('Creates a local .issuetoprrc file for the current project.'),
            'The required data for the file are repo and base.',
            'They may be specified via the command line or auto-detected.'
        ],
        optional: ['repo', 'base']
    },
    base: {
        description: ['Merge target branch for pull requests.'],
        autodetected: true
    },
    head: {
        description: ['The branch to be merged into base.'],
        autodetected: true
    },
    message: {
        description: ['Message to add to the body of the pull request.']
    },
    repo: {
        description: ['The github repository for the project.'],
        autodetected: true
    },
    user: {
        description: [
            'The user token for access to github\'s API',
            'It is best to put the token in $HOME/.issuetoprrc:',
            'user=<my_github_access_token>'
        ]
    },
    '--help': {
        description: ['Displays this help message.']
    },
    debug: {
        description: ['Outputs debugging information to the console.']
    },
    verbose: {
        description: ['Requires --debug.', 'Outputs extended debugging information']
    }
};
helpText[printf('%s Auto-Detected', '*'.yellow)] = {
    description: [
        'If not specified via command-line or config file,',
        'issuetopr will attempt to auto-detect the correct value.'
    ]
};
exports.help = function (argvConfig) {
    var  config = {
        commands: ['issue#', 'init', '--help'],
        params: ['base', 'head', 'message', 'repo', 'user', 'debug', 'verbose'],
        legend: [printf('%s Auto-Detected', '*'.yellow)]
    };

    console.log('\nThe basics: %s\n', 'issuetopr <command: init | issue# | --help> [ params ]'.green);

    Object.keys(config).forEach(function (type) {
        var formatted = new Columnizer();
        var typeTitle = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

        var rowArgs = [typeTitle.replace(/s$/, '').underline];
        if (type === 'params') {
            rowArgs.splice(1, 0, 'Alias'.underline);
        }
        rowArgs.push('Description'.underline);
        formatted.row.apply(formatted, rowArgs);

        config[type].forEach(function (itemName) {
            var help = helpText[itemName];
            if (!help) return;
            help.description.forEach(function (line, idx) {
                var item = idx===0 ? itemName : '';
                var rowArgs = [item, line];
                if (item) {
                    if (type === 'params') {
                        rowArgs.splice(0, 1, printf('--%s%s', item, help.autodetected ? '*'.yellow : ''));
                        rowArgs.splice(1, 0, (argvConfig.alias[itemName] ? '-' + argvConfig.alias[itemName] : ''));
                    }
                } else {
                    if (type === 'params') {
                        rowArgs.splice(1, 0, '');
                    }
                }
                
                formatted.row.apply(formatted, rowArgs);
            });
            if (type === 'commands'){
                if (help.required) formatted.row('', 'Required params: [' + help.required.map(function (param) {
                    var conf = helpText[param];
                    if (conf && conf.autodetected) return printf('%s%s', param, '*'.yellow);
                    return param;
                }).join(', ') + ']');
                if (help.optional) formatted.row('', 'Optional params: [' + help.optional.join(', ') + ']');
            }
        });
        formatted.print(null, true);

        console.log('');
    });
    console.log('Created by Aaron McCall from %s', yetify.logo());
};