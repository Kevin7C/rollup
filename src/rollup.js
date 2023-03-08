import { basename } from 'path';
import { writeFile } from 'sander';
import Bundle from './Bundle';

let SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';

export function rollup(options) {
	if (!options || !options.entry) {
		throw new Error('You must supply options.entry to rollup');
	}

	const bundle = new Bundle(options);
	// 入口函数，调用build 开始进行打包
	return bundle.build().then(() => {
		return {
			generate: options => bundle.generate(options),
			write: options => {
				if (!options || !options.dest) {
					throw new Error('You must supply options.dest to bundle.write');
				}

				const dest = options.dest;
				// 打包器开始对分析后的AST等 进行打包压缩
				let { code, map } = bundle.generate(options);

				let promises = [];

				if (options.sourceMap) {
					let url;

					if (options.sourceMap === 'inline') {
						url = map.toUrl();
					} else {
						url = `${basename(dest)}.map`;
						promises.push(writeFile(dest + '.map', map.toString()));
					}

					code += `\n//# ${SOURCEMAPPING_URL}=${url}`;
				}

				promises.push(writeFile(dest, code));
				return Promise.all(promises);
			}
		};
	});
}
