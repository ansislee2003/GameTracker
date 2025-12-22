/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const {onDocumentCreated, Change, FirestoreEvent } = require('firebase-functions/v2/firestore');
const {FieldValue} = require('firebase-admin/firestore');
const express = require('express');
const app = express();
const axios = require('axios');
const apicache = require('apicache');
const cache = apicache.middleware;
const { Buffer } = require('buffer');
const {ref, getDownloadURL} = require("@firebase/storage");
const qs = require('qs');
const {fileTypeFromBuffer} = require("file-type");
const { v4: uuidv4 } = require('uuid');

// formData parser
const Busboy = require('busboy');

// firestore
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "mygamelist-3c79d.firebasestorage.app",
});
const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

const { defineString } = require('firebase-functions/params');
const IGDB_CLIENT_ID = defineString('IGDB_CLIENT_ID');
const IGDB_CLIENT_SECRET = defineString('IGDB_CLIENT_SECRET');
let IGDB_AUTHORIZATION = null;
let IGDB_HEADERS = null;

const buildIGDBHeaders = async (isUpdate = false) => {
    try {
        if (isUpdate || !IGDB_HEADERS) {
            const response = await db.collection('oauth').doc('igdb').get();
            IGDB_AUTHORIZATION = response.data()?.IGDB_AUTHORIZATION ?? null;

            IGDB_HEADERS = {
                'Client-ID': IGDB_CLIENT_ID.value(),
                'Authorization': IGDB_AUTHORIZATION,
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            };

            console.log('Updating Headers', IGDB_HEADERS)
            return IGDB_HEADERS;
        }
        else { return IGDB_HEADERS; }
    }
    catch (error) {
        console.log("Failed to build headers", error);
    }
}

const api = axios.create({
    timeout: 5000,
    retryLimit: 3,
    retryDelayMax: 5000
});

