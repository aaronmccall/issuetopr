var request = require('request');
var async = require('async');


module.exports = function (args) {
    if (!args.user || args.user.length !== 40 || !args.user.match(/^[a-z0-9]+$/)) {
        console.warn('You must specify a user token in order for issuetopr to run.');
        console.warn('You can generate a token at https://github.com/settings/applications');
        console.warn('You can permanently store the token in ~/.issuetoprrc like so:');
        console.warn('    user=<my_personal_access_token>');
        process.exit(1);
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
                    process.exit(1);
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
                    body: 'Pull request for issue #' + args.issue + ' -- ' + issue.title,
                    head: args.head,
                    base: args.base
                }
            };

            if (args.debug) console.log('pullRequestConfig:', pullRequestConfig);

            request(pullRequestConfig, function (err, res, PR) {
                if (err || res.statusCode !== 201) {
                    console.error('API error:', err || PR);
                    process.exit(1);
                }
                console.log('pull request %d ("%s") created.\nURL: %s', PR.number, PR.title, PR.url);
                next(null);
            });
        }
    ], function (err, result) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        if (args.debug) console.log('finished');
        process.exit(0);
    });
};
