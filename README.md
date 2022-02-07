# notion-opener
Link Opener for https://notion.so/

![GitHub release (latest by date)](https://img.shields.io:/github/v/release/takoba/notion-opener)
![GitHub](https://img.shields.io:/github/license/takoba/notion-opener)


## Running Locally

### 1. Create a new Slack App
- Go to https://api.slack.com/apps
- Click **Create New App**
- Choose **From scratch**
- Enter App name and select a workspace
- Click **Create App**

Once the app is created scroll down in Basic Info and copy Signing Secret.

Next, move to "Features > OAuth & Permissions", and add "chat:write" permission in Bot Token Scope.
Then display "OAuth Tokens for Your Workspace", and copy Bot User OAuth Token.

### 2. Create a new Notion integration
- Go to https://www.notion.so/my-integrations
- Click **New Integration**
- Enter name, select a workspace, and choose Capabilities
- Click **Submit**

Once the integration is created, copy to "Internal Integration Token"

### 3. Setup environment variables
```zsh
# Replace with your bot and app token
export SLACK_SIGNING_SECRET=<your-slack-app-signing-secret> # from the Slack App Basic Info App Token section
export SLACK_BOT_TOKEN=<your-slack-app-bot-token> # from the Slack App OAuth section
export NOTION_TOKEN=<your-notion-token> # from Notion Integration token section
```

### 4. Setup your local project
```sh
# Clone this project onto your machine
git clone https://github.com/takoba/notion-opener.git
# Change into the project
cd notion-opener/
# Install the dependencies
yarn install
```

### 5. Start servers
```sh
yarn build && yarn start
```
### 6. Publish app port by ngrok
exec ngrok the other window, then copy to displayed hostname
```sh
ngrok http 3000
```

### 7. Setup Event Subscriptions
- Go to Slack App setting page
- Move to "Event Subscriptions"
- Toggle "Enable Events" off to on
- Enter `<ngrok-https-host>/slack/events` to "Request URL"
- Click **Save Changes**

### 8. Test
Go to the installed workspace and enter notion url in a DM to your new bot. You can also type **Hello** in a channel where the bot is present


## How to Deploy

### Deploy to heroku.com

Click below "Deploy to Heroku" button, then show a form to create Heroku App.
In advance, do "1. Create a new Slack App" & "2. Create a new Notion Intergration".

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

After that, enter `<heroku-app-host>/slack/events` to`"Event Subscriptions > Request URL", and submit.


## Special Thanks
- This app have inspired by https://github.com/MH4GF/notion-deglacer
- This app's README.md have inspired by https://github.com/slackapi/bolt-js-getting-started-app
- Thanks for your kindness by @Connehito org members!