api.interceptors.response.use(null, async error => {
    const reqConfig = error.config;
    reqConfig.retryCount = (reqConfig.retryCount ?? 0);
    reqConfig.retryDelay = (reqConfig.retryDelay ?? 1000);

    // check if error is status 401, if yes, refresh OAuth tokens
    if (error.response?.status === 401) {
        try {
            const OAuthRefreshResponse = await axios.post(
                'https://id.twitch.tv/oauth2/token',
                qs.stringify({
                    client_id: IGDB_CLIENT_ID.value(),
                    client_secret: IGDB_CLIENT_SECRET.value(),
                    grant_type: 'client_credentials'
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )
            console.log('Updating OAuth')

            // update IGDB_AUTHORIZATION in firestore
            const newOAuth = OAuthRefreshResponse.data.token_type + ' ' + OAuthRefreshResponse.data.access_token;
            await db.collection('oauth').doc('igdb').set({
                'IGDB_AUTHORIZATION': newOAuth
            })
            await buildIGDBHeaders(true);
        }
        catch (OAuthRefreshError) {
            console.log('Updating OAuth Failed:', OAuthRefreshError);
            return Promise.reject(error);
        }
    }
    console.log('failed POST request:', reqConfig.url)

    if (reqConfig.retryCount < (reqConfig.retryLimit ?? 0)) {
        // exponential delay
        await new Promise(resolve => setTimeout(resolve, reqConfig.retryDelay))

        // retry req if failed
        console.log('retrying failed POST request:', reqConfig.url)
        reqConfig.retryCount++;
        reqConfig.retryDelay = Math.min(reqConfig.retryDelay * 2, reqConfig.retryDelayMax ?? 5000);
        return api(reqConfig);
    }

    // retryLimit exceeded
    return Promise.reject(error);
})

app.use(async (req, res, next) => {
    // check format and extract idToken
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith('Bearer ')
        ? authHeader.split(" ")[1]
        : null;

    if (!idToken) {
        return res.status(401).send('Not authorized: Missing token');
    }

    try {
        const decodedUser = await auth.verifyIdToken(idToken);
        req.user = await auth.getUser(decodedUser.uid);
        next();
    } catch (error) {
        return res.status(401).send('Not authorized: Invalid token');
    }
})

app.get('/hello', async (req, res) => {
    res.send('Hello from Firebase!');
});

// get top 10 trending games
app.post('/getTrendingGames', cache('3 hours'), async (req, res) => {
    console.log("/getTrendingGames: Fetching data from IGDB");

    const igdb_headers = await buildIGDBHeaders();
    const query1 = `
      fields game_id, value, popularity_type;
        where popularity_type = 5;
        sort value desc;
        limit 10;`

    api.post(
        'https://api.igdb.com/v4/popularity_primitives/',
        query1,
        { headers: igdb_headers }
    )
    .then(response  => {
        const gameID = response.data.map(g => g.game_id);
        const query2 = `
          fields name, cover.url, total_rating, total_rating_count;
          where id = (${gameID.join(',')});`

        return api.post(
            'https://api.igdb.com/v4/games/',
            query2,
            { headers: igdb_headers }
        )
    })
    .then(response  => {
        res.send(response.data);
    })
    .catch(error => {
        console.error("/getTrendingGames:", error.message);
        return res.json({error: error.message});
    })
})

// get top 10 rated games of all time
app.post('/getTopGames', cache('3 hours'), async (req, res) => {
    console.log("/getTopGames: Fetching data from IGDB");

    const igdb_headers = await buildIGDBHeaders();
    const query = `
      fields name, cover.url, total_rating, total_rating_count;
      where total_rating_count > 500;
      sort total_rating desc;
      limit 10;`

    api.post(
        'https://api.igdb.com/v4/games/',
        query,
        { headers: igdb_headers }
    )
    .then(response  => {
        return res.json(response.data);
    })
    .catch(error => {
        console.error("/getTopGames:", error.message);
        return res.json({error: error.message});
    })
})

// get top 10 rated new games (released no more than 6 months ago, 1 month = 30 days)
app.post('/getTopNewGames', cache('3 hours'), async (req, res) => {
    console.log("/getTopNewGames: Fetching data from IGDB");

    const igdb_headers = await buildIGDBHeaders();
    const newThreshold = new Date().setHours(0, 0, 0, 0) - (6*30*24*60*60*1000);
    const newThresholdUnix = Math.floor(newThreshold / 1000);
    const query = `
      fields name, cover.url, total_rating, total_rating_count;
      where first_release_date >= ${newThresholdUnix} & total_rating_count > 50;
      sort total_rating desc;
      limit 10;`

    api.post(
        'https://api.igdb.com/v4/games/',
        query,
        { headers: igdb_headers }
    )
    .then(response  => {
        console.log("TOP NEW GAMES", response.data)
        return res.json(response.data);
    })
    .catch(error => {
        console.error("/getTopNewGames:", error.message);
        return res.json({error: error.message});
    })
})

// search games by name
app.post('/getGamesByName', async (req, res) => {
    const { searchTerm, searchOffset } = req.body;
    console.log("/getGamesByName: Fetching data from IGDB");

    const igdb_headers = await buildIGDBHeaders();

    // short queries (1-2 char), only return titles starting with the search term
    // long queries (>2 char), returns any title with search term substring
    const query = searchTerm.length < 3 ? `
      fields name, cover.url, total_rating, total_rating_count;
      where name ~ "${searchTerm}"*;
      sort total_rating_count desc;
      limit 10;
      offset ${searchOffset};` : `   
      fields name, cover.url, total_rating, total_rating_count;
      where name ~ *"${searchTerm}"*;
      sort total_rating_count desc;
      limit 10;
      offset ${searchOffset};`

    api.post(
        'https://api.igdb.com/v4/games/',
        query,
        { headers: igdb_headers }
    )
    .then(response  => {
        return res.json(response.data);
    })
    .catch(error => {
        console.error("/getTopNewGames:", error.message);
        return res.json({error: error.message});
    })
})

// get game info by id
app.post('/getGameById', async (req, res) => {
    const { gameID } = req.body;

    if (!gameID) {
        res.json({error: 'Missing gameID'});
    }

    const igdb_headers = await buildIGDBHeaders();
    const query = `
      fields name, cover.url, first_release_date, genres.name, involved_companies.company.name, involved_companies.developer, platforms.name, storyline, summary, total_rating, total_rating_count, game_type.type;
      where id = ${gameID};`

    api.post(
        'https://api.igdb.com/v4/games/',
        query,
        { headers: igdb_headers }
    )
    .then(response  => {
        // only return developer companies in involved_companies
        let games = response.data[0];
        games.involved_companies = games.involved_companies?.filter(c => c.developer);

        return res.json(games);
    })
    .catch(error => {
        console.error("/getGameById:", error.message);
        return res.json({error: error.message});
    })
})

// new user sign up, creates firebase auth doc, usernames doc, and users doc
app.post('/user/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username) {
        return res.status(401).json({error: 'Missing username'});
    }
    if (!/^(?!.*[._-]{2})[a-z0-9][a-z0-9._-]{1,18}[a-z0-9]$/.test(username)) {
        return res.status(401).json({error: 'Invalid username.'});
    }
    if (!email) {
        return res.status(401).json({error: 'Missing email'});
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(401).json({error: 'Invalid email.'});
    }
    if (!password) {
        return res.status(401).json({error: 'Missing password'});
    }
    if (!confirmPassword) {
        return res.status(401).json({error: 'Missing confirm password'});
    }
    if (confirmPassword !== password) {
        return res.status(401).json({error: 'Passwords do not match.'});
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-_=+\[\]{};:'",.<>/?|~`]{8,}$/.test(password)) {
        return res.status(401).json({error: 'Invalid password.'});
    }

    try {
        console.log('Creating user...');
        // create account in firebase auth
        const newUser = await auth.createUser({
            email: email,
            password: password,
            displayName: username,
            photoURL: 'https://firebasestorage.googleapis.com/v0/b/mygamelist-3c79d.firebasestorage.app/o/avatar%2Fdefault_profile?alt=media',
            disabled: true
        })
        console.log('Created user');
        // set handle by creating doc in usernames/[handle], fail if doc exists
        const usernameRef = db.collection('usernames').doc(username);
        const userRef = db.collection('users').doc(newUser.uid);
        await db.runTransaction(async (transaction) => {
            const handleDoc = await transaction.get(usernameRef);

            // manual rollback if handle taken
            // uid never collides, no need to check if user doc exists
            if (handleDoc.exists) {
                await auth.deleteUser(newUser.uid);
                throw Object.assign(new Error('Username is not available.'), { name: 'UserError' });
            }

            // create doc if handle available
            await transaction.set(usernameRef, {
                uid: newUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // create user doc
            await transaction.set(userRef, {
                status: 'pending'
            })
        })
        console.log('Created user docs');
        // activate auth account
        await auth.updateUser(newUser.uid, {
            disabled: false
        })
            .catch(error => {
                throw Object.assign(new Error('Account created successfully but may take a while before it is activated.'), { name: 'ServerError' });
            })
        await userRef.update({
            status: 'active'
        })
        console.log('Activated account');
        // return auth token
        const accessToken = await auth.createCustomToken(newUser.uid);
        return res.status(200).json({accessToken: accessToken});
    }
    catch (error) {
        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-exists':
                    return res.status(401).json({error: 'Email is already in use. Please enter a different email.'});
                case 'auth/invalid-email':
                    return res.status(401).json({error: 'Invalid email address.'});
                case 'auth/weak-password':
                    return res.status(401).json({error: 'Password is too weak.'});
                default:
                    console.error(error);
                    return res.status(401).json({error: 'Sign up failed. Please try again.'});
            }
        }
        if (error.name === 'UserError') {
            return res.status(401).json({error: error.message});
        }
        else if (error.name === 'ServerError') {
            return res.status(500).json({error: error.message});
        }
        console.error('/user/signup', error)
        return res.status(500).json({error: 'Failed to create account. Please try again later.'});
    }
})

