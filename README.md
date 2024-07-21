# T.K the Tech Knight

The official Knight Hacks Discord Bot, inspired by our new mascot, T.K!

## Commands

```bash
/beep - responds with "Boop!"
/duck - sends random duck image!
```

### Adding a Command
The commands are stored in the `commands` directory. To add a new command, create a new file in the `commands` directory.

Your new command must have a data export, which is a SlashCommandBuilder object from the discord.js library. The command should also have an execute function that takes in the interaction object and sends a response back to the user.

After adding a new command, please update commands/index.ts accordingly.

