// WARNING 需要 连公司 vpn 再进行测试
const path = require('path');
const util = require('yyl-util');
const extFs = require('yyl-fs');
const fs = require('fs');
const frp = require('yyl-file-replacer');
const seed = require('../../index');
const tUtil = require('yyl-seed-test-util');
const http = require('http');

jest.setTimeout(30000);

// + vars
const FRAG_PATH = path.join(__dirname, '../../../__frag/all');
const TEST_CASE_PATH = path.join(__dirname, '../case');
// - vars

tUtil.frag.init(FRAG_PATH);

const fn = {
  clearDest(config, copyFont) {
    return new Promise((next) => {
      extFs.removeFiles(config.alias.destRoot).then(() => {
        if (copyFont) {
          extFs.copyFiles(config.resource).then(() => {
            next();
          });
        } else {
          next();
        }
      });
    });
  }
};

const linkCheck = function (config, next) {
  const htmlArr = extFs.readFilesSync(config.alias.destRoot, /\.html$/);
  const cssArr = extFs.readFilesSync(config.alias.destRoot, /\.css$/);
  const jsArr = extFs.readFilesSync(config.alias.destRoot, /\.js$/);

  const destRoot = config.alias.destRoot;
  const LOCAL_SOURCE_REG = new RegExp(`^(${config.commit.hostname})`);
  const REMOTE_SOURCE_REG = /^(http[s]?:|\/\/\w)/;
  const ABSOLUTE_SOURCE_REG = /^\/(\w)/;
  const RELATIVE_SOURCE_REG = /^\./;
  const NO_PROTOCOL = /^\/\/(\w)/;

  const localSource = [];
  const remoteSource = [];
  const notMatchLocalSource = [];

  const sourcePickup = function (iPath, dir) {
    if (iPath.match(LOCAL_SOURCE_REG)) {
      localSource.push(
        tUtil.hideUrlTail(
          util.path.join(destRoot, iPath.replace(LOCAL_SOURCE_REG, ''))
        )
      );
    } else if (iPath.match(ABSOLUTE_SOURCE_REG)) {
      localSource.push(
        tUtil.hideUrlTail(
          util.path.join(destRoot, iPath.replace(LOCAL_SOURCE_REG, '$1'))
        )
      );
    } else if (iPath.match(REMOTE_SOURCE_REG)) {
      remoteSource.push(iPath);
    } else if (iPath.match(RELATIVE_SOURCE_REG)) {
      localSource.push(
        tUtil.hideUrlTail(
          util.path.join(dir, iPath)
        )
      );
    }
  };

  htmlArr.forEach((iPath) => {
    frp.htmlPathMatch(fs.readFileSync(iPath).toString(), (mPath) => {
      sourcePickup(mPath, path.dirname(iPath));
      return mPath;
    });
  });

  cssArr.forEach((iPath) => {
    frp.cssPathMatch(fs.readFileSync(iPath).toString(), (mPath) => {
      sourcePickup(mPath, path.dirname(iPath));
      return mPath;
    });
  });

  jsArr.forEach((iPath) => {
    frp.jsPathMatch(fs.readFileSync(iPath).toString(), (mPath) => {
      sourcePickup(mPath, path.dirname(iPath));
      return mPath;
    });
  });

  localSource.forEach((iPath) => {
    if (!fs.existsSync(iPath)) {
      notMatchLocalSource.push(iPath);
    }
  });

  let padding = remoteSource.length +  notMatchLocalSource.length;
  const paddingCheck = function () {
    if (!padding) {
      next();
    }
  };

  remoteSource.forEach((iPath) => {
    var rPath = iPath;
    if (rPath.match(NO_PROTOCOL)) {
      rPath = rPath.replace(NO_PROTOCOL, 'http://$1');
    }


    http.get(rPath, (res) => {
      expect([rPath, res.statusCode]).toEqual([rPath, 200]);
      padding--;
      paddingCheck();
    });
  });

  notMatchLocalSource.forEach((iPath) => {
    var rPath = util.path.join(
      config.commit.hostname,
      util.path.relative(config.alias.destRoot, iPath)
    );
    if (rPath.match(NO_PROTOCOL)) {
      rPath = rPath.replace(NO_PROTOCOL, 'http://$1');
    }

    http.get(rPath, (res) => {
      expect([iPath, rPath, res.statusCode]).toEqual([iPath, rPath, 200]);
      padding--;
      paddingCheck();
    });
  });
  paddingCheck();
};

