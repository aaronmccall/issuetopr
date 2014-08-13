var colors = require('colors');
var Columnizer = require('columnizer');
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
    issue: {
        description: [
            'Run `issuetopr <issue#>: Creates a pull request from a github issue.'
        ],
        required: ['repo', 'base', 'head', 'user']
    },
    init: {
        description: [
            'Run `issuetopr init`: Creates a local .issuetoprrc file for the current project.',
            'The required data for the file are repo and base.',
            'They may be specified via the command line or auto-detected.'
        ],
        optional: ['repo', 'base']
    },
    repo: {
        description: [
            'The remote repository to read issues from and create pull requests in'
        ],
        autodetected: true
    },
    base: {
        description: [
            'The branch that will be the merge target for pull requests.'
        ],
        autodetected: true
    },
    head: {
        description: [
            'The branch that will be merged into base. I.e., the feature branch.'
        ],
        autodetected: true
    },
    user: {
        description: [
            'The user token for access to github\'s API',
            'It is best to put the token in $HOME/.issuetoprrc:',
            'user=<my_github_access_token>'
        ]
    },
    '(auto)': {
        description: [
            'If not specified via command-line or config file,',
            'issuetopr will attempt to auto-detect the correct value.'
        ]
    }
};

exports.help = function (argv) {
    var  config = {
        commands: ['issue', 'init'],
        params: ['repo', 'base', 'head', 'user'],
        legend: ['(auto)']
    };

    console.log('\n%s help:\n'.bold, 'issuetopr'.cyan);

    Object.keys(config).forEach(function (type) {
        var formatted = new Columnizer();
        var typeTitle = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

        formatted.row(typeTitle.replace(/s$/, '').underline, 'Description'.underline);

        config[type].forEach(function (item) {
            var help = helpText[item];
            if (!help) return;
            help.description.forEach(function (line, idx) {
                if (type === 'params') item = '--' + item;
                if (help.autodetected) {
                    item += ' (auto)';
                }
                formatted.row((idx===0 ? item : ''), line);
            });
            if (type === 'commands'){
                if (help.required) formatted.row('', 'Required params: [' + help.required.join(', ') + ']\n');
                if (help.optional) formatted.row('', 'Optional params: [' + help.optional.join(', ') + ']\n');
            }
        });

        formatted.print(null, true);

        console.log('\n');
    });
    console.log('Created by Aaron McCall from %s', yetify.logo());
};