app.post('/user/uploadAvatarByUID', async (req, res) => {
    // if (req.user.isAnonymous || !req.user.emailVerified) {
    if (req.user.isAnonymous) {
        return res.status(401).send({ error: "Custom avatar is only accessible for email verified accounts." });
    }

    const busboy = Busboy({ headers: req.headers });
    const filepath = `avatar/${req.user.uid}-${new Date().toISOString().replace(/:/g, '-')}`;

    let uploadData = null;

    busboy.on('file', (fieldName, file, info) => {
        const { filename, encoding, mimetype } = info;
        const chunks = [];

        file.on('data', chunk => {
            chunks.push(chunk);
        });

        file.on('end', () => {
            uploadData = {
                fileBuffer: Buffer.concat(chunks),
                mimetype: mimetype,
                filename: filepath
            };
        });
    });

    busboy.on('finish', async () => {
        try {
            if (!uploadData || !uploadData.fileBuffer) {
                return res.status(400).send({ error: "No file data received or processed." });
            }

            if (uploadData.fileBuffer.length === 0) {
                return res.status(400).send({ error: "Received an empty file." });
            }

            const detectedFileType = await fileTypeFromBuffer(uploadData.fileBuffer);
            if (detectedFileType?.mime === "image/jpeg" || detectedFileType?.mime === "image/png") {
                if (uploadData.fileBuffer.length > 2 * 1024 * 1024) {
                    return res.status(400).json({ error: "File size larger than 2MB" });
                }

                // upload to fireback storage with uid as filename
                const token = uuidv4();
                const image = bucket.file(filepath);
                await image.save(uploadData.fileBuffer, {
                    contentType: detectedFileType.mime,
                    metadata: {
                        metadata: {
                            firebaseStorageDownloadTokens: token
                        }
                    }
                });

                // update firebase auth with new photoURL
                const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filepath)}?alt=media&token=${token}`;
                await auth.updateUser(req.user.uid, {
                    photoURL: url
                })
                console.log("Check new uploaded url", url)

                // update avatar successful
                res.status(200).send({ url: url });

                // delete old avatar from firebase storage
                let match = req.user.photoURL.match(/\/o\/([^?]+)/) || null;
                const oldPath = match ? decodeURIComponent(match[1]) : null;
                bucket.file(oldPath).delete()
                    .catch(error => {
                        console.log("Failed to delete file at:", oldPath)
                    })
            }
            else {
                return res.status(400).json({ error: "Invalid file type" });
            }
        }
        catch (error) {
            console.error(`/uploadAvatarByUID:`, error);
            return res.status(500).send({ error: "Failed to upload avatar." });
        }
    });

    busboy.end(req.rawBody);
})

app.post('/game/saveGameByID', async (req, res) => {
    const validProgress = new Set(['actively_playing', 'retired', 'completed', 'dropped', 'planned_on_playing'])
    const { gameID, score, progress } = req.body;

    if (!gameID) { return res.status(400).json({ error: 'Missing gameID' }); }
    if (typeof gameID !== 'string') { return res.status(400).json({ error: 'Invalid gameID' }); }
    if (!score) { return res.status(400).json({ error: 'Missing game score' }); }
    if (typeof score !== 'number' && score % 1 === 0 && score > 1 && score <= 10) { return res.status(400).json({ error: 'Invalid game score' }); }
    if (!progress) { return res.status(400).json({ error: 'Missing game progress' }); }
    if (!validProgress.has(progress)) { return res.status(400).json({ error: 'Invalid game progress' }); }

    const gameRef = db.collection('savedGames').doc(req.user.uid).collection('games').doc(gameID);
    try {
        // save to savedGames/{userId}/games/{gameID}
        await gameRef.set({
            score: score,
            progress: progress
        })
    }
    catch (error) {
        console.error('/game/saveGameByID:', error);
        return res.status(500).json({ error: 'Failed to save game' });
    }

    return res.status(200).send();
})

app.get('/game/getSavedGames', async (req, res) => {
    const gameRef = db.collection('savedGames').doc(req.user.uid).collection('games');
    gameRef.get()
        .then((snapshot) => {
            const games = snapshot.docs.map(doc => ({ 'gameID': doc.id, ...doc.data() }));
            return res.json({games});
        })
        .catch((error) => {
            return res.status(500).json({ error: 'Failed to fetch games' });
        })
})

exports.api = functions.https.onRequest(app);

// update total rating number
// exports.onGameAdded = onDocumentCreated('savedGames/{userId}/games/{gameID}', async (event) => {
//     const gameID = event.params.gameID;
//     const game = await db.collection('games').doc(gameID).get();
//     if (!game.exists) {
//         await db.collection('games').doc(gameID).create({
//             total_rating: 0,
//             total_rating_count: 0,
//             saved_count: 1,
//             average_rating: null
//         })
//     }
//     else {
//         await db.collection('games').doc(gameID).update({
//             saved_count: FieldValue.increment(1)
//         })
//     }
//         console.log(`Game ${gameID} added for user ${event.params.userId}`);
// })

