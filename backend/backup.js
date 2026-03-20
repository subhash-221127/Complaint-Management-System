const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb://127.0.0.1:27017"; // your MongoDB URL
const client = new MongoClient(uri);

async function backupDB() {
  try {
    await client.connect();
    const db = client.db('complaint-management-system');

    // List of collections to backup
    const collections = ['complaints', 'departments', 'officers', 'citizens'];

    for (const colName of collections) {
      const data = await db.collection(colName).find().toArray();
      fs.writeFileSync(`${colName}_backup.json`, JSON.stringify(data, null, 2));
      console.log(`Backed up ${colName} (${data.length} documents)`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

backupDB();