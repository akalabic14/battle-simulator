module.exports = async (req, res) => {
	try {
		let result;
		switch (req.params.method) {
		case 'start':
			await global.gameplay.game.start();
			res.json('ok');
			break;
		case 'add-army':
			await global.gameplay.game.addArmy(req.body);
			res.json('ok');
			break;
		case 'get-logs':
			res.json(global.gameplay.game.logs);
			break;
		case 'list-games':
			result = await global.gameplay.game.toString();
			res.json(result);
			break;
		default:
			throw new Error(`Method ${req.params.method} not supported.`);
		}
	} catch (e) {
		global.logger.error(e);
		res.json({ error: e.toString() });
	}
};
