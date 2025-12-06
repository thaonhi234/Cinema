import axiosClient from './axiosClient';

// Định nghĩa kiểu dữ liệu cơ bản cho nhân viên khi gửi lên (Không cần EmployeeID)
interface EmployeeCreateUpdateData {
    FullName: string;
    Sex: 'M' | 'F';
    PhoneNumber: string;
    Email: string;
    EPassword?: string; // Chỉ cần khi tạo mới
    Salary: number;
    Role: 'staff' | 'manager';
    BranchID: number;
    ManageID?: string | null;
}

const employeeApi = {
    // 1. READ/LIST + FILTER/SEARCH
    // GET /api/employees?search=query
    // BranchID được lấy từ Token.
    getAllEmployees: (searchTerm?: string) => {
        // Nếu có searchTerm, thêm query param.
        const url = searchTerm ? `/employees?search=${searchTerm}` : '/employees';
        return axiosClient.get(url);
    },

    // 2. READ (Chi tiết - Tùy chọn)
    getEmployeeById: (employeeId: string) => {
        return axiosClient.get(`/employees/${employeeId}`);
    },

    // 3. CREATE: Thêm nhân viên mới
    // POST /api/employees
    createEmployee: (data: EmployeeCreateUpdateData) => {
        // Backend sẽ tự kiểm tra BranchID của người tạo so với BranchID của nhân viên mới.
        return axiosClient.post('/employees', data);
    },

    // 4. UPDATE: Cập nhật thông tin nhân viên
    // PUT /api/employees/:id
    updateEmployee: (employeeId: string, data: Omit<EmployeeCreateUpdateData, 'EPassword' | 'Email'>) => {
        // Data không cần Email và Password (vì thường không update qua màn hình chính)
        return axiosClient.put(`/employees/${employeeId}`, data);
    },

    // 5. DELETE: Xóa nhân viên
    // DELETE /api/employees/:id
    deleteEmployee: (employeeId: string) => {
        return axiosClient.delete(`/employees/${employeeId}`);
    },
};

export default employeeApi;