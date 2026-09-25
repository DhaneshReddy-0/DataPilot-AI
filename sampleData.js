/**
 * Preloaded Sample Datasets
 * Designed with realistic distributions, date ranges, and a few duplicates/nulls for cleaning demo.
 */

export const SAMPLE_DATASETS = {
  sales: [
    { OrderDate: '2024-01-05', Region: 'North', Category: 'Electronics', Product: 'Pro Laptop 15', Sales: 1200, Profit: 300, Quantity: 2, Discount: 0.05 },
    { OrderDate: '2024-01-08', Region: 'South', Category: 'Furniture', Product: 'Ergonomic Desk Chair', Sales: 350, Profit: 80, Quantity: 1, Discount: 0.1 },
    { OrderDate: '2024-01-12', Region: 'East', Category: 'Electronics', Product: 'Wireless Headphones', Sales: 220, Profit: 75, Quantity: 3, Discount: 0 },
    { OrderDate: '2024-01-15', Region: 'West', Category: 'Office Supplies', Product: 'Mechanical Keyboard', Sales: 110, Profit: 35, Quantity: 2, Discount: 0 },
    { OrderDate: '2024-01-19', Region: 'North', Category: 'Electronics', Product: 'Ultra HD Monitor 27"', Sales: 450, Profit: 110, Quantity: 1, Discount: 0.1 },
    { OrderDate: '2024-01-23', Region: 'East', Category: 'Furniture', Product: 'Standing Electric Desk', Sales: 780, Profit: 190, Quantity: 1, Discount: 0.05 },
    { OrderDate: '2024-01-26', Region: 'West', Category: 'Electronics', Product: 'Smart Watch Series 5', Sales: 310, Profit: 95, Quantity: 2, Discount: 0.05 },
    { OrderDate: '2024-01-30', Region: 'South', Category: 'Office Supplies', Product: 'Laser Printer Pro', Sales: 290, Profit: -20, Quantity: 1, Discount: 0.2 },
    { OrderDate: '2024-02-03', Region: 'North', Category: 'Electronics', Product: 'Pro Laptop 15', Sales: 1200, Profit: 300, Quantity: 2, Discount: 0.05 }, // Duplicate row for cleaning
    { OrderDate: '2024-02-06', Region: 'West', Category: 'Furniture', Product: 'Conference Table', Sales: 1450, Profit: 340, Quantity: 1, Discount: 0.1 },
    { OrderDate: '2024-02-10', Region: 'East', Category: 'Electronics', Product: 'Noise Cancelling Earbuds', Sales: 180, Profit: 60, Quantity: 2, Discount: 0 },
    { OrderDate: '2024-02-14', Region: 'South', Category: 'Electronics', Product: 'Tablet 11"', Sales: 650, Profit: 160, Quantity: 1, Discount: 0.05 },
    { OrderDate: '2024-02-18', Region: 'North', Category: 'Office Supplies', Product: 'Document Scanner', Sales: 320, Profit: 85, Quantity: 2, Discount: 0 },
    { OrderDate: '2024-02-22', Region: 'West', Category: 'Electronics', Product: 'Pro Laptop 15', Sales: 2400, Profit: 620, Quantity: 4, Discount: 0.1 },
    { OrderDate: '2024-02-27', Region: 'East', Category: 'Furniture', Product: 'Ergonomic Desk Chair', Sales: null, Profit: 70, Quantity: 1, Discount: 0.05 }, // Missing sales value
    { OrderDate: '2024-03-02', Region: 'South', Category: 'Electronics', Product: 'Wireless Headphones', Sales: 220, Profit: 75, Quantity: 3, Discount: 0 },
    { OrderDate: '2024-03-07', Region: 'North', Category: 'Furniture', Product: 'Standing Electric Desk', Sales: 820, Profit: 210, Quantity: 1, Discount: 0 },
    { OrderDate: '2024-03-12', Region: 'East', Category: 'Electronics', Product: 'Ultra HD Monitor 27"', Sales: 900, Profit: 220, Quantity: 2, Discount: 0.05 },
    { OrderDate: '2024-03-16', Region: 'West', Category: 'Office Supplies', Product: 'Mechanical Keyboard', Sales: 165, Profit: 52, Quantity: 3, Discount: 0 },
    { OrderDate: '2024-03-21', Region: 'South', Category: 'Furniture', Product: 'Filing Cabinet Steel', Sales: 420, Profit: 90, Quantity: 2, Discount: 0.1 },
    { OrderDate: '2024-03-25', Region: 'North', Category: 'Electronics', Product: 'Smart Watch Series 5', Sales: 620, Profit: 190, Quantity: 4, Discount: 0.05 },
    { OrderDate: '2024-03-30', Region: 'West', Category: 'Electronics', Product: 'Tablet 11"', Sales: 1300, Profit: 310, Quantity: 2, Discount: 0.1 },
    { OrderDate: '2024-04-04', Region: 'East', Category: 'Office Supplies', Product: 'Laser Printer Pro', Sales: 580, Profit: 110, Quantity: 2, Discount: 0.05 },
    { OrderDate: '2024-04-09', Region: 'South', Category: 'Electronics', Product: 'Pro Laptop 15', Sales: 1250, Profit: 315, Quantity: 2, Discount: 0.05 },
    { OrderDate: '2024-04-14', Region: 'North', Category: 'Furniture', Product: 'Conference Table', Sales: 1520, Profit: 360, Quantity: 1, Discount: 0.05 },
    { OrderDate: '2024-04-19', Region: 'West', Category: 'Electronics', Product: 'Noise Cancelling Earbuds', Sales: 270, Profit: 90, Quantity: 3, Discount: 0 },
    { OrderDate: '2024-04-24', Region: 'East', Category: 'Electronics', Product: 'Ultra HD Monitor 27"', Sales: 1350, Profit: 330, Quantity: 3, Discount: 0.05 },
    { OrderDate: '2024-04-28', Region: 'South', Category: 'Furniture', Product: 'Standing Electric Desk', Sales: 800, Profit: 195, Quantity: 1, Discount: 0.05 }
  ],

  employees: [
    { EmployeeID: 'EMP-101', Department: 'Engineering', Role: 'Software Engineer', Salary: 115000, PerformanceRating: 4.5, YearsAtCompany: 3, OverTime: 'No', AttritionRisk: 'Low' },
    { EmployeeID: 'EMP-102', Department: 'Sales', Role: 'Account Executive', Salary: 85000, PerformanceRating: 3.8, YearsAtCompany: 2, OverTime: 'Yes', AttritionRisk: 'High' },
    { EmployeeID: 'EMP-103', Department: 'Product', Role: 'Product Manager', Salary: 130000, PerformanceRating: 4.8, YearsAtCompany: 5, OverTime: 'No', AttritionRisk: 'Low' },
    { EmployeeID: 'EMP-104', Department: 'Marketing', Role: 'Content Specialist', Salary: 65000, PerformanceRating: 3.5, YearsAtCompany: 1, OverTime: 'No', AttritionRisk: 'Medium' },
    { EmployeeID: 'EMP-105', Department: 'Engineering', Role: 'Tech Lead', Salary: 160000, PerformanceRating: 4.9, YearsAtCompany: 7, OverTime: 'Yes', AttritionRisk: 'Medium' },
    { EmployeeID: 'EMP-106', Department: 'HR', Role: 'HR Generalist', Salary: 72000, PerformanceRating: 3.9, YearsAtCompany: 4, OverTime: 'No', AttritionRisk: 'Low' },
    { EmployeeID: 'EMP-107', Department: 'Sales', Role: 'Sales Director', Salary: 175000, PerformanceRating: 4.6, YearsAtCompany: 6, OverTime: 'Yes', AttritionRisk: 'Low' },
    { EmployeeID: 'EMP-108', Department: 'Engineering', Role: 'DevOps Engineer', Salary: 120000, PerformanceRating: 4.2, YearsAtCompany: 2, OverTime: 'Yes', AttritionRisk: 'High' },
    { EmployeeID: 'EMP-109', Department: 'Design', Role: 'UI/UX Designer', Salary: 92000, PerformanceRating: 4.4, YearsAtCompany: 3, OverTime: 'No', AttritionRisk: 'Low' },
    { EmployeeID: 'EMP-110', Department: 'Sales', Role: 'SDR', Salary: 55000, PerformanceRating: 3.2, YearsAtCompany: 1, OverTime: 'Yes', AttritionRisk: 'High' },
    { EmployeeID: 'EMP-111', Department: 'Finance', Role: 'Financial Analyst', Salary: 88000, PerformanceRating: 4.1, YearsAtCompany: 3, OverTime: 'No', AttritionRisk: 'Low' },
    { EmployeeID: 'EMP-112', Department: 'Engineering', Role: 'QA Engineer', Salary: 82000, PerformanceRating: 3.7, YearsAtCompany: 2, OverTime: 'No', AttritionRisk: 'Low' }
  ],

  banking: [
    { TransactionDate: '2024-02-01', CustomerID: 'CUST-801', TransactionType: 'Transfer', Amount: 3200, Balance: 14500, Channel: 'Mobile App', IsFlaggedFraud: 0 },
    { TransactionDate: '2024-02-02', CustomerID: 'CUST-802', TransactionType: 'POS Purchase', Amount: 145, Balance: 3200, Channel: 'Debit Card', IsFlaggedFraud: 0 },
    { TransactionDate: '2024-02-04', CustomerID: 'CUST-803', TransactionType: 'ATM Withdrawal', Amount: 400, Balance: 8900, Channel: 'ATM', IsFlaggedFraud: 0 },
    { TransactionDate: '2024-02-05', CustomerID: 'CUST-804', TransactionType: 'Wire Transfer', Amount: 95000, Balance: 110000, Channel: 'Online Web', IsFlaggedFraud: 1 }, // High value outlier
    { TransactionDate: '2024-02-07', CustomerID: 'CUST-805', TransactionType: 'POS Purchase', Amount: 89, Balance: 4120, Channel: 'Debit Card', IsFlaggedFraud: 0 },
    { TransactionDate: '2024-02-09', CustomerID: 'CUST-806', TransactionType: 'Online Shopping', Amount: 480, Balance: 6700, Channel: 'Credit Card', IsFlaggedFraud: 0 },
    { TransactionDate: '2024-02-12', CustomerID: 'CUST-807', TransactionType: 'Transfer', Amount: 1500, Balance: 18200, Channel: 'Mobile App', IsFlaggedFraud: 0 },
    { TransactionDate: '2024-02-14', CustomerID: 'CUST-808', TransactionType: 'POS Purchase', Amount: 62, Balance: 2350, Channel: 'Debit Card', IsFlaggedFraud: 0 },
    { TransactionDate: '2024-02-18', CustomerID: 'CUST-809', TransactionType: 'International Wire', Amount: 42000, Balance: 48000, Channel: 'Branch', IsFlaggedFraud: 1 }
  ],

  saas: [
    { Month: '2023-10', MRR: 42000, Subscribers: 840, ARPU: 50, ChurnRate: 2.4, CAC: 310, LTV: 1850 },
    { Month: '2023-11', MRR: 45600, Subscribers: 910, ARPU: 50.1, ChurnRate: 2.2, CAC: 305, LTV: 1920 },
    { Month: '2023-12', MRR: 49800, Subscribers: 990, ARPU: 50.3, ChurnRate: 2.1, CAC: 295, LTV: 2010 },
    { Month: '2024-01', MRR: 54200, Subscribers: 1070, ARPU: 50.6, ChurnRate: 1.9, CAC: 290, LTV: 2150 },
    { Month: '2024-02', MRR: 59800, Subscribers: 1175, ARPU: 50.9, ChurnRate: 1.8, CAC: 282, LTV: 2280 },
    { Month: '2024-03', MRR: 66400, Subscribers: 1290, ARPU: 51.5, ChurnRate: 1.7, CAC: 275, LTV: 2420 },
    { Month: '2024-04', MRR: 73900, Subscribers: 1420, ARPU: 52.0, ChurnRate: 1.6, CAC: 270, LTV: 2590 }
  ]
};
