// DashboardService.ts

import { IDataAccess } from "../dataaccess/IDataAccess";
// import { MockDataAccess } from "../dataaccess/MockDataAccess"; // Xoá hoặc comment
import { SQLDataAccess } from "../dataaccess/SQLDataAccess"; // <--- IMPORT MỚI

const dataAccess: IDataAccess = new SQLDataAccess(); // <--- DÙNG SQL DATA ACCESS

// export const getDashboardSummary = async () => {
//   const summary = await dataAccess.getDashboardSummary();
//   return summary;
// };