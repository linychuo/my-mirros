const request = require('request');
const bundles = require('./bundles.json');
const fs = require('fs');
const parser = require('./parser');

const test = (name, _url) => {
	request(_url, (error, response, body) => {
		let { newVersion, downloadURL } = parser[bundles[name].parser](body);
		if (newVersion !== bundles[name].version) {
			console.log(`newVersion: ${newVersion}`);
			if (!fs.existsSync(`./${name}-dist`)) {
				fs.mkdirSync(`./${name}-dist`);
			}
			let ws = fs.createWriteStream(`./${name}-dist/${name}-${newVersion}.exe`);
			ws.on('close', () => {
				console.log(`[${name}] download finished...........`);
				bundles[name].version = newVersion;
				console.log(bundles);
				fs.writeFileSync('bundles.json', JSON.stringify(bundles, null, 2));
			});
			console.log(`downloadURL: ${downloadURL}`);
			request(downloadURL).pipe(ws);
		}
	});
};

const cmdArgv = process.argv;
if (cmdArgv.length < 3) {
	console.log('.......All tasks will running async!!........');
	Object.entries(bundles).forEach(([k, v]) => {
		process.nextTick(() => {
			test(k, v.url);
		});
	});
}
else {
	let bundleName = cmdArgv[2];
	if (bundles[bundleName]) {
		test(bundleName, bundles[bundleName].url);
	}
}
