var request = require('request');
var async = require('async');
var printf = require('util').format;

var default_cb = process.exit.bind(process);
var branding_message = '*Created with issuetopr.*';

module.exports = function (args, callback) {
    if (!args.user || args.user.length !== 40 || !args.user.match(/^[a-z0-9]+$/)) {
        console.warn('You must specify a user token in order for issuetopr to run.');
        console.warn('You can generate a token at https://github.com/settings/applications');
        console.warn('You can permanently store the token in ~/.issuetoprrc like so:');
        console.warn('    user=<my_personal_access_token>');
        return (callback||default_cb)(1);
    }
    if (!args.issue) {
        console.warn('You must specify an issue number.');
        return (callback||default_cb)(1);
    }
    async.waterfall([
        function (next) {
            var issueQuery = {
                method: 'GET',
                url: 'https://api.github.com/repos/' + args.repo + '/issues/' + args.issue,
                auth: {
                    user: args.user,
                    pass: 'x-oauth-basic'
                },
                headers: {
                    'User-Agent': 'request'
                },
                json: true
            };
            if (args.debug && args.verbose) console.log('issueQuery:', issueQuery);

            request(issueQuery, function (err, res, issue) {
                if (err) {
                    console.error(err);
                    return (callback||default_cb)(1);
                }
                if (args.debug && args.verbose) console.log('issue:', issue);
                next(null, issue);
            });
        },
        function (issue, next) {

            var pullRequestConfig = {
                method: 'POST',
                url: 'https://api.github.com/repos/' + args.repo + '/pulls',
                auth: {
                    user: args.user,
                    pass: 'x-oauth-basic'
                },
                headers: {
                    'User-Agent': 'request'
                },
                json: {
                    title: 'PR: ' + issue.title,
                    body: printf('Pull request for issue #%s -- %s\n\n%s', args.issue, issue.title, branding_message),
                    head: args.head,
                    base: args.base
                }
            };

            if (args.debug) console.log('pullRequestConfig:', pullRequestConfig);

            request(pullRequestConfig, function (err, res, PR) {
                if (err || res.statusCode !== 201) {
                    console.error('API error:', err || PR);
                    return (callback||default_cb)(1);
                }
                console.log('pull request %d ("%s") created.\nURL: %s', PR.number, PR.title, PR.url);
                next(null);
            });
        }
    ], function (err, result) {
        if (err) {
            console.error(err);
            return (callback||default_cb)(1);
        }
        if (args.debug) console.log('finished');
        return (callback||default_cb)(0);
    });
};
