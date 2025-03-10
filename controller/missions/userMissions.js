const missionSchema = require("../../model/missionSchema");
const userMissions = async (req, res, next) => {
  try {
    const data = await missionSchema
      .find({ assignedTo: req.params.id })
      .populate("assignedBy")
      .populate("project")
      .populate("assignedTo")
      .populate("Privetproject")
    
      .sort({ createdAt: -1 })
    res.json({ data });
  } catch (error) {
    next(error);
  }
};
module.exports = userMissions;
