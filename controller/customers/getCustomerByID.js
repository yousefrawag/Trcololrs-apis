const customerSchema = require("../../model/customerSchema");
const getCustomerByID = async (req, res , next) => {
  try {
    const { id } = req.params;
    const customer = await customerSchema.findById(id)
  
    if (!customer) {
    return  res.status(404).json({ message: "Customer desn't exist" });
    }
    res.status(200).json({ customer });
  } catch (error) {
    next(error);
  }
};

module.exports = getCustomerByID;
