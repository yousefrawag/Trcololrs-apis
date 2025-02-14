const customerSchema = require("../../model/customerSchema");
const projectschema = require("../../model/projectSchema")
const userSchema = require("../../model/userSchema")
const GetallCustomer = async (req, res, next) => {
  try {
    const { field, searTerm , startDate , endDate } = req.query;
    const id = req.token.id
    const user = await userSchema.findById(id)
    let filters 
    if(user.type === "admin") {
       filters = {};
    }else{
      filters = {
        addBy: id
      };      
    }
   
   
      // if (
      //   ["fullName" , "region" , "currency" , 
      //     "firstPayment" , "clientStatus" , 
      //     "cashOption" , "installmentsPyYear" , 
      //     "isViwed" ,"notes","phoneNumber",
      //     "project", "addBy",
      //      "clientendRequr" , "clientRequire"].includes(field) && searTerm
      
      // ) {
      //   filters[field] = { $regex: new RegExp(searTerm, 'i') };
      // } 

 
      // if(["createdAt" , "endContactDate" , "customerDate"].includes(field) && endDate){
      //   filters[field] = {
      //     $gte: new Date(startDate),  // greater than or equal to fromDate
      //     $lte: new Date(endDate) 
      //   }
      // }
    

    const data = await customerSchema.find(filters).populate("addBy").sort({ createdAt: -1 });

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports = GetallCustomer;