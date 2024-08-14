// const { MongoClient, Binary, ClientEncryption } = require('mongodb');
// const uri = "mongodb+srv://medi:medi@medi.vw04cn9.mongodb.net/"; // Replace with your MongoDB connection string

// const keyVaultNamespace = 'encryption.__keyVault';
// const localMasterKey = Buffer.alloc(96); // This should be securely generated and stored

// let client;
// let encryption;

// async function connectClient() {
//   if (!client) {
//     client = new MongoClient(uri);
//     await client.connect();
//   }
//   return client;
// }

// async function setupEncryption() {
//   client = await connectClient();
//   encryption = new ClientEncryption(client, {
//     keyVaultNamespace,
//     kmsProviders: {
//       local: {
//         key: localMasterKey,
//       },
//     },
//   });

//   let dataKeyId = await encryption.createDataKey('local');
//   console.log("Data Key Id:", dataKeyId.toString('base64'));
//   return dataKeyId;
// }

// async function encryptField(field) {
//   await connectClient();
//   return encryption.encrypt(field, {
//     algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
//     keyId: await setupEncryption(),
//   });
// }

// async function decryptField(encryptedField) {
//   await connectClient();
//   return encryption.decrypt(new Binary(Buffer.from(encryptedField, 'base64')));
// }

// module.exports = { encryptField, decryptField, connectClient };


const { MongoClient, Binary, ClientEncryption } = require('mongodb');
const uri = "mongodb+srv://medi:medi@medi.vw04cn9.mongodb.net/"; // Replace with your MongoDB connection string

const keyVaultNamespace = 'encryption.__keyVault';
const localMasterKey = Buffer.alloc(96); // This should be securely generated and stored

let client;
let encryption;
let dataKeyId;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

async function setupEncryption() {
  client = await connectClient();
  encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders: {
      local: {
        key: localMasterKey,
      },
    },
  });

  if (!dataKeyId) { // Only create a data key if it hasn't been created yet
    dataKeyId = await encryption.createDataKey('local');
    console.log("Data Key Id:", dataKeyId.toString('base64'));
  }
  return dataKeyId;
}

async function initializeEncryption() {
  await connectClient();
  await setupEncryption();
}

async function encryptField(field) {
  if (!encryption || !dataKeyId) { // Ensure encryption setup is complete
    throw new Error("Encryption setup is not complete.");
  }
  return encryption.encrypt(field, {
    algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
    keyId: dataKeyId,
  });
}

async function decryptField(encryptedField) {
  if (!encryption) {
    throw new Error("Encryption setup is not complete.");
  }
  return encryption.decrypt(new Binary(Buffer.from(encryptedField, 'base64')));
}

module.exports = { encryptField, decryptField, initializeEncryption };
