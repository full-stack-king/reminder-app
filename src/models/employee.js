let mongoose = require('mongoose')
let employeeSchema = new mongoose.Schema({
    fullname: String,
    employee_id: Number,
    skip_limit: Number,
    elapsed_date_limit: Number
})
module.exports = mongoose.model('Employee', employeeSchema)