/**
 * Seeds the database with a manager, employees, and sample leave requests.
 * Run with: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const Employee = require('./models/Employee');
const Leave = require('./models/Leave');

async function seed() {
  console.log('Clearing existing data...');
  db.exec('DELETE FROM leaves; DELETE FROM audit_logs; DELETE FROM employees;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('leaves','employees','audit_logs');");

  const password = await bcrypt.hash('Password@123', 10);

  console.log('Creating manager...');
  const manager = Employee.create({
    name: 'Asha Rao',
    email: 'manager@company.com',
    password,
    department: 'Engineering',
    role: 'MANAGER',
    manager_id: null,
  });

  console.log('Creating employees...');
  const emp1 = Employee.create({
    name: 'Tarun Kumar',
    email: 'employee@company.com',
    password,
    department: 'Engineering',
    role: 'EMPLOYEE',
    manager_id: manager.id,
  });

  const emp2 = Employee.create({
    name: 'Priya Singh',
    email: 'priya@company.com',
    password,
    department: 'Engineering',
    role: 'EMPLOYEE',
    manager_id: manager.id,
  });

  console.log('Creating sample leave requests...');
  const l1 = Leave.create({
    employee_id: emp1.id,
    leave_type: 'SICK',
    start_date: '2026-07-10',
    end_date: '2026-07-11',
    reason: 'Fever and needs rest',
  });

  Leave.create({
    employee_id: emp1.id,
    leave_type: 'CASUAL',
    start_date: '2026-07-20',
    end_date: '2026-07-20',
    reason: 'Personal work',
  });

  const l3 = Leave.create({
    employee_id: emp2.id,
    leave_type: 'EARNED',
    start_date: '2026-08-01',
    end_date: '2026-08-05',
    reason: 'Family vacation',
  });

  Leave.updateStatus(l1.id, 'APPROVED', { reviewed_by: manager.id, manager_comments: 'Get well soon' });
  Leave.updateStatus(l3.id, 'REJECTED', { reviewed_by: manager.id, manager_comments: 'Peak project deadline, please reschedule' });

  console.log('\nSeed complete. Sample credentials:');
  console.log('  Manager  -> email: manager@company.com   password: Password@123');
  console.log('  Employee -> email: employee@company.com  password: Password@123');
  console.log('  Employee -> email: priya@company.com      password: Password@123');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
