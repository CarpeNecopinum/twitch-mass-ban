const _fsp_ = require('fs-promise');
const _rp_ = require('request-promise');
const _globals_ = require('./globals');

function updateModdedChannels() {
  let moddedChannels = [];

  let modurl = `https://twitchstuff.3v.fi/modlookup/api/user/${_globals_.globals.user}`;

  return _rp_(modurl)
  .then((data) => {
    try {
      data = JSON.parse(data);
    } catch (error) {
      error = null;
    }
    for (let i = 0; i < data.channels.length; i++) {
      moddedChannels[i] = data.channels[i].name;
    }
  })
  .then(() => {
    let optionsUID = {
      uri: `https://api.twitch.tv/kraken/users?login=${moddedChannels}`, // ?
      headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Client-ID': _globals_.globals.twitch_client_id
      }
    };
    return _rp_(optionsUID);
  })
  .then((data) => {
    data = JSON.parse(data);
    for (let i = 0; i < data.users.length; i++) {
      userIDs[i] = data.users[i]._id;
    }

    return Promise.all([
      _fsp_.writeFile(_globals_.globals.modListFile, userIDs),
      _fsp_.writeFile(_globals_.globals.modListUsernames, moddedChannels)
    ]);
  });
}

function modFileDateCheck() {
  let modListPromise = _fsp_.stat(_globals_.globals.modListFile)
  .catch(() => _fsp_.appendFile(_globals_.globals.modListFile, ''))
  .then((stats) => {
		const currentTimeMS = Date.now();
		const fileModDate = Date.parse(stats.mtime);
		if (currentTimeMS != fileModDate) {
		  return getModdedChannels();
		  console.log('\nMod List has been updated.');
		} else {
		  console.log('\nMod List is up to date.');
		}
  });

  let usernamesPromise = _fsp_.stat(_globals_.globals.modListUsernames)
  .catch(() => _fsp_.appendFile(_globals_.globals.modListUsernames, ''))
  .then((stats) => {
		const currentTimeMS = Date.now();
		const fileModDate = Date.parse(stats.mtime);
		if (currentTimeMS != fileModDate) {
		  return getModdedChannels();
		}
  });

  return Promise.all([modListPromise, usernamesPromise]);
}

module.exports = modFileDateCheck;