// 检查 assets async components
async function checkAsyncComponent (config) {
  const asyncPath = path.join(config.alias.jsDest, 'async_component');
  if (fs.existsSync(asyncPath) && fs.readdirSync(asyncPath).length) {
    const assetsPath = path.join(config.alias.revDest, 'rev-manifest.json');
    expect(fs.existsSync(assetsPath)).toEqual(true);
    const assetJson = JSON.parse(fs.readFileSync(assetsPath).toString());

    Object.keys(assetJson).forEach((key) => {
      const aPath = path.join(config.alias.revRoot, key);
      const bPath = path.join(config.alias.revRoot, assetJson[key]);
      const aPathExists = fs.existsSync(aPath);
      const bPathExists = fs.existsSync(bPath);

      expect([aPath, aPathExists]).toEqual([aPath, true]);
      expect([bPath, bPathExists]).toEqual([bPath, true]);
    });
  }
}

// 检查 blank css file
async function checkCssFiles (config) {
  const htmlArr = await extFs.readFilePaths(config.alias.htmlDest, /\.html$/, true);
  htmlArr.forEach((htmlPath) => {
    const filename = path.relative(config.alias.htmlDest, htmlPath);
    const cssFile = filename.replace(/\.html$/, '.css');
    const cssPath = path.join(config.alias.cssDest, cssFile);

    expect(fs.existsSync(cssPath)).toEqual(true);
  });
}

const testCases = fs.readdirSync(TEST_CASE_PATH);
testCases.filter((filename) => {
  if (/^\./.test(filename)) {
    return false;
  } else {
    return true;
  }
}).forEach((filename) => {
  const PJ_PATH = path.join(TEST_CASE_PATH, filename);
  test(`seed.all() case:${filename}`, async () => {
    const TARGET_PATH = path.join(FRAG_PATH, filename);
    await tUtil.frag.build();
    await extFs.copyFiles(PJ_PATH, TARGET_PATH);

    const configPath = path.join(TARGET_PATH, 'config.js');
    const config = tUtil.parseConfig(configPath);

    const opzer = seed.optimize(config, path.dirname(configPath));

    await fn.clearDest(config);

    // all
    await util.makeAwait((next) => {
      const timePadding = {
        start: 0,
        msg: 0,
        finished: 0
      };

      opzer.all({ silent: true })
        .on('start', () => {
          timePadding.start++;
        })
        .on('msg', () => {
          timePadding.msg++;
        })
        .on('finished', () => {
          timePadding.finished++;
          // times check
          expect(timePadding.start).toEqual(1);
          expect(timePadding.msg).not.toEqual(0);
          expect(timePadding.finished).toEqual(1);

          linkCheck(config, () => {
            next();
          });
        });
    });

    await checkAsyncComponent(config);
    await checkCssFiles(config);

    await fn.clearDest(config);

    // all --remote
    await util.makeAwait((next) => {
      opzer.all({ remote: true, silent: true })
        .on('finished', () => {
          linkCheck(config, () => {
            next();
          });
        });
    });

    await checkAsyncComponent(config);
    await checkCssFiles(config);

    await fn.clearDest(config);

    // all --isCommit
    await util.makeAwait((next) => {
      opzer.all({ isCommit: true, silent: true })
        .on('finished', () => {
          linkCheck(config, () => {
            next();
          });
        });
    });

    await checkAsyncComponent(config);
    await checkCssFiles(config);

    await tUtil.frag.destroy();
  });
});