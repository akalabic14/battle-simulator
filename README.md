# battle-simulator

## Routes

### /play/add-army
Add the army to the system. This API accepts:

* name: Name of the army
* units: Number of units the army has (80 - 100)
* strategy: Based on the attacking strategy the army chose whom to attack

NOTE: Armies can be added before the start of the game. Armies cannot be to the game already in progress.

### /play/game-status
List existing armies, their status, units, health.

### /play/start
The API call to start the game. The game can start only if at least 10 armies have joined.

### /play/restart
The API call to reset the game in progress

### /play/get-logs
This API call is used to retrieve a full battle log for a specific game.

