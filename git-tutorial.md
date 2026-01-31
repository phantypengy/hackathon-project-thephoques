# How to use git !!!

Making this because I couldn't find a proper guide online that didn't already assume
you know the basics which was VERY annoying - so I decided to make this.

**This guide assumes you're using VSCode.**

## Installing git + how to use

To download git, go to their website:

https://git-scm.com/

Click on install and follow the instructions!

To actually _use_ git, first open a terminal window and type:

```
git --version
```

This will tell you if git installed correctly - if nothing shows up then you've done something wrong.

The best way to use git (in my experience) is to use it in VSCode's integrated terminal - you can access
it by pressing the keybind Ctrl + `

## Cloning + initialising

Downloading a repo from GitHub is known as **cloning**, it'll download the repo directly to the system. Yay!

To do this, open your system terminal and type:

```
git clone <link to repo>
```

If you have no folder open in VSCode, you can also clone a repo by pressing the "Clone a repository" button in the explorer
on the left!

After you've cloned the repo, once you open VSCode it should detect the repo and prompt you to add it - at least it did for me.
If it doesn't, manually add the folder by clicking File > Open Folder in the top left. VSCode should automatically detect
that this folder is a git repo. (The name of the folder will be the name of the repo you cloned)

Now that you've set this all up, you should be ready to go!

To make sure git is working, open the VSCode terminal with Ctrl + ` and type these commands:

```
cd <name of repo folder>

git status
```

The status command should:

- Tell you which branch you're on (should be main)
- If you're up to date with main
- If there any untracked files (basically files you've updated / added that aren't on the GitHub)

It **won't**:

- Tell you if a change was made to repo by another person

To check if others made pushes (changes), run 'git fetch' and then run status.

If the status command does nothing, that means it doesn't detect a repo, and you need to run this command:

```
git init
```

You shouldn't need to run this command though, git clone should do all the work.

## Pulling / merging

Now. Let's say I made a change to the html file and put it on GitHub. In order to get those changes onto _your_ computer, you'd use
the 'pull' command.

```
git fetch
# checks the repo for changes

git status
# this will tell you how many commits behind you are from main

git pull --rebase
# this will download any changes to the files

# you can skip doing status and fetch if you just run pull,
# fetch and status will just show you if you're behind main
```

You should **ALWAYS** pull before making changes to avoid any conflicts.

## Making changes to the repo

Once you've done all the steps above, you can start working on the files as normal.

When you've made changes and you want to save your work to the repo, first run:

```
git status
```

It will tell you which files are changed under the 'untracked files' header.

To tell git which files you want to commit, run:

```
git add .
```

The . will add all untracked files to the commit. If you want to only add specific files, replace the . with
the file names.

Once you've run 'git add', you will need to add a commit message. This is done like so:

```
git commit -m "Example message"
```

Make sure your messages are short but descriptive.
If you used 'git add .', the message will be attached to every file. If you want separate message for each file,
you'll have to add the files individually.

For example, let's say I edited script.js and style.css, but want different messages for the commit. I'd have to
commit like this:

```
git add script.js
git commit -m "Fixed script error on line 43"

git add style.css
git commit -m "Fixed div alignment + colour"
```

Once you've committed every file you want to add to the repo, you can use the 'push' command to upload your changes
to GitHub.

```
git push
```

That should upload your changes to the GitHub repo, and let the others download your changes.

## Branches

Branches are a very useful tool for when working in a team. Creating a branch allows you to make and push changes to the repo
without affecting the main release branch. This is _especially_ useful when working in a team, as it allows for multiple people
to work on something without conflicting.

To create a branch, you simply use these commands:

```
git branch <branch-name>
# this will create a branch - be sure to replace <branch-name> with whatever you want to name your branch

git switch <branch-name>
# this will switch to the branch - so your pushes won't be put on main, they'll be put on the branch
```

When you create a branch for the first time and try to push a change, it'll show you an error talking about
no upstream - to fix this you can just use this command:

```
git config --global push.autoSetupRemote true
```

This will make sure all future branches don't return the same error.

Once you've used 'git checkout' to swap to the branch you want to work in, you can use add, commit and push as normal.

On the GitHub website, you can view different branches via a drop-down menu right under the name of the repo - by default
it'll be set to main. Choosing a different branch lets you view the modified code and - more importantly - create a pull request.

### Pull Requests

A pull request is a request to merge the branch and main. Once a pull request is made, it'll appear in the pull requests tab
on GitHub.

On this page, GitHub will check if merging is possible, show all changes / deletions made, and allow all collaborators to comment,
request changes and approve changes. Once decided, you can either merge the pull request - which combines it with main - or close the
request, which keeps any changes in the branch and leaves main untouched.

This, as I'm sure you can tell, is _EXTREMELY_ useful in teams.

### Useful branch commands

```
git branch -a
# lists all branches

git checkout -b <branch-name>
# creates a new branch and switches to it immediately

git branch -m <new-name>
# changes the name of an existing branch
```

## Using commits as 'save points'

You can always revert back to a previous commit.

To do so, you'll have to find the hash of the commit:

```
git log
```

This will show previous commits, along with:

- The hash (will appear as a long string of letters and numbers after the word commit)
- The author
- The date
- The message

Once you have the commit hash copied, you can exit the log with Ctrl + Z.

```
git revert <commit-hash> -m "commit message"
```

This will create a new commit that undoes the changes you made.

**NOTE:** You do _not_ need to push in order to use commits as save points - just add and commit and it'll work.

For example:
When doing multiple tasks and you've finished one, before moving on add and commit your changes but _don't push them_.
Now, if needed, you can revert to that commit.

## Order of operations

This is just a step-by-step of what you should do when logging on for the first time each day - before making any changes.

In VSCode, open the terminal with Ctrl + `

Follow this order of operations:

```

cd hackathon-project-thephoques

# only necessary if you're not already in the directory

git pull --rebase

# will download any changes other team members pushed to the repo

# if there are no changes, this will do nothing

# once you've made all your changes and you want to commit:

git status

# shows you all untracked files

git add .

# will add all untracked files to be committed

git commit -m "Enter message here"

# commits + adds a message - remember, if you did 'git add .' your commit message

# will be the same for all files

git push

# uploads changes to GitHub

# and that's it!

```

Sorry if this guide is confusing, I'm not the _greatest_ at things like this........
