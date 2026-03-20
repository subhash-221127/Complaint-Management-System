const mongoose = require('mongoose');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const Officer = require('./models/Officer');

const MONGO_URI = "mongodb://n220648_db_user:cityfix123@ac-r96cwdz-shard-00-00.guu2ckh.mongodb.net:27017,ac-r96cwdz-shard-00-01.guu2ckh.mongodb.net:27017,ac-r96cwdz-shard-00-02.guu2ckh.mongodb.net:27017/complaint-management-system?ssl=true&replicaSet=atlas-10t6yk-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

async function updateComplaintsAndOfficers() {
  try {
    const departments = await Department.find({});
    
    // Map department names to ObjectIds
    const deptMap = {};
    departments.forEach(d => { deptMap[d.name] = d._id; });

    // -----------------
    // Update complaints
    // -----------------
    const complaints = await Complaint.find({});
    for (let c of complaints) {
      if (typeof c.department === 'string' && deptMap[c.department]) {
        c.department = deptMap[c.department];
        await c.save();
        console.log(`Updated complaint ${c._id}`);
      }
    }

    // -----------------
    // Update officers
    // -----------------
    const officers = await Officer.find({});
    for (let o of officers) {
      if (typeof o.department === 'string' && deptMap[o.department]) {
        o.department = deptMap[o.department];
        await o.save();
        console.log(`Updated officer ${o._id}`);
      }
    }

    console.log("All complaints and officers updated successfully!");
    process.exit(0);

  } catch (err) {
    console.error("Error updating:", err);
    process.exit(1);
  }
}

updateComplaintsAndOfficers();