# Knight Hacks Bot

The official Knight Hacks Discord Bot

## Commands

```bash
/chat - chat with T.K!
/countdown - sends a countdown to the next Knight Hacks event!
/links - sends our most important links!
/sign_in - signs into a Knight Hacks event
/check_points - check your Knight Hacks points
/leaderboard - shows the Knight Hacks points leaderboard
/flex - publicly flexes your Knight Hacks points
/flowchart - sends a flowchart based on a given major!
/joke - sends a random programming joke!
/duck - sends random duck image!
/dog - sends a random image of a dog!
/cat - sends a random image of a cat!
/capybara - sends a random image of a capybara!
/beep - responds with "Boop!"
/goat - responds with a random image of a goat!
/bubblewrap - gives you some bubble wrap!
/help - sends a list of available commands
```

### Adding a Command

The commands are stored in the `commands` directory. To add a new command, create a new file in the `commands` directory.

Your new command must have a data export, which is a SlashCommandBuilder object from the discord.js library. The command should also have an execute function that takes in the interaction object and sends a response back to the user.

After adding a new command, please update `commands/index.ts` and README.md accordingly. View commands/beep.ts for an example.

## Hooks

```bash
- calendar - sends a daily message to the reminders channel informing users of events today, tomorrow, and in a week
- daily - sends a daily message containing the Leetcode daily challenge and starts a thread
- animals - sends daily images of several animals throughout the day
```

### Hooks Schedule
```bash
- daily - sent daily at 11:00AM
- calendar - sent daily at 12:00PM, only when there is an event that occurs today, tomorrow, or in a week.
- animals
    - cat - sent daily at 1:00PM
    - capybara - sent daily at 1:30PM
    - duck - sent daily at 2:00PM
    - goat - sent daily at 2:30PM
```

### Adding a Hook

Some logic needs to depend on something other than a command interaction and should be stored in a hook instead. Hooks are stored in the `hooks` directory and are lodaded in by the main function.

Your hook needs to be a function called execute, and should create its own webhook client in its own scope. After adding a new hook, please update `hooks/index.ts` and README.md accordingly. View hooks/calendar.ts for an example.
