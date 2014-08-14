# issuetopr

## tl;dr

Get github personal access token from https://github.com/settings/applications, then:

```bash
# install
npm i issuetopr -g

# if global npm bin isn't in your path, then symlink into your path
ln -s /usr/local/share/npm/bin/issuetopr <dir_in_your_path>/issuetopr

# add personal access token to global config
echo "user=<personal_access_token>" >> $HOME/.issuetoprrc

# if not already in your current project's root directory
cd /your/current/project

# initialize per-project config
issuetopr init

# make a pull request from the current branch linked to issue#
issuetopr <issue#>
```

## What does it do?

issuetopr allows a github user to create a pull request from the current branch that is explicitly linked to an issue.

It does this without fundamentally altering the behaviour of the original issue.

It creates a new pull request as follows:

  - title: PR: `<issue.title>`
  - body: Pull request for issue #`<issue.number>` -- `<issue.title>`

By embedding #`<issue.number>` in the body, the pull request has an explicit link to the issue, and the issue will automatically list the pull request in its references list.

## Doesn't the github API already offer this functionality?

Yes, it does. BUT it does so by changing the issue INTO the pull request, thus making it disappear from the issues list.

If that is not an issue for you, by all means, please use it.

## Getting started

Install it by running `npm i issuetopr -g`

If you don't have npm's bin directory in your path, please add it or symlink issuetopr like so:
`ln -s /usr/local/share/npm/bin/issuetopr <dir_in_your_path>/issuetopr`

In order access the github API on your behalf, you must provide an access token.

You can generate the token at https://github.com/settings/applications by clicking the 'Generate new token' button in the 'Personal access tokens' section.

It is recommended that you store the token in your global config file by creating `$HOME/.issuetoprrc` with the following config:
`user=<my_new_github_token>`

Once you have done that, you should be able to simply run `issuetopr <issue#>` to create a pull request from an existing issue.

*See performance caveats below for reasons you may want to do a bit of configuring beyond the above.*

## Configuration

issuetopr is largely capable of self-configuring at run time, but at a performance cost.

In order to ensure best performance

- add a `base=<my_global_default_merge_branch>` setting to your global config
- run `issuetopr init` in your projects' root dirs to create per-project configs

You can configure issuetopr globally, per project, and at run time.

### global config

Create .issuetoprrc in your $HOME directory as mentioned above.

### in a project

This is most useful for setting the repo path and/or base branch defaults.

Create `<my_project_dir>/.issuetoprrc` by running `issuetopr init`:

For example, for issuetopr itself:
```
    repo=aaronmccall/issuetopr
    base=master
```


### at run time

`issuetopr <issue#> --repo=<account>/<repo> --base=<merge_to> --head=<merge_from>`
