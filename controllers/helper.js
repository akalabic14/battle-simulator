module.exports = {
	/**
     * @function promisfyMongoose
     * @returns {Promise}
     * @description Executes forwarded mongodb query and resolves result or rejects error
     */
	promisfyMongoose: (command) => new Promise((resolve, reject) => {
		try {
			command.exec((err, obj) => {
				if (err) {
					reject(err);
				} else {
					resolve(obj);
				}
			});
		} catch (err) {
			global.logger.error(err);
			reject(err);
		}
	}),
};
