const {ipcRenderer} = require('electron');
let btn_clear = document.getElementById("btn_clear");
let frm_add_emp = document.getElementById("frm_add_emp");
let error_block = document.getElementById("error_block");

frm_add_emp.style.display = "none";

if (btn_clear) {
    btn_clear.addEventListener('click', function (event) {
        frm_clear();
    })
}

function frm_clear() {
    console.log('clearing form')
    if (frm_add_emp) {
        frm_add_emp.reset();
        document.getElementById("employee_id").value = '';
        document.getElementById("skip_limit").value = 0;
        document.getElementById("elapsed_date_limit").value = 1;
    }
}

frm_add_emp.addEventListener('submit', function (evt) {
    evt.preventDefault();
    const ele_employee_id = document.getElementById("employee_id");
    const ele_fullname = document.getElementById("fullname");
    const ele_skip_limit = document.getElementById("skip_limit");
    const ele_elapsed_date_limit = document.getElementById("elapsed_date_limit");

    const employee_id = ele_employee_id ? ele_employee_id.value : 0;
    const fullname = ele_fullname ? ele_fullname.value : 0;
    const skip_limit = ele_skip_limit ? ele_skip_limit.value : 0;
    const elapsed_date_limit = ele_elapsed_date_limit ? ele_elapsed_date_limit.value : 0;

    const form_data = { employee_id, fullname, skip_limit, elapsed_date_limit }
    ipcRenderer.send('frm_add_emp_submit', form_data);
    //display the same form with result
})

ipcRenderer.on('emp_list', (event, arg) => {
    console.log(arg);
    if (arg.success) {
        empList = JSON.parse(arg.empList);
        empList.forEach(emp => {
            console.log({ employee_id: emp.employee_id })
        });
        frm_add_emp.style.display = "block";
        error_block.style.display = "none";
    } else {
        frm_add_emp.style.display = "none";
        error_block.style.display = "block";
    }
})

ipcRenderer.on('emp_added', (event, arg) => {
    console.log({'emp_added':arg});
    if (arg.success) {
        frm_clear();
    }
    alert(arg.message);
})