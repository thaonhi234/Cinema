/* MASTER SCRIPT - CGV DATABASE SYSTEM 
   FIX: ERROR 11719 (Sequence in Function)
   GIẢI PHÁP: Dùng Sequence trực tiếp trong Default Constraint
*/

USE master;
GO

-- 1. Xóa Database cũ để làm sạch
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'CGV')
BEGIN
    ALTER DATABASE CGV SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE CGV;
END
GO

-- 2. Tạo lại Database mới
CREATE DATABASE CGV;
GO

USE CGV;
GO

-----------------------------------------------------------
-- PHẦN 1: KHỞI TẠO SCHEMA VÀ SEQUENCE
-----------------------------------------------------------
EXEC('CREATE SCHEMA [Staff]');
EXEC('CREATE SCHEMA [Cinema]');
EXEC('CREATE SCHEMA [Movie]');
EXEC('CREATE SCHEMA [Screening]');
EXEC('CREATE SCHEMA [Booking]');
EXEC('CREATE SCHEMA [Products]');
EXEC('CREATE SCHEMA [Customer]');
GO

-- Tạo Sequence ID (Bộ đếm số)
CREATE SEQUENCE Seq_CustomerID START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE Seq_EmployeeID START WITH 1 INCREMENT BY 1;
GO

-----------------------------------------------------------
-- PHẦN 2: TẠO BẢNG (CREATE TABLES)
-----------------------------------------------------------

-- 1. Customer
-- SỬA LỖI: Nhúng trực tiếp logic sinh ID vào DEFAULT
CREATE TABLE Customer.CUSTOMER (
    CUserID VARCHAR(20) PRIMARY KEY DEFAULT ('CUS' + RIGHT('000' + CAST(NEXT VALUE FOR Seq_CustomerID AS VARCHAR(3)), 3)),
    CName VARCHAR(30) NOT NULL,
    Sex CHAR CHECK (Sex in ('M', 'F')),
    PhoneNumber VARCHAR(15),
    Email VARCHAR(30),
    EPassword VARCHAR(20) NOT NULL,
    UserType NVARCHAR(15) NOT NULL
);

-- 2. Membership
CREATE TABLE Customer.MEMBERSHIP (
    MemberID INT PRIMARY KEY,
    Point INT NOT NULL,
    MemberRank TINYINT CHECK (MemberRank BETWEEN 1 AND 4),
    CUserID VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT fk_mem_cus FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER(CUserID)
);

-- 3. Employee
-- SỬA LỖI: Nhúng trực tiếp logic sinh ID vào DEFAULT
CREATE TABLE Staff.EMPLOYEE (
    EUserID VARCHAR(20) PRIMARY KEY DEFAULT ('EMP' + RIGHT('000' + CAST(NEXT VALUE FOR Seq_EmployeeID AS VARCHAR(3)), 3)),
    EName VARCHAR(30) NOT NULL,
    Sex CHAR CHECK (Sex in ('M', 'F')),
    PhoneNumber VARCHAR(15),
    Email VARCHAR(30),
    EPassword VARCHAR(20) NOT NULL,
    Salary DECIMAL(10, 2) NOT NULL,
    UserType NVARCHAR(15) NOT NULL,
    ManageID VARCHAR(20),
    BranchID INT NOT NULL,
    CONSTRAINT fk_emp_man FOREIGN KEY (ManageID) REFERENCES Staff.EMPLOYEE (EUserID)
);

-- 4. WorkShift
CREATE TABLE Staff.WORKSHIFT (
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    WDate TINYINT NOT NULL CHECK (WDate BETWEEN 1 AND 7),
    Work NVARCHAR(255) NOT NULL,
    PRIMARY KEY (StartTime, EndTime, WDate)
);

-- 5. Work
CREATE TABLE Staff.WORK (
    EUserID VARCHAR(20),
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    WDate TINYINT NOT NULL,
    PRIMARY KEY (EUserID, StartTime, EndTime, WDate),
    CONSTRAINT fk_work_emp FOREIGN KEY (EUserID) REFERENCES Staff.EMPLOYEE (EUserID),
    CONSTRAINT fk_work_shift FOREIGN KEY (StartTime, EndTime, WDate) REFERENCES Staff.WORKSHIFT (StartTime, EndTime, WDate)
);

-- 6. Branch
CREATE TABLE Cinema.BRANCH (
    BranchID INT PRIMARY KEY,
    BName VARCHAR(32),
    ManageID VARCHAR(20),
    BAddress VARCHAR(30),
    CONSTRAINT fk_branch_emp_man FOREIGN KEY (ManageID) REFERENCES Staff.EMPLOYEE (EUserID)
);

-- 7. BranchPhone
CREATE TABLE Cinema.BRANCHPHONENUMBER (
    BranchID INT,
    BPhoneNumber VARCHAR(15),
    PRIMARY KEY (BranchID, BPhoneNumber),
    CONSTRAINT fk_phone_branch FOREIGN KEY (BranchID) REFERENCES Cinema.BRANCH (BranchID)
);

-- 8. ScreenRoom
CREATE TABLE Cinema.SCREENROOM (
    BranchID INT,
    RoomID INT,
    RType VARCHAR(20),
    RCapacity SMALLINT,
    PRIMARY KEY (BranchID, RoomID),
    CONSTRAINT fk_room_br FOREIGN KEY (BranchID) REFERENCES Cinema.BRANCH (BranchID)
);

-- 9. Seat
CREATE TABLE Cinema.SEAT (
    BranchID INT,
    RoomID INT,
    SRow TINYINT NOT NULL,
    SColumn TINYINT NOT NULL,
    SType BIT NOT NULL,
    SStatus BIT NOT NULL,
    PRIMARY KEY (BranchID, RoomID, SRow, SColumn),
    CONSTRAINT fk_seat_room FOREIGN KEY (BranchID, RoomID) REFERENCES Cinema.SCREENROOM (BranchID, RoomID)
);

-- 10. Movie
CREATE TABLE Movie.MOVIE (
    MovieID INT PRIMARY KEY,
    MName VARCHAR(255) NOT NULL,
    Descript NVARCHAR(MAX),
    RunTime TINYINT NOT NULL,
    isDub BIT NOT NULL,
    isSub BIT NOT NULL,
    releaseDate DATE NOT NULL,
    closingDate DATE NOT NULL,
    AgeRating VARCHAR(30) NOT NULL,
    posterURL VARCHAR(MAX)
);

-- 11. Genre
CREATE TABLE Movie.GENRE (Genre NVARCHAR(30) PRIMARY KEY);

-- 12. MovieGenre
CREATE TABLE Movie.MOVIEGENRE ( 
    MovieID INT,
    Genre NVARCHAR(30),
    PRIMARY KEY (MovieID, Genre),
    CONSTRAINT fk_mg_gen FOREIGN KEY (Genre) REFERENCES Movie.GENRE (Genre),
    CONSTRAINT fk_mg_mov FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID)
);

-- 13. Format
CREATE TABLE Movie.FORMATS (FName NVARCHAR(30) PRIMARY KEY);

-- 14. MovieFormat
CREATE TABLE Movie.MOVIEFORMAT (
    MovieID INT,
    FName NVARCHAR(30),
    PRIMARY KEY (MovieID, FName),
    CONSTRAINT fk_mf_fmt FOREIGN KEY (FName) REFERENCES Movie.FORMATS (FName),
    CONSTRAINT fk_mf_mov FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID)
);

-- 15. Actor
CREATE TABLE Movie.ACTOR (FullName VARCHAR(30) PRIMARY KEY);

-- 16. Features
CREATE TABLE Movie.FEATURES (
    MovieID INT,
    FullName VARCHAR(30),
    PRIMARY KEY (MovieID, FullName),
    CONSTRAINT fk_ft_mov FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID),
    CONSTRAINT fk_ft_act FOREIGN KEY (FullName) REFERENCES Movie.ACTOR (FullName)
);

-- 17. Review
CREATE TABLE Movie.REVIEW (
    MovieID INT,
    CUserID VARCHAR(20),
    Rating TINYINT CHECK (Rating BETWEEN 1 AND 10) NOT NULL, 
    RDate DATE NOT NULL,
    Comment NVARCHAR(MAX),
    PRIMARY KEY (MovieID, CUserID),
    CONSTRAINT fk_rv_mov FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID),
    CONSTRAINT fk_rv_cus FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER (CUserID) ON DELETE CASCADE
);

-- 18. ORDERS
CREATE TABLE Booking.ORDERS (
    OrderID INT PRIMARY KEY,
    OrderTime DATETIME NOT NULL,
    PaymentMethod VARCHAR(30),
    Total DECIMAL (10, 2) NOT NULL,
    CUserID VARCHAR(20) NOT NULL,
    EUserID VARCHAR(20),
    CONSTRAINT fk_ord_emp FOREIGN KEY (EUserID) REFERENCES Staff.EMPLOYEE(EUserID),
    CONSTRAINT fk_ord_cus FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER(CUserID)
);

-- 19. Coupon
CREATE TABLE Booking.COUPON (
    CouponID INT PRIMARY KEY,
    StartDate DATE,
    EndDate DATE,
    SaleOff TINYINT CHECK (SaleOff BETWEEN 1 AND 100) NOT NULL,
    ReleaseNum INT,
    AvailNum INT
);

-- 20. Own
CREATE TABLE Booking.OWN (
    CUserID VARCHAR(20) NOT NULL,
    CouponID INT NOT NULL,
    isUsed BIT NOT NULL DEFAULT 0,
    PRIMARY KEY (CouponID, CUserID),
    CONSTRAINT fk_own_cpn FOREIGN KEY (CouponID) REFERENCES Booking.COUPON (CouponID),
    CONSTRAINT fk_own_cus FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER(CUserID)
);

-- 21. CouponUsage
CREATE TABLE Booking.COUPONUSAGE (
    CouponID INT NOT NULL,
    OrderID INT NOT NULL,
    CUserID VARCHAR(20) NOT NULL,
    UseDate DATE NOT NULL DEFAULT (CONVERT(DATE, GETDATE())),
    PRIMARY KEY (CouponID, OrderID),
    UNIQUE (CouponID, CUserID),
    CONSTRAINT fk_use_cus FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER(CUserID) ON DELETE CASCADE,
    CONSTRAINT fk_use_cpn FOREIGN KEY (CouponID) REFERENCES Booking.COUPON (CouponID) ON DELETE CASCADE,
    CONSTRAINT fk_use_ord FOREIGN KEY (OrderID) REFERENCES Booking.ORDERS(OrderID)
);

-- 22. Time
CREATE TABLE Screening.TIME (
    TimeID INT PRIMARY KEY,
    Day DATE,
    StartTime TIME,
    EndTime TIME,
    FName NVARCHAR(30) NOT NULL,
    MovieID INT NOT NULL,
    RoomID INT NOT NULL,
    BranchID INT NOT NULL,
    UNIQUE (BranchID, RoomID, Day, StartTime),
    CONSTRAINT fk_tm_fmt FOREIGN KEY (FName) REFERENCES Movie.FORMATS (FName),
    CONSTRAINT fk_tm_mov FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID),
    CONSTRAINT fk_tm_rm FOREIGN KEY (BranchID, RoomID) REFERENCES Cinema.SCREENROOM (BranchID, RoomID)
);

-- 23. Tickets
CREATE TABLE Screening.TICKETS (
    TicketID INT PRIMARY KEY,
    DaySold DATE,
    TimeID INT NOT NULL,
    OrderID INT NOT NULL,
    BranchID INT NOT NULL,
    RoomID INT NOT NULL,
    TPrice DECIMAL(10, 2), 
    SRow TINYINT NOT NULL, 
    SColumn TINYINT NOT NULL,
    CONSTRAINT fk_tkt_seat FOREIGN KEY (BranchID, RoomID, SRow, SColumn) REFERENCES Cinema.SEAT(BranchID, RoomID, SRow, SColumn),
    CONSTRAINT fk_tkt_ord FOREIGN KEY (OrderID) REFERENCES Booking.ORDERS(OrderID),
    CONSTRAINT fk_tkt_tm FOREIGN KEY (TimeID) REFERENCES Screening.TIME (TimeID)
);

-- 24. Addon
CREATE TABLE Products.ADDONITEM (
    ProductID INT PRIMARY KEY,
    Price DECIMAL(10, 2), 
    ItemType VARCHAR(255),
    OrderID INT,
    CONSTRAINT fk_add_ord FOREIGN KEY (OrderID) REFERENCES Booking.ORDERS(OrderID)
);

CREATE TABLE Products.FOODDRINK (
    ProductID INT PRIMARY KEY,
    PType VARCHAR(30) NOT NULL, 
    PName VARCHAR(255),
    Quantity INT,
    CONSTRAINT fk_fd_add FOREIGN KEY (ProductID) REFERENCES Products.ADDONITEM (ProductID)
);

CREATE TABLE Products.MERCHANDISE (
    ProductID INT PRIMARY KEY,
    AvailNum INT,
    MerchName VARCHAR(255),
    StartDate DATE,
    EndDate DATE,
    CONSTRAINT fk_mer_add FOREIGN KEY (ProductID) REFERENCES Products.ADDONITEM (ProductID)
);

ALTER TABLE Staff.EMPLOYEE
ADD CONSTRAINT fk_emp_br_brid FOREIGN KEY (BranchID)
               REFERENCES Cinema.BRANCH (BranchID);

GO

-- View
CREATE OR ALTER VIEW Screening.AvailSeats AS
SELECT t.TimeID, sr.BranchID, sr.RoomID, sr.RCapacity - COUNT(tt.TicketID) AS AvailSeats
FROM Screening.TIME t
JOIN Cinema.SCREENROOM sr ON t.BranchID = sr.BranchID AND t.RoomID = sr.RoomID
JOIN Cinema.SEAT seat ON seat.BranchID = sr.BranchID AND seat.RoomID = sr.RoomID AND seat.SStatus = 1
LEFT JOIN Screening.TICKETS tt ON tt.TimeID = t.TimeID AND tt.BranchID = sr.BranchID AND tt.RoomID = sr.RoomID AND tt.SRow = seat.SRow AND tt.SColumn = seat.SColumn
GROUP BY t.TimeID, sr.BranchID, sr.RoomID, sr.RCapacity;
GO

-----------------------------------------------------------
-- PHẦN 3: INSERT DỮ LIỆU
-----------------------------------------------------------
SET DATEFORMAT DMY;

ALTER TABLE Staff.EMPLOYEE
NOCHECK CONSTRAINT fk_emp_br_brid;

ALTER TABLE Staff.EMPLOYEE
NOCHECK CONSTRAINT fk_emp_man;

-- Insert Customer (Không cần điền CUserID, nó tự sinh CUSxxx)
INSERT INTO Customer.CUSTOMER (CName, Sex, PhoneNumber, Email, EPassword, UserType) VALUES
('Nguyen Van A', 'M', '0901000001', 'a1@example.com', 'passA1', 'member'),
('Tran Thi B', 'F', '0901000002', 'b2@example.com', 'passB2', 'member'),
('Le Van C', 'M', '0901000003', 'c3@example.com', 'passC3', 'member'),
('Pham Thi D', 'F', '0901000004', 'd4@example.com', 'passD4', 'member'),
('Hoang Van E', 'M', '0901000005', 'e5@example.com', 'passE5', 'member'),
('Vo Thi F', 'F', '0901000006', 'f6@example.com', 'passF6', 'member'),
('Do Van G', 'M', '0901000007', 'g7@example.com', 'passG7', 'member'),
('Bui Thi H', 'F', '0901000008', 'h8@example.com', 'passH8', 'member'),
('Phan Van I', 'M', '0901000009', 'i9@example.com', 'passI9', 'member'),
('Ngo Thi J', 'F', '0901000010', 'j10@example.com', 'passJ10', 'member'),
('Dinh Van K', 'M', '0901000011', 'k11@example.com', 'passK11', 'member'),
('Cao Thi L', 'F', '0901000012', 'l12@example.com', 'passL12', 'member'),
('Trinh Van M', 'M', '0901000013', 'm13@example.com', 'passM13', 'member'),
('Ly Thi N', 'F', '0901000014', 'n14@example.com', 'passN14', 'member'),
('Dang Van O', 'M', '0901000015', 'o15@example.com', 'passO15', 'member'),
('Mai Thi P', 'F', '0901000016', 'p16@example.com', 'passP16', 'member'),
('Viet Van Q', 'M', '0901000017', 'q17@example.com', 'passQ17', 'member'),
('Ta Thi R', 'F', '0901000018', 'r18@example.com', 'passR18', 'member'),
('Quach Van S', 'M', '0901000019', 's19@example.com', 'passS19', 'member'),
('Ton Nu T', 'F', '0901000020', 't20@example.com', 'passT20', 'member'),
('Ninh Van U', 'M', '0901000021', 'u21@example.com', 'passU21', 'member'),
('Kieu Thi V', 'F', '0901000022', 'v22@example.com', 'passV22', 'member'),
('Lam Van W', 'M', '0901000023', 'w23@example.com', 'passW23', 'member'),
('Duong Thi X', 'F', '0901000024', 'x24@example.com', 'passX24', 'member'),
('Vu Van Y', 'M', '0901000025', 'y25@example.com', 'passY25', 'member'),
('Chu Thi Z', 'F', '0901000026', 'z26@example.com', 'passZ26', 'member'),
('Cao Van AA', 'M', '0901000027', 'aa27@example.com', 'passAA27', 'member'),
('Ngo Thi BB', 'F', '0901000028', 'bb28@example.com', 'passBB28', 'member'),
('Duy Van CC', 'M', '0901000029', 'cc29@example.com', 'passCC29', 'member'),
('Tram Thi DD', 'F', '0901000030', 'dd30@example.com', 'passDD30', 'member');

INSERT INTO Customer.MEMBERSHIP (MemberID, Point, MemberRank, CUserID) VALUES
(1, 120, 1, 'CUS001'), (2, 300, 2, 'CUS002'), (3, 450, 2, 'CUS003'), (4, 50, 1, 'CUS004'), (5, 800, 3, 'CUS005'),
(6, 1500, 4, 'CUS006'), (7, 700, 3, 'CUS007'), (8, 200, 1, 'CUS008'), (9, 950, 3, 'CUS009'), (10, 110, 1, 'CUS010'),
(11, 250, 2, 'CUS011'), (12, 1200, 4, 'CUS012'), (13, 430, 2, 'CUS013'), (14, 560, 2, 'CUS014'), (15, 780, 3, 'CUS015'),
(16, 90, 1, 'CUS016'), (17, 1400, 4, 'CUS017'), (18, 310, 2, 'CUS018'), (19, 600, 3, 'CUS019'), (20, 100, 1, 'CUS020'),
(21, 820, 3, 'CUS021'), (22, 130, 1, 'CUS022'), (23, 400, 2, 'CUS023'), (24, 2000, 4, 'CUS024'), (25, 260, 2, 'CUS025'),
(26, 520, 2, 'CUS026'), (27, 880, 3, 'CUS027'), (28, 1750, 4, 'CUS028'), (29, 340, 2, 'CUS029'), (30, 620, 3, 'CUS030');

-- Insert Employee (Tự sinh EMPxxx)
INSERT INTO Staff.EMPLOYEE 
(EName, Sex, PhoneNumber, Email, EPassword, Salary, UserType, ManageID, BranchID) VALUES 
('Tran Van A', 'M', '0901111001', 'a1@cgv.vn', 'emp001', 7000, 'manager', NULL, 1),
('Nguyen Thi B', 'F', '0901111002', 'b2@cgv.vn', 'emp002', 7500, 'manager', NULL, 2),
('Le Van C', 'M', '0901111003', 'c3@cgv.vn', 'emp003', 6800, 'manager', NULL, 3),
('Pham Thi D', 'F', '0901111004', 'd4@cgv.vn', 'emp004', 7200, 'manager', NULL, 4),
('Do Van E', 'M', '0901111005', 'e5@cgv.vn', 'emp005', 6900, 'manager', NULL, 5);

INSERT INTO Staff.EMPLOYEE 
(EName, Sex, PhoneNumber, Email, EPassword, Salary, UserType, ManageID, BranchID) VALUES
('Nguyen Van F', 'M', '0901111101', 'f6@cgv.vn', 'emp006', 3200, 'staff', 'EMP001', 1),
('Tran Thi G', 'F', '0901111102', 'g7@cgv.vn', 'emp007', 3500, 'staff', 'EMP001', 1),
('Hoang Van H', 'M', '0901111103', 'h8@cgv.vn', 'emp008', 4000, 'staff', 'EMP001', 1),
('Vo Thi I', 'F', '0901111104', 'i9@cgv.vn', 'emp009', 3600, 'staff', 'EMP001', 1),
('Ly Van J', 'M', '0901111105', 'j10@cgv.vn', 'emp010', 3900, 'staff', 'EMP001', 1),
('Phan Thi K', 'F', '0901111201', 'k11@cgv.vn', 'emp011', 3100, 'staff', 'EMP002', 2),
('Bui Van L', 'M', '0901111202', 'l12@cgv.vn', 'emp012', 4300, 'staff', 'EMP002', 2),
('Dang Thi M', 'F', '0901111203', 'm13@cgv.vn', 'emp013', 3800, 'staff', 'EMP002', 2),
('Ngo Van N', 'M', '0901111204', 'n14@cgv.vn', 'emp014', 4500, 'staff', 'EMP002', 2),
('Trinh Thi O', 'F', '0901111205', 'o15@cgv.vn', 'emp015', 3600, 'staff', 'EMP002', 2),
('Vo Van P', 'M', '0901111301', 'p16@cgv.vn', 'emp016', 3300, 'staff', 'EMP003', 3),
('Luong Thi Q', 'F', '0901111302', 'q17@cgv.vn', 'emp017', 4200, 'staff', 'EMP003', 3),
('Ha Van R', 'M', '0901111303', 'r18@cgv.vn', 'emp018', 3900, 'staff', 'EMP003', 3),
('Chu Thi S', 'F', '0901111304', 's19@cgv.vn', 'emp019', 3100, 'staff', 'EMP003', 3),
('Vu Van T', 'M', '0901111305', 't20@cgv.vn', 'emp020', 3700, 'staff', 'EMP003', 3),
('Tran Van U', 'M', '0901111401', 'u21@cgv.vn', 'emp021', 3400, 'staff', 'EMP004', 4),
('Nguyen Thi V', 'F', '0901111402', 'v22@cgv.vn', 'emp022', 3600, 'staff', 'EMP004', 4),
('Le Van W', 'M', '0901111403', 'w23@cgv.vn', 'emp023', 4100, 'staff', 'EMP004', 4),
('Pham Thi X', 'F', '0901111404', 'x24@cgv.vn', 'emp024', 3800, 'staff', 'EMP004', 4),
('Do Van Y', 'M', '0901111405', 'y25@cgv.vn', 'emp025', 3500, 'staff', 'EMP004', 4),
('Hoang Thi Z', 'F', '0901111501', 'z26@cgv.vn', 'emp026', 4300, 'staff', 'EMP005', 5),
('Ly Van AA', 'M', '0901111502', 'aa27@cgv.vn', 'emp027', 3800, 'staff', 'EMP005', 5),
('Ngo Thi AB', 'F', '0901111503', 'ab28@cgv.vn', 'emp028', 3100, 'staff', 'EMP005', 5),
('Bui Van AC', 'M', '0901111504', 'ac29@cgv.vn', 'emp029', 4200, 'staff', 'EMP005', 5),
('Tran Thi AD', 'F', '0901111505', 'ad30@cgv.vn', 'emp030', 3900, 'staff', 'EMP005', 5);

INSERT INTO Cinema.BRANCH (BranchID, BName, ManageID, BAddress) VALUES
(1, 'CGV Aeon Tan Phu', 'EMP002', '30 Tan Phu, HCM'),
(2, 'CGV Vincom Dong Khoi', 'EMP003', '70 Dong Khoi, HCM'),
(3, 'CGV Aeon Binh Duong', 'EMP004', '1 Binh Duong'),
(4, 'CGV Vincom Thao Dien', 'EMP005', '159 XLHN, HCM'),
(5, 'CGV Go Vap', 'EMP006', '12 Phan Van Tri, HCM');

INSERT INTO Cinema.BRANCHPHONENUMBER (BranchID, BPhoneNumber) VALUES
(1, '0281111001'), (1, '0281111002'),
(2, '0282222001'), (2, '0282222002'),
(3, '0274111101'), (3, '0274111102'),
(4, '0284444001'), (4, '0284444002'),
(5, '0285555001'), (5, '0285555002');

ALTER TABLE Staff.EMPLOYEE
WITH CHECK CHECK CONSTRAINT ALL;

INSERT INTO Staff.WORKSHIFT (StartTime, EndTime, WDate, Work) VALUES
('08:00', '12:00', 1, N'Ve sinh phong chieu'),
('12:00', '16:00', 1, N'Ban ve'),
('16:00', '20:00', 1, N'Kiem tra thiet bi'),
('08:00', '12:00', 2, N'Ve sinh phong chieu'),
('12:00', '16:00', 2, N'Ban ve'),
('16:00', '20:00', 2, N'Kiem tra thiet bi'),
('08:00', '12:00', 3, N'Ve sinh phong chieu'),
('12:00', '16:00', 3, N'Ban ve'),
('16:00', '20:00', 3, N'Kiem tra thiet bi'),
('08:00', '12:00', 4, N'Ve sinh phong chieu'),
('12:00', '16:00', 4, N'Ban ve'),
('16:00', '20:00', 4, N'Kiem tra thiet bi'),
('08:00', '12:00', 5, N'Ve sinh phong chieu'),
('12:00', '16:00', 5, N'Ban ve'),
('16:00', '20:00', 5, N'Kiem tra thiet bi'),
('08:00', '12:00', 6, N'Ve sinh phong chieu'),
('12:00', '16:00', 6, N'Ban ve'),
('16:00', '20:00', 6, N'Kiem tra thiet bi'),
('08:00', '12:00', 7, N'Ve sinh phong chieu'),
('12:00', '16:00', 7, N'Ban ve'),
('16:00', '20:00', 7, N'Kiem tra thiet bi'),
('20:00', '23:00', 1, N'Don dep cuoi ngay'),
('20:00', '23:00', 2, N'Don dep cuoi ngay'),
('20:00', '23:00', 3, N'Don dep cuoi ngay'),
('20:00', '23:00', 4, N'Don dep cuoi ngay'),
('20:00', '23:00', 5, N'Don dep cuoi ngay'),
('20:00', '23:00', 6, N'Don dep cuoi ngay'),
('20:00', '23:00', 7, N'Don dep cuoi ngay'),
('09:00', '13:00', 1, N'Ho tro quan ly'),
('13:00', '17:00', 2, N'Ho tro van hanh'),
('17:00', '21:00', 3, N'Ho tro ban ve');

INSERT INTO Staff.WORK (EUserID, StartTime, EndTime, WDate) VALUES
('EMP002', '08:00', '12:00', 1), ('EMP003', '12:00', '16:00', 1), ('EMP004', '16:00', '20:00', 1),
('EMP005', '08:00', '12:00', 2), ('EMP006', '12:00', '16:00', 2), ('EMP007', '16:00', '20:00', 2),
('EMP008', '08:00', '12:00', 3), ('EMP009', '12:00', '16:00', 3), ('EMP010', '16:00', '20:00', 3),
('EMP011', '08:00', '12:00', 4), ('EMP012', '12:00', '16:00', 4), ('EMP013', '16:00', '20:00', 4),
('EMP014', '08:00', '12:00', 5), ('EMP015', '12:00', '16:00', 5), ('EMP016', '16:00', '20:00', 5),
('EMP017', '08:00', '12:00', 6), ('EMP018', '12:00', '16:00', 6), ('EMP019', '16:00', '20:00', 6),
('EMP020', '08:00', '12:00', 7), ('EMP021', '12:00', '16:00', 7), ('EMP022', '16:00', '20:00', 7),
('EMP023', '20:00', '23:00', 1), ('EMP024', '20:00', '23:00', 2), ('EMP025', '20:00', '23:00', 3),
('EMP026', '20:00', '23:00', 4), ('EMP027', '20:00', '23:00', 5), ('EMP028', '20:00', '23:00', 6),
('EMP029', '20:00', '23:00', 7), ('EMP030', '09:00', '13:00', 1), ('EMP001', '13:00', '17:00', 2);

INSERT INTO Cinema.SCREENROOM (BranchID, RoomID, RType, RCapacity) VALUES
-- Branch 1
(1, 1, 'Standard', 90),
(1, 2, 'IMAX', 100),
(1, 3, '4DX', 85),
-- Branch 2
(2, 1, 'Standard', 95),
(2, 2, 'IMAX', 100),
(2, 3, 'Standard', 88),
-- Branch 3
(3, 1, '4DX', 82),
(3, 2, 'Standard', 90),
(3, 3, 'IMAX', 100),
-- Branch 4
(4, 1, 'Standard', 85),
(4, 2, '4DX', 92),
(4, 3, 'IMAX', 100),
-- Branch 5
(5, 1, 'Standard', 80),
(5, 2, 'Standard', 90),
(5, 3, '4DX', 95);

--script sinh ghế
BEGIN

SET NOCOUNT ON;

DECLARE @BranchID INT, @RoomID INT, @Capacity INT;
DECLARE @count INT, @row INT, @col INT;

DECLARE cur CURSOR FOR
SELECT BranchID, RoomID, RCapacity
FROM Cinema.SCREENROOM;

OPEN cur;
FETCH NEXT FROM cur INTO @BranchID, @RoomID, @Capacity;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @count = 0;
    SET @row = 1;

    WHILE @row <= 10 AND @count < @Capacity
    BEGIN
        SET @col = 1;

        WHILE @col <= 10 AND @count < @Capacity
        BEGIN
            INSERT INTO Cinema.SEAT (BranchID, RoomID, SRow, SColumn, SType, SStatus)
            VALUES (
                @BranchID,
                @RoomID,
                @row,
                @col,
                CASE WHEN @col >= 8 THEN 1 ELSE 0 END,  -- VIP từ cột 8 đến 10
                1                                       -- Ghế đang hoạt động
            );

            SET @count = @count + 1;
            SET @col = @col + 1;
        END

        SET @row = @row + 1;
    END

    FETCH NEXT FROM cur INTO @BranchID, @RoomID, @Capacity;
END

CLOSE cur;
DEALLOCATE cur;

END;

INSERT INTO Movie.MOVIE (
    MovieID, MName, Descript, RunTime, isDub, isSub,
    releaseDate, closingDate, AgeRating, posterURL
) VALUES
(1, 'Dune: Part Two', 'Epic sci-fi adventure on Arrakis.', 165, 0, 1, '2025-11-15', '2025-12-06', 'T13', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgahEVjTExV86KHTl8k8uimH8Gl1RFbsasBg&s'),
(2, 'Oppenheimer', 'Story of J. Robert Oppenheimer.', 180, 0, 1, '2025-11-18', '2025-12-10', 'T16', 'https://upload.wikimedia.org/wikipedia/vi/2/21/Oppenheimer_%E2%80%93_Vietnam_poster.jpg'),
(3, 'Barbie', 'A journey of self-discovery in the real world.', 114, 1, 1, '2025-11-20', '2025-12-05', 'K', 'https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg'),
(4, 'Godzilla Minus One', 'Japan faces a new monster threat.', 130, 0, 1, '2025-11-22', '2025-12-12', 'T13', 'https://play-lh.googleusercontent.com/IJLerbsoGpcPRFoHyQnHMdchtRxYiR6WylvnTDiFrYx7pDtl5PrZ5H7TSuUZrZzBsDDc=w240-h480-rw'),
(5, 'Spider-Man: Across the Spider-Verse', 'Miles enters new dimensions.', 142, 1, 1, '2025-12-01', '2025-12-22', 'K', 'https://play-lh.googleusercontent.com/JHpBnavPHamlOEPv8BMCjOPTqipVY9D-TqF7ziuF-tMfINPMSb-vn6OJ-Ae29aGGddYpQ4g7EeVw1C5RTWI'),
(6, 'Inside Out 2', 'Riley faces new emotions.', 100, 1, 1, '2025-11-25', '2025-12-15', 'K', 'https://www.cgv.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/1/0/1080x1350-insideout.jpg'),
(7, 'The Batman', 'Batman uncovers Gotham corruption.', 176, 0, 1, '2025-11-28', '2025-12-20', 'T13', 'https://www.cgv.vn/media/catalog/product/cache/3/image/c5f0a1eff4c394a251036189ccddaacd/p/o/poster_batman-1.jpg'),
(8, 'Avatar: The Way of Water', 'Return to Pandora oceans.', 190, 0, 1, '2025-12-10', '2025-12-31', 'T13', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvp0KgXubkh5O4dn_SQWCFzkRb6bV7rGo0ug&s'),
(9, 'Wonka', 'The early life of Willy Wonka.', 115, 1, 1, '2025-12-15', '2026-01-05', 'K', 'https://www.cgv.vn/media/catalog/product/cache/3/image/1800x/71252117777b696995f01934522c402d/7/0/700x1000_22_.jpg'),
(10, 'Mission: Impossible – Dead Reckoning', 'Ethan Hunt faces a new threat.', 158, 0, 1, '2025-11-18', '2025-12-05', 'T13', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5YXaBnZZeLpSpSyhk__ii6zuKMJ2WQ1MHgQ&s'),
(11, 'John Wick: Chapter 4', 'John Wick returns for revenge.', 169, 0, 1, '2025-11-30', '2025-12-20', 'T16', 'https://play-lh.googleusercontent.com/4z2yXqwOqOnnqv3NZ5Y3wWEDPT1slgqtDOpeopF4FvWqYdVGJhrQtPOivHl8bkLsZXEd'),
(12, 'The Marvels', 'Captain Marvel joins new heroes.', 105, 1, 1, '2025-11-17', '2025-12-04', 'T13', 'https://www.cgv.vn/media/catalog/product/cache/3/image/c5f0a1eff4c394a251036189ccddaacd/r/s/rsz_56245l07_goat_vietnam_apac_poster_1sht.jpg'),
(13, 'The Creator', 'AI uprising threatens humanity.', 133, 0, 1, '2025-12-18', '2026-01-08', 'T13', 'https://m.media-amazon.com/images/M/MV5BMDkxMTUxOTQtYzM4Yi00YzA2LTgzOTYtNDg2NTliODE0ZTRjXkEyXkFqcGc@._V1_.jpg'),
(14, 'Napoleon', 'Epic biography of Napoleon Bonaparte.', 158, 0, 1, '2025-11-28', '2025-12-14', 'T13', 'https://play-lh.googleusercontent.com/SuuRJtwRMVKSja2yfUOkKQ8ggCXt7G3tQY0ARwmxZkpJLinxAg5PnDzG9ehEF8-llonEcEMHhXEumDrBmbE'),
(15, 'Kung Fu Panda 4', 'Po trains a new warrior.', 100, 1, 1, '2025-12-05', '2025-12-25', 'K', 'https://touchcinema.com/medias/hinh-phim-2021/1200wx1800h-11-1709711550-poster.jpg'),
(16, 'Aquaman and the Lost Kingdom', 'Aquaman protects Atlantis.', 124, 1, 1, '2025-12-12', '2026-01-02', 'T13', 'https://www.cgv.vn/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/p/o/poster_payoff_aquaman_6_1_.jpg'),
(17, 'The Hunger Games: The Ballad of Songbirds & Snakes', 'A prequel exploring the early days of the Hunger Games.', 157, 0, 1, '2025-12-09', '2025-12-28', 'T13', 'https://m.media-amazon.com/images/M/MV5BMWI1OGM4YjQtNmIxNi00YmE2LWJkNTAtY2Q0YjU4NTI5NWQyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
(18, 'The Equalizer 3', 'McCall seeks justice in Italy.', 109, 0, 1, '2025-12-18', '2026-01-08', 'T13', 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/The_Equalizer_3_poster.jpg/250px-The_Equalizer_3_poster.jpg'),
(19, 'Indiana Jones and the Dial of Destiny', 'Indiana Jones travels through time.', 142, 0, 1, '2025-11-16', '2025-12-03', 'T13', 'https://m.media-amazon.com/images/I/81biiIq1mcL._AC_UF1000,1000_QL80_.jpg'),
(20, 'Elemental', 'Fire and water form an unlikely bond.', 102, 1, 1, '2025-12-01', '2025-12-22', 'K', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-DHQ3bXben1JqR_7ytOdjekgxmh1XY6a6mw&s'),
(21, 'The Flash', 'Flash resets the universe.', 144, 0, 1, '2025-11-25', '2025-12-12', 'T13', 'https://play-lh.googleusercontent.com/zhK4JWCF9AYv_kzMQMQNZCLtKiQDP4HT78XrMZQI14glTZtd6pmapIRUS2aVqjR_lB0jp2y67bKOx-i-isU'),
(22, 'Transformers: Rise of the Beasts', 'Autobots meet the Maximals.', 120, 1, 1, '2025-11-20', '2025-12-08', 'T13', 'https://m.media-amazon.com/images/M/MV5BZWI1ZDY1YTQtMjRkNy00ZDZhLWE3OTItMTIwNzliY2Y1MTZhXkEyXkFqcGc@._V1_.jpg'),
(23, 'Blue Beetle', 'A young hero gains alien armor.', 128, 1, 1, '2025-12-09', '2025-12-30', 'T13', 'https://www.cgv.vn/media/catalog/product/cache/3/image/c5f0a1eff4c394a251036189ccddaacd/p/o/poster_blue_beetle_4_1_.jpg'),
(24, 'The Super Mario Bros. Movie', 'Mario rescues the Mushroom Kingdom.', 92, 1, 1, '2025-12-08', '2025-12-28', 'K', 'https://play-lh.googleusercontent.com/N5MUJfFcUpp1xeU7yhvrO2LKthFHUfQEN_Yzgsef1YfZrv8168ASmnuo2lMlWO2lzmQuEJ1VldUUqy1MfG0'),
(25, 'The Little Mermaid', 'Live-action remake of classic.', 135, 1, 1, '2025-12-09', '2025-12-31', 'K', 'https://m.media-amazon.com/images/M/MV5BMTM4MWY0OTEtY2E4ZC00NDdhLThkY2ItYTlmNWQxNTNkZTRmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
(26, 'Guardians of the Galaxy Vol. 3', 'Guardians face their pasts.', 150, 0, 1, '2025-11-15', '2025-12-05', 'T13', 'https://upload.wikimedia.org/wikipedia/en/7/74/Guardians_of_the_Galaxy_Vol._3_poster.jpg'),
(27, 'Creed III', 'Adonis Creed faces a rival.', 116, 0, 1, '2025-12-01', '2025-12-22', 'T13', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-BU0Fo0HSKp_D7fxpeHfL_nkb56ES0cmvjg&s'),
(28, 'Top Gun: Maverick (Re-release)', 'Maverick trains new pilots.', 131, 0, 1, '2025-11-20', '2025-12-10', 'T13', 'https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_.jpg'),
(29, 'Smile 2', 'Horror sequel with new curse.', 100, 0, 1, '2025-12-15', '2026-01-05', 'T16', 'https://play-lh.googleusercontent.com/Vx71NrS5xQdjuxprj3msIr2hynFfqP1nrJx0gLjT5evJutUVhb990-8_XIBMXNUZT7Z_jMSn-KJc4rGq2A=w240-h480-rw'),
(30, 'Deadpool & Wolverine', 'Deadpool teams up with Wolverine.', 130, 0, 1, '2025-12-13', '2026-01-03', 'T16', 'https://vcdn1-giaitri.vnecdn.net/2024/07/30/DPW-CharacterPoster-2707-7546-1722328420.png?w=0&h=0&q=100&dpr=2&fit=crop&s=iNGSE0evlJuV2WVNzHqjdA');

INSERT INTO Movie.GENRE (Genre) VALUES
('Action'), ('Adventure'), ('Sci-Fi'), ('Fantasy'), ('Drama'),
('Biography'), ('Comedy'), ('Animation'), ('Family'), ('Thriller'),
('Horror'), ('Romance'), ('Crime'), ('Superhero');

INSERT INTO Movie.MOVIEGENRE (MovieID, Genre) VALUES
(1, 'Sci-Fi'), (2, 'Horror'), (3, 'Fantasy'), (4, 'Action'), (5, 'Superhero'), (6, 'Animation'),
(7, 'Thriller'), (8, 'Comedy'), (9, 'Action'), (10, 'Crime'), (11, 'Superhero'), (12, 'Action'),
(13, 'Biography'), (14, 'Biography'), (15, 'Drama'), (16, 'Sci-Fi'), (17, 'Action'), (18, 'Superhero'),
(19, 'Romance'), (20, 'Animation'), (21, 'Thriller'), (22, 'Animation'), (23, 'Action'), (24, 'Animation'),
(25, 'Adventure'), (26, 'Sci-Fi'), (27, 'Fantasy'), (28, 'Comedy'), (29, 'Animation'), (30, 'Drama');

INSERT INTO Movie.FORMATS (FName) VALUES
('Standard'), ('IMAX'), ('4DX');

INSERT INTO Movie.MOVIEFORMAT (MovieID, FName) VALUES
(1, 'IMAX'), (2, 'IMAX'), (3, 'Standard'), (4, '4DX'), (5, 'IMAX'), (6, 'Standard'),
(7, 'IMAX'), (8, 'Standard'), (9, '4DX'), (10, 'IMAX'), (11, 'Standard'), (12, 'Standard'),
(13, 'Standard'), (14, 'Standard'), (15, 'Standard'), (16, 'IMAX'), (17, '4DX'), (18, 'Standard'),
(19, 'Standard'), (20, '4DX'), (21, 'Standard'), (22, 'Standard'), (23, '4DX'), (24, 'Standard'),
(25, 'Standard'), (26, 'IMAX'), (27, 'Standard'), (28, 'Standard'), (29, 'Standard'), (30, 'Standard');

INSERT INTO Movie.ACTOR (FullName) VALUES
('Tom Holland'), ('Zendaya'), ('Timothee Chalamet'), ('Florence Pugh'),
('Cillian Murphy'), ('Emily Blunt'), ('Ryan Gosling'), ('Margot Robbie'),
('Keanu Reeves'), ('Ana de Armas'), ('Leonardo DiCaprio'), ('Jennifer Lawrence'),
('Chris Hemsworth'), ('Scarlett Johansson'), ('Robert Downey Jr'), ('Chris Evans'),
('Emma Stone'), ('Andrew Garfield'), ('Henry Cavill'), ('Gal Gadot');

INSERT INTO Movie.FEATURES (MovieID, FullName) VALUES
(1, 'Tom Holland'), (1, 'Zendaya'), 
(2, 'Timothee Chalamet'), (2, 'Florence Pugh'),
(3, 'Cillian Murphy'), (3, 'Emily Blunt'),
(4, 'Ryan Gosling'), (4, 'Margot Robbie'),
(5, 'Keanu Reeves'), (5, 'Ana de Armas'),
(6, 'Leonardo DiCaprio'), (6, 'Jennifer Lawrence'),
(7, 'Chris Hemsworth'), (7, 'Scarlett Johansson'),
(8, 'Robert Downey Jr'), (8, 'Chris Evans'),
(9, 'Emma Stone'), (9, 'Andrew Garfield'),
(10, 'Henry Cavill'), (10, 'Gal Gadot'),
(11, 'Tom Holland'), (11, 'Zendaya'),
(12, 'Timothee Chalamet'), (12, 'Florence Pugh'),
(13, 'Cillian Murphy'), (13, 'Emily Blunt'),
(14, 'Ryan Gosling'), (14, 'Margot Robbie'),
(15, 'Keanu Reeves'), (15, 'Ana de Armas'),
(16, 'Leonardo DiCaprio'), (16, 'Jennifer Lawrence'),
(17, 'Chris Hemsworth'), (17, 'Scarlett Johansson'),
(18, 'Robert Downey Jr'), (18, 'Chris Evans'),
(19, 'Emma Stone'), (19, 'Andrew Garfield'),
(20, 'Henry Cavill'), (20, 'Gal Gadot'),
(21, 'Tom Holland'), (21, 'Zendaya'),
(22, 'Timothee Chalamet'), (22, 'Florence Pugh'),
(23, 'Cillian Murphy'), (23, 'Emily Blunt'),
(24, 'Ryan Gosling'), (24, 'Margot Robbie'),
(25, 'Keanu Reeves'), (25, 'Ana de Armas'),
(26, 'Leonardo DiCaprio'), (26, 'Jennifer Lawrence'),
(27, 'Chris Hemsworth'), (27, 'Scarlett Johansson'),
(28, 'Robert Downey Jr'), (28, 'Chris Evans'),
(29, 'Emma Stone'), (29, 'Andrew Garfield'),
(30, 'Henry Cavill'), (30, 'Gal Gadot');

INSERT INTO Movie.REVIEW (MovieID, CUserID, Rating, RDate, Comment) VALUES
(1, 'CUS001', 8, '2025-11-16', N'Good movie'),
(1, 'CUS002', 9, '2025-11-17', N'Great storyline'),
(1, 'CUS003', 7, '2025-11-18', N'Interesting plot'),
(1, 'CUS004', 8, '2025-11-19', N'Enjoyable'),
(1, 'CUS005', 9, '2025-11-20', N'Amazing visuals'),
(2, 'CUS006', 7, '2025-11-19', N'Nice effects'),
(2, 'CUS007', 8, '2025-11-20', N'Enjoyable'),
(2, 'CUS008', 7, '2025-11-21', N'Good pacing'),
(2, 'CUS009', 9, '2025-11-22', N'Great acting'),
(2, 'CUS010', 8, '2025-11-23', N'Solid story'),
(3, 'CUS011', 9, '2025-11-20', N'Excellent'),
(3, 'CUS012', 6, '2025-11-21', N'Average'),
(3, 'CUS013', 8, '2025-11-22', N'Good fun'),
(3, 'CUS014', 7, '2025-11-23', N'Nice visuals'),
(3, 'CUS015', 9, '2025-11-24', N'Loved it'),
(4, 'CUS016', 8, '2025-11-22', N'Good pacing'),
(4, 'CUS017', 7, '2025-11-23', N'Solid'),
(4, 'CUS018', 8, '2025-11-24', N'Impressive'),
(4, 'CUS019', 7, '2025-11-25', N'Well done'),
(4, 'CUS020', 8, '2025-11-26', N'Enjoyable'),
(5, 'CUS021', 9, '2025-12-01', N'Amazing'),
(5, 'CUS022', 8, '2025-12-02', N'Good story'),
(5, 'CUS023', 7, '2025-12-03', N'Nice visuals'),
(5, 'CUS024', 8, '2025-12-04', N'Entertaining'),
(5, 'CUS025', 9, '2025-12-05', N'Excellent'),
(6, 'CUS026', 7, '2025-11-25', N'Entertaining'),
(6, 'CUS027', 8, '2025-11-26', N'Fun movie'),
(6, 'CUS028', 7, '2025-11-27', N'Good characters'),
(6, 'CUS029', 8, '2025-11-28', N'Enjoyable'),
(6, 'CUS030', 9, '2025-11-29', N'Loved it'),
(7, 'CUS001', 8, '2025-11-28', N'Nice visuals'),
(7, 'CUS002', 9, '2025-11-29', N'Great cast'),
(7, 'CUS003', 8, '2025-11-30', N'Fun to watch'),
(7, 'CUS004', 7, '2025-12-01', N'Good story'),
(7, 'CUS005', 9, '2025-12-02', N'Excellent'),
(10, 'CUS006', 7, '2025-11-18', N'Entertaining'),
(10, 'CUS007', 8, '2025-11-19', N'Good experience'),
(10, 'CUS008', 7, '2025-11-20', N'Nice action'),
(10, 'CUS009', 8, '2025-11-21', N'Enjoyable'),
(10, 'CUS010', 9, '2025-11-22', N'Impressive'),
(11, 'CUS011', 9, '2025-11-30', N'Exciting'),
(11, 'CUS012', 6, '2025-12-01', N'Fine'),
(11, 'CUS013', 8, '2025-12-02', N'Good fight scenes'),
(11, 'CUS014', 7, '2025-12-03', N'Nice storyline'),
(11, 'CUS015', 8, '2025-12-04', N'Enjoyable'),
(12, 'CUS016', 7, '2025-11-17', N'Enjoyable'),
(12, 'CUS017', 8, '2025-11-18', N'Good watch'),
(12, 'CUS018', 7, '2025-11-19', N'Solid'),
(12, 'CUS019', 8, '2025-11-20', N'Nice experience'),
(12, 'CUS020', 9, '2025-11-21', N'Excellent'),
(14, 'CUS021', 9, '2025-11-28', N'Fantastic'),
(14, 'CUS022', 8, '2025-11-29', N'Worth watching'),
(14, 'CUS023', 7, '2025-11-30', N'Good movie'),
(14, 'CUS024', 8, '2025-12-01', N'Enjoyable'),
(14, 'CUS025', 9, '2025-12-02', N'Amazing'),
(20, 'CUS026', 7, '2025-12-01', N'Solid movie'),
(20, 'CUS027', 8, '2025-12-02', N'Nice'),
(20, 'CUS028', 7, '2025-12-03', N'Good experience'),
(20, 'CUS029', 8, '2025-12-04', N'Pretty good'),
(20, 'CUS030', 9, '2025-12-05', N'Excellent'),
(22, 'CUS001', 9, '2025-11-20', N'Excellent'),
(22, 'CUS002', 8, '2025-11-21', N'Enjoyable'),
(22, 'CUS003', 7, '2025-11-22', N'Good movie'),
(22, 'CUS004', 8, '2025-11-23', N'Solid story'),
(22, 'CUS005', 9, '2025-11-24', N'Amazing');

INSERT INTO Booking.ORDERS 
(OrderID, OrderTime, PaymentMethod, Total, CUserID, EUserID) VALUES
(1, '2025-12-01T08:15:00', 'Cash',        5, 'CUS001', 'EMP006'),
(2, '2025-12-01T08:20:00', 'Momo',       7, 'CUS002', 'EMP007'),
(3, '2025-12-02T11:05:00', 'ZaloPay',    6, 'CUS003', 'EMP008'),
(4, '2025-12-02T12:40:00', 'Visa',       9, 'CUS004', 'EMP009'),
(5, '2025-12-02T13:25:00', 'Mastercard', 8, 'CUS005', 'EMP010'),
(6, '2025-12-03T09:10:00', 'Cash',       4, 'CUS006', 'EMP006'),
(7, '2025-12-03T10:20:00', 'Momo',       9, 'CUS007', 'EMP007'),
(8, '2025-12-03T10:45:00', 'ZaloPay',    3, 'CUS008', 'EMP008'),
(9, '2025-12-03T11:10:00', 'Visa',       5, 'CUS009', 'EMP009'),
(10,'2025-12-03T11:55:00', 'Mastercard', 6, 'CUS010', 'EMP010'),
(11,'2025-12-04T12:20:00', 'Cash',       4, 'CUS011', 'EMP006'),
(12,'2025-12-04T12:50:00', 'Momo',       7, 'CUS012', 'EMP007'),
(13,'2025-12-04T13:30:00', 'ZaloPay',    8, 'CUS013', 'EMP008'),
(14,'2025-12-04T14:10:00', 'Visa',       5, 'CUS014', 'EMP009'),
(15,'2025-12-04T15:00:00', 'Mastercard', 6, 'CUS015', 'EMP010'),
(16,'2025-12-05T09:15:00', 'Cash',       7, 'CUS016', 'EMP006'),
(17,'2025-12-05T10:45:00', 'Momo',       3, 'CUS017', 'EMP007'),
(18,'2025-12-05T11:30:00', 'ZaloPay',    6, 'CUS018', 'EMP008'),
(19,'2025-12-05T12:50:00', 'Visa',       4, 'CUS019', 'EMP009'),
(20,'2025-12-05T13:25:00', 'Mastercard', 9, 'CUS020', 'EMP010'),
(21,'2025-12-06T14:40:00', 'Cash',       5, 'CUS021', 'EMP011'),
(22,'2025-12-06T15:10:00', 'Momo',       6, 'CUS022', 'EMP014'),
(23,'2025-12-06T16:00:00', 'ZaloPay',    7, 'CUS023', 'EMP018'),
(24,'2025-12-06T16:55:00', 'Visa',       4, 'CUS024', 'EMP022'),
(25,'2025-12-06T17:40:00', 'Mastercard', 9, 'CUS025', 'EMP026'),
(26,'2025-12-07T09:45:00', 'Cash',       5, 'CUS026', 'EMP006'),
(27,'2025-12-07T10:55:00', 'Momo',       7, 'CUS027', 'EMP007'),
(28,'2025-12-08T12:15:00', 'ZaloPay',    6, 'CUS028', 'EMP008'),
(29,'2025-12-08T13:30:00', 'Visa',       8, 'CUS029', 'EMP009'),
(30,'2025-12-09T14:50:00', 'Mastercard', 9, 'CUS030', 'EMP010');

INSERT INTO Booking.COUPON (CouponID, StartDate, EndDate, SaleOff, ReleaseNum, AvailNum) VALUES
(1, '2025-01-01', '2025-02-01', 10, 1000, 800),
(2, '2025-02-01', '2025-03-01', 15, 500, 200),
(3, '2025-03-10', '2025-04-10', 20, 300, 150),
(4, '2025-04-01', '2025-04-30', 25, 200, 50),
(5, '2025-05-01', '2025-05-31', 30, 100, 25),
(6, '2025-06-10', '2025-07-10', 35, 500, 400),
(7, '2025-07-15', '2025-08-15', 40, 150, 120),
(8, '2025-08-01', '2025-08-20', 50, 80, 40),
(9, '2025-09-01', '2025-09-30', 5, 2000, 1990),
(10,'2025-10-01', '2025-12-31', 12, 100, 90);

INSERT INTO Booking.OWN (CUserID, CouponID, isUsed) VALUES
('CUS001', 1, 0), ('CUS001', 2, 1),
('CUS002', 1, 1), ('CUS002', 3, 0),
('CUS003', 2, 0), ('CUS003', 4, 1),
('CUS004', 3, 1), ('CUS004', 5, 0),
('CUS005', 4, 1), ('CUS005', 6, 0),
('CUS006', 5, 0), ('CUS006', 7, 1),
('CUS007', 6, 1), ('CUS007', 8, 0),
('CUS008', 7, 0), ('CUS008', 9, 1),
('CUS009', 8, 1), ('CUS009', 10, 0),
('CUS010', 1, 0), ('CUS010', 4, 0),
('CUS011', 2, 1), ('CUS011', 5, 1),
('CUS012', 3, 0), ('CUS012', 6, 1),
('CUS013', 4, 0), ('CUS013', 7, 0),
('CUS014', 5, 1), ('CUS014', 8, 0),
('CUS015', 6, 0), ('CUS015', 9, 1),
('CUS016', 7, 1), ('CUS016', 10, 0),
('CUS017', 1, 1), ('CUS017', 6, 0),
('CUS018', 2, 0), ('CUS018', 7, 1),
('CUS019', 3, 1), ('CUS019', 8, 0),
('CUS020', 4, 0), ('CUS020', 9, 1),
('CUS021', 5, 1), ('CUS021', 10, 1),
('CUS022', 1, 0), ('CUS022', 7, 0),
('CUS023', 2, 1), ('CUS023', 8, 1),
('CUS024', 3, 1), ('CUS024', 9, 0),
('CUS025', 4, 1), ('CUS025', 10, 0),
('CUS026', 5, 0), ('CUS026', 8, 1),
('CUS027', 6, 1), ('CUS027', 9, 0),
('CUS028', 7, 0), ('CUS028', 10, 1),
('CUS029', 8, 1), ('CUS029', 9, 0),
('CUS030', 9, 1), ('CUS030', 10, 0);

INSERT INTO Booking.COUPONUSAGE (CouponID, OrderID, CUserID, UseDate) VALUES
(2, 1, 'CUS001', '2025-12-01'),
(1, 2, 'CUS002', '2025-12-01'),
(4, 3, 'CUS003', '2025-12-02'),
(3, 4, 'CUS004', '2025-12-02'),
(4, 5, 'CUS005', '2025-12-02'),
(7, 6, 'CUS006', '2025-12-03'),
(6, 7, 'CUS007', '2025-12-03'),
(9, 8, 'CUS008', '2025-12-03'),
(8, 9, 'CUS009', '2025-12-03'),
(2,10, 'CUS011', '2025-12-04'),
(5,11, 'CUS011', '2025-12-04'),
(6,12, 'CUS012', '2025-12-04'),
(5,13, 'CUS014', '2025-12-04');

INSERT INTO Screening.TIME (TimeID, Day, StartTime, EndTime, FName, MovieID, RoomID, BranchID) VALUES
(1, '2025-12-07', '07:00', '09:30', 'Standard', 28, 1, 1),
(2, '2025-12-07', '09:30', '12:00', 'IMAX', 1, 2, 1),
(3, '2025-12-07', '12:00', '14:30', '4DX', 9, 3, 1),
(4, '2025-12-07', '14:30', '17:00', 'Standard', 29, 1, 1),
(5, '2025-12-07', '17:00', '19:30', 'IMAX', 10, 2, 1),
(6, '2025-12-07', '19:30', '22:00', '4DX', 4, 3, 1),
(7, '2025-12-07', '22:00', '00:30', 'Standard', 27, 1, 1),
(8, '2025-12-07', '07:00', '09:30', 'Standard', 30, 1, 2),
(9, '2025-12-07', '09:30', '12:00', 'IMAX', 26, 2, 2),
(10, '2025-12-07', '12:00', '14:30', 'Standard', 13, 3, 2),
(11, '2025-12-07', '14:30', '17:00', 'Standard', 25, 1, 2),
(12, '2025-12-07', '17:00', '19:30', 'IMAX', 2, 2, 2),
(13, '2025-12-07', '19:30', '22:00', 'Standard', 21, 3, 2),
(14, '2025-12-07', '22:00', '00:30', 'Standard', 14, 1, 2),
(15, '2025-12-07', '07:00', '09:30', '4DX', 17, 1, 3),
(16, '2025-12-07', '09:30', '12:00', 'Standard', 19, 2, 3),
(17, '2025-12-07', '12:00', '14:30', 'IMAX', 3, 3, 3),
(18, '2025-12-07', '14:30', '17:00', 'Standard', 6, 1, 3),
(19, '2025-12-07', '17:00', '19:30', 'Standard', 11, 2, 3),
(20, '2025-12-07', '19:30', '22:00', 'IMAX', 16, 3, 3),
(21, '2025-12-07', '22:00', '00:30', 'Standard', 24, 1, 3),
(22, '2025-12-07', '07:00', '09:30', 'Standard', 8, 1, 4),
(23, '2025-12-07', '09:30', '12:00', '4DX', 23, 2, 4),
(24, '2025-12-07', '12:00', '14:30', 'IMAX', 7, 3, 4),
(25, '2025-12-07', '14:30', '17:00', 'Standard', 15, 1, 4),
(26, '2025-12-07', '17:00', '19:30', '4DX', 20, 2, 4),
(27, '2025-12-07', '19:30', '22:00', 'IMAX', 26, 3, 4),
(28, '2025-12-07', '22:00', '00:30', 'Standard', 18, 1, 4),
(29, '2025-12-07', '07:00', '09:30', 'Standard', 29, 1, 5),
(30, '2025-12-07', '09:30', '12:00', 'Standard', 12, 2, 5),
(31, '2025-12-07', '12:00', '14:30', '4DX', 9, 3, 5),
(32, '2025-12-07', '14:30', '17:00', 'Standard', 19, 1, 5),
(33, '2025-12-07', '17:00', '19:30', 'Standard', 21, 2, 5),
(34, '2025-12-07', '19:30', '22:00', '4DX', 23, 3, 5),
(35, '2025-12-07', '22:00', '00:30', 'Standard', 13, 1, 5),
(36, '2025-12-08', '07:00', '09:30', 'Standard', 28, 1, 1),
(37, '2025-12-08', '09:30', '12:00', 'IMAX', 1, 2, 1),
(38, '2025-12-08', '12:00', '14:30', '4DX', 9, 3, 1),
(39, '2025-12-08', '14:30', '17:00', 'Standard', 29, 1, 1),
(40, '2025-12-08', '17:00', '19:30', 'IMAX', 10, 2, 1),
(41, '2025-12-08', '19:30', '22:00', '4DX', 4, 3, 1),
(42, '2025-12-08', '22:00', '00:30', 'Standard', 27, 1, 1),
(43, '2025-12-08', '07:00', '09:30', 'Standard', 30, 1, 2),
(44, '2025-12-08', '09:30', '12:00', 'IMAX', 26, 2, 2),
(45, '2025-12-08', '12:00', '14:30', 'Standard', 13, 3, 2),
(46, '2025-12-08', '14:30', '17:00', 'Standard', 25, 1, 2),
(47, '2025-12-08', '17:00', '19:30', 'IMAX', 2, 2, 2),
(48, '2025-12-08', '19:30', '22:00', 'Standard', 21, 3, 2),
(49, '2025-12-08', '22:00', '00:30', 'Standard', 14, 1, 2),
(50, '2025-12-08', '07:00', '09:30', '4DX', 17, 1, 3),
(51, '2025-12-08', '09:30', '12:00', 'Standard', 19, 2, 3),
(52, '2025-12-08', '12:00', '14:30', 'IMAX', 3, 3, 3),
(53, '2025-12-08', '14:30', '17:00', 'Standard', 6, 1, 3),
(54, '2025-12-08', '17:00', '19:30', 'Standard', 11, 2, 3),
(55, '2025-12-08', '19:00', '22:00', 'IMAX', 16, 3, 3),
(56, '2025-12-08', '22:00', '00:30', 'Standard', 24, 1, 3),
(57, '2025-12-08', '07:00', '09:30', 'Standard', 8, 1, 4),
(58, '2025-12-08', '09:30', '12:00', '4DX', 23, 2, 4),
(59, '2025-12-08', '12:00', '14:30', 'IMAX', 7, 3, 4),
(60, '2025-12-08', '14:30', '17:00', 'Standard', 15, 1, 4),
(61, '2025-12-08', '17:00', '19:30', '4DX', 20, 2, 4),
(62, '2025-12-08', '19:30', '22:00', 'IMAX', 26, 3, 4),
(63, '2025-12-08', '22:00', '00:30', 'Standard', 18, 1, 4),
(64, '2025-12-08', '07:00', '09:30', 'Standard', 29, 1, 5),
(65, '2025-12-08', '09:30', '12:00', 'Standard', 12, 2, 5),
(66, '2025-12-08', '12:00', '14:30', '4DX', 9, 3, 5),
(67, '2025-12-08', '14:30', '17:00', 'Standard', 19, 1, 5),
(68, '2025-12-08', '17:00', '19:30', 'Standard', 21, 2, 5),
(69, '2025-12-08', '19:30', '22:00', '4DX', 23, 3, 5),
(70, '2025-12-08', '22:00', '00:30', 'Standard', 13, 1, 5),
(71, '2025-12-09', '07:00', '09:30', 'Standard', 28, 1, 1),
(72, '2025-12-09', '09:30', '12:00', 'IMAX', 1, 2, 1),
(73, '2025-12-09', '12:00', '14:30', '4DX', 9, 3, 1),
(74, '2025-12-09', '14:30', '17:00', 'Standard', 29, 1, 1),
(75, '2025-12-09', '17:00', '19:30', 'IMAX', 10, 2, 1),
(76, '2025-12-09', '19:30', '22:00', '4DX', 4, 3, 1),
(77, '2025-12-09', '22:00', '00:30', 'Standard', 27, 1, 1),
(78, '2025-12-09', '07:00', '09:30', 'Standard', 30, 1, 2),
(79, '2025-12-09', '09:30', '12:00', 'IMAX', 26, 2, 2),
(80, '2025-12-09', '12:00', '14:30', 'Standard', 13, 3, 2),
(81, '2025-12-09', '14:30', '17:00', 'Standard', 25, 1, 2),
(82, '2025-12-09', '17:00', '19:30', 'IMAX', 2, 2, 2),
(83, '2025-12-09', '19:30', '22:00', 'Standard', 21, 3, 2),
(84, '2025-12-09', '22:00', '00:30', 'Standard', 14, 1, 2);

-- script sinh vé
BEGIN

SET NOCOUNT ON;

WITH TimeList AS (
    SELECT 
        t.TimeID, t.Day, t.BranchID, t.RoomID, s.RCapacity
    FROM Screening.TIME t
    JOIN Cinema.SCREENROOM s 
        ON t.BranchID = s.BranchID 
       AND t.RoomID = s.RoomID
    WHERE t.Day BETWEEN '2025-12-07' AND '2025-12-09'
), SeatPick AS (
    SELECT 
        tl.TimeID, tl.Day, tl.BranchID, tl.RoomID, tl.RCapacity,
        s.SRow, s.SColumn,
        ROW_NUMBER() OVER (
            PARTITION BY tl.TimeID 
            ORDER BY NEWID()
        ) AS rn
    FROM TimeList tl
    JOIN Cinema.SEAT s 
        ON s.BranchID = tl.BranchID 
       AND s.RoomID = tl.RoomID
       AND s.SStatus = 1
), Selected AS (
    SELECT 
        sp.TimeID, sp.Day, sp.BranchID, sp.RoomID,
        sp.SRow, sp.SColumn, sp.RCapacity
    FROM SeatPick sp
    WHERE sp.rn <= FLOOR(sp.RCapacity / 2.0)
), Assigned AS (
    SELECT 
        ROW_NUMBER() OVER (
            ORDER BY s.TimeID, s.BranchID, s.RoomID, s.SRow, s.SColumn
        ) AS TicketID,
        COALESCE(
            CAST(o1.OrderTime AS DATE),
            CAST(o2.OrderTime AS DATE)
        ) AS DaySold,
        s.TimeID,
        COALESCE(o1.OrderID, o2.OrderID) AS OrderID,
        s.BranchID,
        s.RoomID,
        CASE 
            WHEN s.SColumn >= 8 
                THEN CAST(4.00 AS DECIMAL(10,2))
                ELSE CAST(2.00 AS DECIMAL(10,2))
        END AS TPrice,
        s.SRow,
        s.SColumn
    FROM Selected s
    OUTER APPLY (
        SELECT TOP (1) o.OrderID, o.OrderTime
        FROM Booking.ORDERS o
        WHERE CAST(o.OrderTime AS DATE) = s.Day
        ORDER BY NEWID()
    ) o1
    OUTER APPLY (
        SELECT TOP (1) o.OrderID, o.OrderTime 
        FROM Booking.ORDERS o
        ORDER BY NEWID()
    ) o2
)
INSERT INTO Screening.TICKETS
        (TicketID, DaySold, TimeID, OrderID, BranchID, RoomID, TPrice, SRow, SColumn)
SELECT  TicketID, DaySold, TimeID, OrderID, BranchID, RoomID, TPrice, SRow, SColumn
FROM Assigned;
END;

INSERT INTO Products.ADDONITEM (ProductID, Price, ItemType, OrderID) VALUES
(1,  2, 'Food', 1),
(2,  2, 'Drink', 1),
(3,  2, 'Food', 2),
(4,  2, 'Drink', 2),
(5,  3, 'Food', 3),
(6,  2, 'Drink', 3),
(7,  3, 'Food', 4),
(8,  2, 'Drink', 4),
(9,  2, 'Food', 5),
(10, 2, 'Drink', 5),
(11, 3, 'Merchandise', 6),
(12, 2, 'Merchandise', 6),
(13, 3, 'Merchandise', 7),
(14, 2, 'Merchandise', 7),
(15, 3, 'Merchandise', 8),
(16, 2, 'Merchandise', 8),
(17, 3, 'Merchandise', 9),
(18, 2, 'Merchandise', 9),
(19, 2, 'Merchandise', 10),
(20, 2, 'Merchandise', 10);

INSERT INTO Products.FOODDRINK (ProductID, PType, PName, Quantity) VALUES
(1, 'Popcorn', 'Caramel Popcorn', 100),
(2, 'Soda', 'Coca Cola', 150),
(3, 'Popcorn', 'Butter Popcorn', 120),
(4, 'Juice', 'Orange Juice', 100),
(5, 'Popcorn', 'Cheese Popcorn', 110),
(6, 'Soda', 'Pepsi', 130),
(7, 'Snack', 'Nachos', 80),
(8, 'Drink', 'Lemon Tea', 90),
(9, 'Popcorn', 'Caramel Popcorn', 100),
(10, 'Soda', 'Sprite', 120);

INSERT INTO Products.MERCHANDISE (ProductID, AvailNum, MerchName, StartDate, EndDate) VALUES
(11, 50, 'Movie Poster', '2025-12-01', '2026-01-31'),
(12, 30, 'Keychain', '2025-12-05', '2026-02-28'),
(13, 20, 'T-shirt', '2025-12-10', '2026-03-31'),
(14, 15, 'Cap', '2025-12-12', '2026-03-15'),
(15, 40, 'Mug', '2025-12-15', '2026-04-30'),
(16, 25, 'Sticker', '2025-12-20', '2026-05-31'),
(17, 35, 'Notebook', '2025-12-22', '2026-06-30'),
(18, 20, 'Bag', '2025-12-25', '2026-07-31'),
(19, 30, 'Figure', '2025-12-28', '2026-08-31'),
(20, 15, 'Calendar', '2025-12-30', '2026-09-30');
GO


-----------------------------------------------------------
-- PHẦN 4: PROGRAMMABILITY (Procedures, Functions, Triggers)
-----------------------------------------------------------

-- Function 1: Tính tổng chi tiêu
CREATE OR ALTER FUNCTION dbo.func_CalculateTotalSpent (@CUserID VARCHAR(20)) 
RETURNS DECIMAL(10, 2)
AS
BEGIN
    DECLARE @TotalSpent DECIMAL(10, 2);
    SELECT @TotalSpent = SUM(Total) FROM Booking.ORDERS WHERE CUserID = @CUserID;
    RETURN ISNULL(@TotalSpent, 0);
END
GO

-- Function 2: Lấy phim theo thể loại
CREATE OR ALTER FUNCTION Movie.func_GetMoviesByGenre (@GenreInput NVARCHAR(30))
RETURNS TABLE
AS
RETURN (
    SELECT m.MName, m.RunTime, m.AgeRating, m.releaseDate
    FROM Movie.MOVIE m JOIN Movie.MOVIEGENRE mg ON m.MovieID = mg.MovieID
    WHERE mg.Genre = @GenreInput
)
GO

--Function 3: Tính Rating trung bình của 1 phim
CREATE FUNCTION Movie.fn_AvgRating (@MovieID INT)
RETURNS DECIMAL(3,1)
AS
BEGIN
    DECLARE @AvgRating DECIMAL(3,1);

    -- Tính trung bình rating
    SELECT @AvgRating = AVG(CAST(Rating AS DECIMAL(3,1)))
    FROM Movie.REVIEW
    WHERE MovieID = @MovieID;

    -- Nếu không có review, trả về NULL hoặc 0
    RETURN @AvgRating;
END;
GO

--Procedure 1. INSERT(Thêm phim mới)
IF OBJECT_ID('Movie.sp_InsertNewMovie', 'P') IS NOT NULL
    DROP PROCEDURE Movie.sp_InsertNewMovie;
GO

CREATE PROCEDURE Movie.sp_InsertNewMovie
    @name VARCHAR(255),
    @descript NVARCHAR(MAX),
    @runtime TINYINT,
    @dub BIT,
    @sub BIT,
    @release DATE,
    @closing DATE,
    @agerating VARCHAR(30),
    @posterURL VARCHAR(MAX) = NULL,
    @Genres NVARCHAR(MAX) -- danh sách genres, format: 'Action,Sci-Fi'
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate date
    IF @release >= @closing
        THROW 50001, 'Release date must be earlier than closing date.', 1;

    IF @release < CAST(GETDATE() AS DATE)
        THROW 50002, 'Release date cannot be in the past.', 1;

    -----------------------------------------
    -- 🔥 Tự sinh MovieID = MAX(MovieID) + 1
    -----------------------------------------
    DECLARE @NewMovieID INT;

    SELECT @NewMovieID = ISNULL(MAX(MovieID), 0) + 1
    FROM Movie.MOVIE;

    -----------------------------------------
    -- Insert vào Movie
    -----------------------------------------
    INSERT INTO Movie.MOVIE (MovieID, MName, Descript, RunTime, isDub, isSub, releaseDate, closingDate, AgeRating, posterURL)
    VALUES (@NewMovieID, @name, @descript, @runtime, @dub, @sub, @release, @closing, @agerating, @posterURL);

    -----------------------------------------
    -- Insert Genres
    -----------------------------------------
    DECLARE @Genre NVARCHAR(255);
    DECLARE @Pos INT = 1;
    DECLARE @NextPos INT;
    DECLARE @Len INT = LEN(@Genres);

    WHILE @Pos <= @Len
    BEGIN
        SET @NextPos = CHARINDEX(',', @Genres, @Pos);
        IF @NextPos = 0 SET @NextPos = @Len + 1;

        SET @Genre = LTRIM(RTRIM(SUBSTRING(@Genres, @Pos, @NextPos - @Pos)));

        IF LEN(@Genre) > 0
            INSERT INTO Movie.MovieGenre (MovieID, Genre)
            VALUES (@NewMovieID, @Genre);

        SET @Pos = @NextPos + 1;
    END
END;
GO

EXEC Movie.sp_InsertNewMovie  
    @name = 'Doraemon', 
    @descript = 'Animation', 
    @runtime = 100, 
    @dub = 0, 
    @sub = 0, 
    @release = '2025-12-10', 
    @closing = '2026-01-10', 
    @agerating = 'K', 
    @Genres = 'Action, Drama';
GO

--Procedure 2. UPDATE (Kéo dài thời gian công chiếu)
-- Kiểm tra nếu SP đã tồn tại thì xóa
IF OBJECT_ID('Movie.sp_UpdateMovie', 'P') IS NOT NULL
    DROP PROCEDURE Movie.sp_UpdateMovie;
GO

-- Tạo SP mới
CREATE PROCEDURE Movie.sp_UpdateMovie
    @id INT,
    @name VARCHAR(255),
    @descript NVARCHAR(MAX),
    @runtime TINYINT,
    @dub BIT,
    @sub BIT,
    @release DATE,
    @closing DATE,
    @agerating VARCHAR(30),
    @posterURL VARCHAR(MAX) = NULL,
    @Genres NVARCHAR(MAX) -- Danh sách genres, phân tách bằng dấu phẩy
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra tồn tại movie
    IF NOT EXISTS (SELECT 1 FROM Movie.MOVIE WHERE MovieID = @id)
    BEGIN
        THROW 50001, 'Movie does not exist.', 1;
    END

    -- Update thông tin cơ bản
    UPDATE Movie.MOVIE
    SET 
        MName = @name,
        Descript = @descript,
        RunTime = @runtime,
        isDub = @dub,
        isSub = @sub,
        releaseDate = @release,
        closingDate = @closing,
        AgeRating = @agerating,
        posterURL = @posterURL
    WHERE MovieID = @id;

    -- Xóa các genres cũ
    DELETE FROM Movie.MOVIEGENRE WHERE MovieID = @id;

    -- Thêm genres mới (nếu có)
    IF @Genres IS NOT NULL AND LTRIM(RTRIM(@Genres)) <> ''
    BEGIN
        DECLARE @xml XML = CAST('<i>' + REPLACE(@Genres, ',', '</i><i>') + '</i>' AS XML);

        INSERT INTO Movie.MOVIEGENRE (MovieID, Genre)
        SELECT @id, x.value('.', 'NVARCHAR(30)')
        FROM @xml.nodes('/i') AS T(x)
        WHERE EXISTS (SELECT 1 FROM Movie.GENRE WHERE Genre = x.value('.', 'NVARCHAR(30)'));
    END
END;
GO

EXEC Movie.sp_UpdateMovie
    @id = 31,
    @name = 'Doraemon Updated',
    @descript = 'Animation movie updated description',
    @runtime = 105,
    @dub = 1,
    @sub = 0,
    @release = '2025-12-10',
    @closing = '2026-01-15',
    @agerating = 'K',
    @Genres = 'Action, Drama';
GO
--Procedure 3. DELETE
--Có thể xóa phim nếu đã qua thời gian công chiếu
--Không thể xóa phim nếu đang nằm trong thời gian công chiếu
CREATE OR ALTER PROCEDURE deleteMovie(
	@id AS INT
)
AS
BEGIN
	-- Kiểm tra phim tồn tại
	IF NOT EXISTS (SELECT 1 FROM Movie.MOVIE WHERE MovieID = @id)
		THROW 50001, 'Movie does not exist.', 1;

	-- Kiểm tra phim đang chiếu
	IF EXISTS (
		SELECT 1
		FROM Movie.MOVIE
		WHERE MovieID = @id AND closingDate >= CAST(GETDATE() AS DATE)
	)
		THROW 50002, 'Movies that are currently showing cannot be deleted.', 1;

    -- Xóa các bảng phụ thuộc
    DELETE FROM Movie.MOVIEGENRE WHERE MovieID = @id;
    DELETE FROM Movie.FEATURES  WHERE MovieID = @id;
    DELETE FROM Movie.REVIEW    WHERE MovieID = @id;
    DELETE FROM Movie.MOVIEFORMAT WHERE MovieID = @id;
    -- Lấy danh sách TimeID liên quan
    DECLARE @TimeIDs TABLE (TimeID INT);
    INSERT INTO @TimeIDs(TimeID)
    SELECT TimeID
    FROM Screening.TIME
    WHERE MovieID = @id;

    -- Xóa vé liên quan
    DELETE FROM Screening.TICKETS
    WHERE TimeID IN (SELECT TimeID FROM @TimeIDs);

    -- Xóa lịch chiếu
    DELETE FROM Screening.TIME
    WHERE MovieID = @id;

    -- Xóa movie
    DELETE FROM Movie.MOVIE
    WHERE MovieID = @id;
END;
GO

-- Test
EXEC deleteMovie 26;


--Procedure 4. Danh sách và số lượng nhân viên trong 1 chi nhánh
IF OBJECT_ID('empList', 'P') IS NOT NULL
    DROP PROCEDURE empList;
GO

CREATE OR ALTER PROCEDURE empList(
    @id AS INT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT e.EUserID, e.EName, e.Sex, e.Salary, e.UserType, b.BName
    FROM Staff.EMPLOYEE AS e
    JOIN Cinema.BRANCH AS b
        ON e.BranchID = b.BranchID
    WHERE e.BranchID = @id
    ORDER BY e.EName;

	SELECT COUNT(*) AS TotalEmployees
	FROM Staff.EMPLOYEE
	WHERE BranchID = @id;
END;
GO

EXEC empList 1;

--Procedure 5. Danh sách phim lọc theo rating và lượng review
IF OBJECT_ID('movieList', 'P') IS NOT NULL
    DROP PROCEDURE movieList;
GO

CREATE OR ALTER PROCEDURE movieList(
    @minReview AS INT = 0,
    @minRating AS DECIMAL(4, 2) = 0
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        m.MovieID,
        m.MName,
        COUNT(r.CUserID) AS ReviewCount,
        ISNULL(AVG(CAST(r.Rating AS DECIMAL(4,2))), 0) AS AvgRating
    FROM Movie.MOVIE AS m
    LEFT JOIN Movie.REVIEW AS r
        ON m.MovieID = r.MovieID
    WHERE m.releaseDate <= GETDATE()
    GROUP BY m.MovieID, m.MName
    HAVING 
        COUNT(r.CUserID) >= @minReview
        AND ISNULL(AVG(CAST(r.Rating AS DECIMAL(4,2))), 0) >= @minRating
    ORDER BY AvgRating DESC, ReviewCount DESC;
END;
GO

EXEC movieList 1, 8;
GO
-- Procedure 6: Thêm Nhân viên mới (Dùng cho API Create Employee)
-- (Sử dụng số thứ tự tiếp theo sau Procedure 5: movieList)
CREATE OR ALTER PROCEDURE Staff.sp_InsertEmployee
    @EName AS VARCHAR(30),
    @Sex AS CHAR,
    @PhoneNumber AS VARCHAR(15),
    @Email AS VARCHAR(30),
    @EPassword AS VARCHAR(20),
    @Salary AS DECIMAL(10, 2),
    @UserType AS NVARCHAR(15), -- 'manager' hoặc 'staff'
    @ManageID AS VARCHAR(20) = NULL,
    @BranchID AS INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra chi nhánh tồn tại
    IF NOT EXISTS (SELECT 1 FROM Cinema.BRANCH WHERE BranchID = @BranchID)
    BEGIN
        RAISERROR('Branch does not exist.', 16, 1);
        RETURN;
    END
    
    -- Kiểm tra Email duy nhất (Nếu email đã tồn tại)
    IF EXISTS (SELECT 1 FROM Staff.EMPLOYEE WHERE Email = @Email)
    BEGIN
        RAISERROR('Employee with this email already exists.', 16, 1);
        RETURN;
    END

    -- Sử dụng DEFAULT để tự sinh EUserID
    INSERT INTO Staff.EMPLOYEE (EName, Sex, PhoneNumber, Email, EPassword, Salary, UserType, ManageID, BranchID)
    VALUES (@EName, @Sex, @PhoneNumber, @Email, @EPassword, @Salary, @UserType, @ManageID, @BranchID);
    
    -- Trả về ID đã tự sinh (Tùy chọn)
    SELECT EUserID FROM Staff.EMPLOYEE WHERE Email = @Email;

END
GO
-- Procedure 7: Cập nhật thông tin Nhân viên (Dùng cho API Update Employee)
CREATE OR ALTER PROCEDURE Staff.sp_UpdateEmployee
    @EUserID AS VARCHAR(20),
    @EName AS VARCHAR(30),
    @PhoneNumber AS VARCHAR(15),
    @Salary AS DECIMAL(10, 2),
    @UserType AS NVARCHAR(15),
    @BranchID AS INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nhân viên tồn tại
    IF NOT EXISTS (SELECT 1 FROM Staff.EMPLOYEE WHERE EUserID = @EUserID)
    BEGIN
        RAISERROR('Employee ID does not exist.', 16, 1);
        RETURN;
    END

    -- Thực hiện Update
    UPDATE Staff.EMPLOYEE
    SET
        EName = @EName,
        PhoneNumber = @PhoneNumber,
        Salary = @Salary,
        UserType = @UserType,
        BranchID = @BranchID
    WHERE EUserID = @EUserID;

END
GO
-- Procedure 8: Xóa Nhân viên (Dùng cho API Delete Employee)
CREATE OR ALTER PROCEDURE Staff.sp_DeleteEmployee
    @EUserID AS VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nhân viên tồn tại
    IF NOT EXISTS (SELECT 1 FROM Staff.EMPLOYEE WHERE EUserID = @EUserID)
    BEGIN
        RAISERROR('Employee ID does not exist.', 16, 1);
        RETURN;
    END

    -- Kiểm tra nếu nhân viên đang quản lý người khác (ManageID)
    IF EXISTS (SELECT 1 FROM Staff.EMPLOYEE WHERE ManageID = @EUserID)
    BEGIN
        RAISERROR('Cannot delete employee who currently manages other employees.', 16, 1);
        RETURN;
    END
    
    -- Xóa các bản ghi liên quan (WorkShift)
    DELETE FROM Staff.WORK WHERE EUserID = @EUserID;
    
    -- Cập nhật ORDERS sang NULL (Nếu cần, tùy thuộc vào khóa ngoại)
    UPDATE Booking.ORDERS SET EUserID = NULL WHERE EUserID = @EUserID;

    -- Xóa nhân viên chính
    DELETE FROM Staff.EMPLOYEE WHERE EUserID = @EUserID;

END
GO
-- Thêm SP này vào file SQL của bạn (hoặc chạy riêng nếu DB đã tạo)
CREATE OR ALTER PROCEDURE sp_GetWeeklyRevenueAndGrowth
    @BranchID AS INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Định nghĩa ngày bắt đầu và kết thúc của TUẦN HIỆN TẠI (T2 -> CN)
    DECLARE @StartOfWeek DATE = DATEADD(wk, DATEDIFF(wk, 0, GETDATE()), 0); 
    DECLARE @EndOfWeek DATE = DATEADD(wk, DATEDIFF(wk, 0, GETDATE()), 6);
    
    -- Định nghĩa ngày bắt đầu và kết thúc của TUẦN TRƯỚC
    DECLARE @PrevStartOfWeek DATE = DATEADD(wk, -1, @StartOfWeek);
    DECLARE @PrevEndOfWeek DATE = DATEADD(wk, -1, @EndOfWeek);

    -- Bảng tạm chứa doanh thu tuần hiện tại
    DECLARE @CurrentWeekRevenue DECIMAL(18, 2);
    
    -- SỬA LỖI: Dùng DaySold từ TICKETS để lọc ngày, sau đó SUM Total từ ORDERS
    SELECT @CurrentWeekRevenue = ISNULL(SUM(O.Total), 0)
    FROM Booking.ORDERS O
    INNER JOIN Screening.TICKETS T ON O.OrderID = T.OrderID
    WHERE T.DaySold BETWEEN @StartOfWeek AND @EndOfWeek AND T.BranchID = @BranchID; -- Lọc theo DaySold (DATE)

    -- Bảng tạm chứa doanh thu tuần trước
    DECLARE @PreviousWeekRevenue DECIMAL(18, 2);
    
    -- SỬA LỖI: Tương tự cho tuần trước
    SELECT @PreviousWeekRevenue = ISNULL(SUM(O.Total), 0)
    FROM Booking.ORDERS O
    INNER JOIN Screening.TICKETS T ON O.OrderID = T.OrderID
    WHERE T.DaySold BETWEEN @PrevStartOfWeek AND @PrevEndOfWeek;

    -- 1. Trả về tổng quan Doanh thu và Tăng trưởng (Giữ nguyên)
    SELECT 
        @CurrentWeekRevenue AS TotalRevenue,
        @PreviousWeekRevenue AS PreviousWeekRevenue,
        CASE
            WHEN @PreviousWeekRevenue = 0 THEN 0 -- Tránh chia cho 0
            ELSE CAST(
                     ((@CurrentWeekRevenue - @PreviousWeekRevenue) * 100) / 
                     CAST(@PreviousWeekRevenue AS DECIMAL(18, 2)) -- Ép kiểu mẫu số sang 18,2 để đảm bảo độ chính xác và tránh overflow
                 AS DECIMAL(10, 2))
        END AS GrowthRate; -- Thêm dấu chấm phẩy

    
    -- 2. Trả về Doanh thu chi tiết theo ngày (cho biểu đồ: Mon, Tue,...)
    SELECT
        DATENAME(dw, T.DaySold) AS DayName,
        DATEPART(dw, T.DaySold) AS DayOrder, -- Dùng để sắp xếp
        ISNULL(SUM(O.Total), 0) AS DailyRevenue
    FROM Booking.ORDERS O
    INNER JOIN Screening.TICKETS T ON O.OrderID = T.OrderID
    WHERE T.DaySold BETWEEN @StartOfWeek AND @EndOfWeek AND T.BranchID = @BranchID
    GROUP BY DATENAME(dw, T.DaySold), DATEPART(dw, T.DaySold)
    ORDER BY DayOrder;

END
GO

-- Procedure Bổ sung: Lấy top N phim theo Rating
GO
CREATE OR ALTER PROCEDURE Movie.sp_GetTopRatedMovies
    @TopN INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);

    SELECT TOP (@TopN)
        M.MovieID,
        M.MName,
        M.RunTime,
        ISNULL(AVG(CAST(R.Rating AS DECIMAL(3, 1))), 0.0) AS AvgRating,
        CASE
            WHEN @Today < M.releaseDate THEN 'Coming Soon'
            WHEN @Today >= M.releaseDate AND @Today <= M.closingDate THEN 'Now Showing'
            ELSE 'Ended'
        END AS Status
    FROM 
        Movie.MOVIE M
    LEFT JOIN 
        Movie.REVIEW R ON M.MovieID = R.MovieID
    GROUP BY 
        M.MovieID, M.MName, M.RunTime, M.releaseDate, M.closingDate
    HAVING
        ISNULL(AVG(CAST(R.Rating AS DECIMAL(3, 1))), 0.0) > 0 -- Chỉ lấy phim đã có rating
    ORDER BY 
        AvgRating DESC, M.releaseDate DESC;
END
GO
-- Procedure Bổ sung: Lấy số liệu Dashboard và số liệu so sánh
GO
CREATE OR ALTER PROCEDURE dbo.sp_GetDashboardStatsWithComparison
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Khai báo biến ngày
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
    DECLARE @Yesterday DATE = DATEADD(day, -1, @Today);
    
    -- Tính toán tuần hiện tại
    DECLARE @StartOfWeek DATE = DATEADD(wk, DATEDIFF(wk, 0, GETDATE()), 0); 
    DECLARE @EndOfWeek DATE = DATEADD(wk, DATEDIFF(wk, 0, GETDATE()), 6);
    
    -- Tính toán tuần trước
    DECLARE @PrevStartOfWeek DATE = DATEADD(wk, -1, @StartOfWeek);
    DECLARE @PrevEndOfWeek DATE = DATEADD(wk, -1, @EndOfWeek);

    -- ==========================================================
    -- 1. FILMS RUNNING (PHIM CÓ LỊCH CHIẾU RƠI VÀO TUẦN)
    -- So sánh Phim có closingDate >= StartOfWeek VÀ releaseDate <= EndOfWeek
    -- ==========================================================
    
    -- Tuần Hiện Tại
    DECLARE @CurrentRunningFilms INT = (
        SELECT COUNT(MovieID) 
        FROM Movie.MOVIE M
        WHERE M.releaseDate <= @EndOfWeek 
          AND M.closingDate >= @StartOfWeek
    );
    
    -- Tuần Trước
    DECLARE @PrevRunningFilms INT = (
        SELECT COUNT(MovieID) 
        FROM Movie.MOVIE M
        WHERE M.releaseDate <= @PrevEndOfWeek 
          AND M.closingDate >= @PrevStartOfWeek
    );
    
    -- ==========================================================
    -- 2. ACTIVE ROOMS (Tạm thời sử dụng tổng số phòng, giả định so sánh -1)
    -- LƯU Ý: Nếu muốn so sánh chính xác, cần bảng lịch sử phòng
    -- ==========================================================
    DECLARE @ActiveRooms INT = (SELECT COUNT(*) FROM Cinema.SCREENROOM);
    DECLARE @PrevActiveRooms INT = @ActiveRooms - 1; -- Giả định tuần trước có ít hơn 1 phòng

    -- ==========================================================
    -- 3. SHOWTIMES (Hôm nay vs Hôm qua)
    -- ==========================================================
    DECLARE @ShowtimesToday INT = (SELECT COUNT(*) FROM Screening.TIME WHERE Day = @Today);
    DECLARE @ShowtimesYesterday INT = (SELECT COUNT(*) FROM Screening.TIME WHERE Day = @Yesterday);

    -- ==========================================================
    -- 4. TICKETS SOLD (Tuần này vs Tuần trước)
    -- ==========================================================
    DECLARE @TicketsSoldCurrentWeek INT = (
        SELECT COUNT(T.TicketID) 
        FROM Screening.TICKETS T 
        WHERE T.DaySold >= @StartOfWeek
    );
    DECLARE @TicketsSoldPrevWeek INT = (
        SELECT COUNT(T.TicketID) 
        FROM Screening.TICKETS T 
        WHERE T.DaySold >= @PrevStartOfWeek AND T.DaySold < @StartOfWeek
    );


    -- TRẢ VỀ KẾT QUẢ (Sử dụng Running Films thay vì TotalMovies)
    SELECT 
        @CurrentRunningFilms AS totalMovies,      -- Phim đang chiếu/sắp chiếu trong tuần này
        @PrevRunningFilms AS prevTotalMovies,    -- Phim chiếu/sắp chiếu trong tuần trước
        
        @ActiveRooms AS activeRooms,
        @PrevActiveRooms AS prevActiveRooms,
        
        @ShowtimesToday AS showtimesToday,
        @ShowtimesYesterday AS prevShowtimesYesterday,
        
        @TicketsSoldCurrentWeek AS ticketsSold,
        @TicketsSoldPrevWeek AS prevTicketsSold;
END
GO
-- Procedure 10: Lấy toàn bộ danh sách Phim, bao gồm Rating, Genres và Status (Dùng cho API GET /api/movies)
CREATE OR ALTER PROCEDURE Movie.sp_GetAllMovies
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);

    SELECT
        M.MovieID,
        M.MName,
        M.Descript,
        M.RunTime,
        M.isDub,
        M.isSub,
        M.releaseDate,
        M.closingDate,
        M.AgeRating,
        M.posterURL,
        -- 1. Tính Rating trung bình
        ISNULL(AVG(CAST(R.Rating AS DECIMAL(3, 1))), 0.0) AS AvgRating,
        -- 2. Gom nhóm thể loại thành một chuỗi (sử dụng STRING_AGG)
        (
            SELECT STRING_AGG(MG.Genre, ', ') 
            FROM Movie.MOVIEGENRE MG 
            WHERE MG.MovieID = M.MovieID
        ) AS GenresList,
        -- 3. Tính toán Status
        CASE
            WHEN @Today < M.releaseDate THEN 'Coming Soon'
            WHEN @Today >= M.releaseDate AND @Today <= M.closingDate THEN 'Now Showing'
            ELSE 'Ended'
        END AS Status
    FROM 
        Movie.MOVIE M
    LEFT JOIN 
        Movie.REVIEW R ON M.MovieID = R.MovieID
    GROUP BY 
        M.MovieID, M.MName, M.Descript, M.RunTime, M.isDub, M.isSub, M.releaseDate, M.closingDate, M.AgeRating,M.posterURL
    ORDER BY 
        M.releaseDate DESC;
END
GO
-- Kiểm tra trước nếu SP đã tồn tại, nếu có thì xóa đi
IF OBJECT_ID('Movie.sp_GetMovieById', 'P') IS NOT NULL
    DROP PROCEDURE Movie.sp_GetMovieById;
GO

-- Tạo SP mới
CREATE PROCEDURE Movie.sp_GetMovieById
    @MovieID INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
    SELECT 
        M.MovieID,
        M.MName,
        M.Descript,
        M.RunTime,
        M.isDub,
        M.isSub,
        M.releaseDate,
        M.closingDate,
        M.AgeRating,
    ISNULL(AVG(CAST(R.Rating AS DECIMAL(3,1))), 0.0) AS AvgRating,
        (SELECT STRING_AGG(MG.Genre, ',') FROM Movie.MOVIEGENRE MG WHERE MG.MovieID = M.MovieID) AS GenresList,
        CASE
            WHEN @Today < M.releaseDate THEN 'Coming Soon'
            WHEN @Today >= M.releaseDate AND @Today <= M.closingDate THEN 'Now Showing'
            ELSE 'Ended'
        END AS Status
    FROM Movie.MOVIE M
    LEFT JOIN Movie.REVIEW R ON M.MovieID = R.MovieID
    WHERE M.MovieID = @MovieID
    GROUP BY M.MovieID, M.MName, M.Descript, M.RunTime, M.isDub, M.isSub, M.releaseDate, M.closingDate, M.AgeRating;
END;
GO
-- Procedure 12: Lấy danh sách phòng chiếu cùng thông tin cơ bản
CREATE OR ALTER PROCEDURE Cinema.sp_GetAllScreenRooms
    @BranchID AS INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        SR.BranchID,
        B.BName AS BranchName, -- Tên chi nhánh
        SR.RoomID,
        SR.RType,
        SR.RCapacity AS TotalCapacity, -- Sức chứa tổng
        -- Tính số hàng (SRow) và số cột (SColumn) lớn nhất
        MAX(S.SRow) AS TotalRows, 
        MAX(S.SColumn) AS MaxColumns
    FROM
        Cinema.SCREENROOM SR
    JOIN
        Cinema.BRANCH B ON SR.BranchID = B.BranchID
    LEFT JOIN
        Cinema.SEAT S ON SR.BranchID = S.BranchID AND SR.RoomID = S.RoomID
    WHERE
        SR.BranchID = @BranchID
    GROUP BY
        SR.BranchID, B.BName, SR.RoomID, SR.RType, SR.RCapacity
    ORDER BY
        SR.BranchID, SR.RoomID;
END
GO
-- Procedure 13: Thêm phòng mới và tạo ma trận ghế ban đầu
CREATE OR ALTER PROCEDURE Cinema.sp_CreateScreenRoomWithSeats
    @BranchID INT,
    @RoomID INT,
    @RType VARCHAR(20),
    @RCapacity SMALLINT,
    @TotalRows SMALLINT,   -- Số hàng ghế (Ví dụ: 10)
    @SeatsPerRow SMALLINT  -- Số ghế mỗi hàng (Ví dụ: 12)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra phòng đã tồn tại
    IF EXISTS (SELECT 1 FROM Cinema.SCREENROOM WHERE BranchID = @BranchID AND RoomID = @RoomID)
    BEGIN
        RAISERROR('Room already exists in this branch.', 16, 1);
        RETURN;
    END

    -- 1. Thêm vào bảng SCREENROOM
    INSERT INTO Cinema.SCREENROOM (BranchID, RoomID, RType, RCapacity)
    VALUES (@BranchID, @RoomID, @RType, @RCapacity);

    -- 2. Tạo ma trận ghế cơ bản (Giả sử tất cả đều là ghế thường, Status=1)
    DECLARE @RowCounter INT = 1;
    DECLARE @ColCounter INT = 1;

    WHILE @RowCounter <= @TotalRows
    BEGIN
        SET @ColCounter = 1;
        WHILE @ColCounter <= @SeatsPerRow
        BEGIN
            INSERT INTO Cinema.SEAT (BranchID, RoomID, SRow, SColumn, SType, SStatus)
            VALUES (@BranchID, @RoomID, @RowCounter, @ColCounter, 0, 1); -- SType=0: Ghế thường
            
            SET @ColCounter = @ColCounter + 1;
        END
        SET @RowCounter = @RowCounter + 1;
    END
END
GO
-- Procedure 14: Xóa phòng và tất cả ghế liên quan
CREATE OR ALTER PROCEDURE Cinema.sp_DeleteScreenRoom
    @BranchID INT,
    @RoomID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra phòng có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Cinema.SCREENROOM WHERE BranchID = @BranchID AND RoomID = @RoomID)
    BEGIN
        RAISERROR('Room does not exist.', 16, 1);
        RETURN;
    END
    
    -- Kiểm tra suất chiếu hiện tại/tương lai
    IF EXISTS (
        SELECT 1 
        FROM Screening.TIME 
        WHERE BranchID = @BranchID AND RoomID = @RoomID AND [Day] >= CAST(GETDATE() AS DATE)
    )
    BEGIN
        RAISERROR('Cannot delete room because it has current or future showtimes.', 16, 1);
        RETURN;
    END
    -- 1. Xóa các ghế liên quan (Phải xóa SEAT trước do khóa ngoại)
    DELETE FROM Cinema.SEAT WHERE BranchID = @BranchID AND RoomID = @RoomID;

    -- 2. Xóa phòng
    DELETE FROM Cinema.SCREENROOM WHERE BranchID = @BranchID AND RoomID = @RoomID;
END
GO
-- Procedure 15: Cập nhật thông tin cơ bản của phòng chiếu

-- TRONG CGV.sql: Thay thế Procedure 15

-- TRONG CGV.sql: Sửa Procedure 15 (Cinema.sp_UpdateRoomAndLayout)

-- TRONG CGV.sql: Sửa Procedure 15 (Cinema.sp_UpdateRoomAndLayout)

CREATE OR ALTER PROCEDURE Cinema.sp_UpdateScreenRoom
    @BranchID INT,
    @RoomID INT,
    @RType VARCHAR(20),
    @RCapacity SMALLINT,
    @TotalRows SMALLINT,
    @SeatsPerRow SMALLINT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra phòng tồn tại
    IF NOT EXISTS (
        SELECT 1 
        FROM Cinema.SCREENROOM 
        WHERE BranchID = @BranchID AND RoomID = @RoomID
    )
    BEGIN
        RAISERROR('Room does not exist in this branch.', 16, 1);
        RETURN;
    END

    -----------------------------------------------------
    -- 2. Kiểm tra phòng đã có vé bán hay chưa
    -----------------------------------------------------
    IF EXISTS (
        SELECT 1 
        FROM Screening.TICKETS t
        WHERE t.BranchID = @BranchID
        AND t.RoomID = @RoomID
    )
    BEGIN
        RAISERROR('Cannot update room because one or more seats already have sold tickets.', 16, 1);
        RETURN;
    END

    -----------------------------------------------------
    -- 3. Cập nhật thông tin phòng
    -----------------------------------------------------
    UPDATE Cinema.SCREENROOM
    SET 
        RType = @RType,
        RCapacity = @RCapacity
    WHERE BranchID = @BranchID AND RoomID = @RoomID;

    -----------------------------------------------------
    -- 4. Tạo lại danh sách ghế
    -----------------------------------------------------
    DELETE FROM Cinema.SEAT
    WHERE BranchID = @BranchID AND RoomID = @RoomID;

    DECLARE @Row INT = 1;
    DECLARE @Col INT;
    DECLARE @Count INT = 0;

    WHILE @Row <= @TotalRows AND @Count < @RCapacity
    BEGIN
        SET @Col = 1;

        WHILE @Col <= @SeatsPerRow AND @Count < @RCapacity
        BEGIN
            INSERT INTO Cinema.SEAT (BranchID, RoomID, SRow, SColumn, SType, SStatus)
            VALUES (@BranchID, @RoomID, @Row, @Col, 0, 1);

            SET @Count += 1;
            SET @Col += 1;
        END

        SET @Row += 1;
    END
END
GO

-- Procedure 17: Lấy ma trận ghế chi tiết của một phòng chiếu
CREATE OR ALTER PROCEDURE Cinema.sp_GetSeatLayout
    @BranchID AS INT, -- THAM SỐ BẮT BUỘC
    @RoomID AS INT
AS
BEGIN
    SET NOCOUNT ON;

    -- ... (Kiểm tra tồn tại phòng) ...

    SELECT
        S.SRow,
        S.SColumn,
        S.SType,
        S.SStatus
    FROM
        Cinema.SEAT S
    WHERE
        S.BranchID = @BranchID AND S.RoomID = @RoomID -- LỌC
    ORDER BY
        S.SRow ASC, S.SColumn ASC;
END
GO
-- Trigger 1: Cộng điểm Membership khi Order
CREATE OR ALTER TRIGGER trg_UpdateMemberPoint
ON Booking.ORDERS
AFTER INSERT
AS
BEGIN
    DECLARE @CUserID VARCHAR(20);
    DECLARE @NewPoints INT;
    DECLARE @TotalMoney DECIMAL(10,2);

    SELECT @CUserID = CUserID, @TotalMoney = Total FROM inserted;
    SET @NewPoints = CAST(@TotalMoney / 10 AS INT);

    UPDATE Customer.MEMBERSHIP SET Point = Point + @NewPoints WHERE CUserID = @CUserID;
    
    -- Cập nhật hạng
    UPDATE Customer.MEMBERSHIP SET MemberRank = CASE 
        WHEN Point >= 1000 THEN 4 
        WHEN Point >= 500 THEN 3 
        WHEN Point >= 200 THEN 2 
        ELSE MemberRank END
    WHERE CUserID = @CUserID;
END
GO
-- Procedure 18: Lấy danh sách suất chiếu theo ngày và chi nhánh
CREATE OR ALTER PROCEDURE Screening.sp_GetAllShowtimes
    @BranchID AS INT,
    @Date AS DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        T.TimeID,
        CONVERT(VARCHAR(10), T.[Day], 23) AS [Day], 
        CONVERT(VARCHAR(5), T.StartTime, 108) AS StartTime, 
        CONVERT(VARCHAR(5), T.EndTime, 108) AS EndTime, 
        
        T.FName AS FormatName,
        M.MName AS MovieName,
        
        -- FIX MỚI: Tính toán thời lượng:
        -- Nếu RunTime > 0, dùng RunTime. 
        -- Nếu RunTime là NULL/0, tính chênh lệch giữa EndTime và StartTime.
        ISNULL(M.RunTime, 
               DATEDIFF(MINUTE, 
                        CAST(T.StartTime AS DATETIME), 
                        CAST(T.EndTime AS DATETIME))
              ) AS RunTimeMin, -- Đổi tên thành RunTime
        
        SR.RoomID,
        SR.RType AS RoomType,
        SR.RCapacity AS TotalSeats,
        
        -- Tính số vé đã bán
        ISNULL(SUM(CASE WHEN TKT.TicketID IS NOT NULL THEN 1 ELSE 0 END), 0) AS TicketsSold
        , 12 AS Price -- Giá hardcode
    FROM
        Screening.TIME T
    JOIN
        Movie.MOVIE M ON T.MovieID = M.MovieID
    JOIN
        Cinema.SCREENROOM SR ON T.BranchID = SR.BranchID AND T.RoomID = SR.RoomID
    LEFT JOIN 
        Screening.TICKETS TKT ON T.TimeID = TKT.TimeID
    WHERE
        T.BranchID = @BranchID
        AND T.[Day] = @Date 
    GROUP BY
        T.TimeID, T.[Day], T.StartTime, T.EndTime, T.FName, M.MName, M.RunTime, SR.RoomID, SR.RType, SR.RCapacity
    ORDER BY
        T.StartTime ASC;
END
GO
-- Procedure 19: Thêm suất chiếu mới (Dùng cho API POST /showtimes)
CREATE OR ALTER PROCEDURE Screening.sp_InsertShowtime
    @TimeID INT,
    @BranchID INT,
    @RoomID INT,
    @Day DATE,
    @StartTime TIME,
    @EndTime TIME,
    @FName NVARCHAR(30),
    @MovieID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 1. Kiểm tra trùng lịch (Phòng này đã có suất chiếu vào khoảng thời gian này chưa)
    IF EXISTS (
        SELECT 1 FROM Screening.TIME
        WHERE BranchID = @BranchID AND RoomID = @RoomID AND [Day] = @Day
        AND (
            @StartTime < EndTime AND StartTime < @EndTime
        )
    )
    BEGIN
        RAISERROR('Room is already booked for this time slot on this day.', 16, 1);
        RETURN;
    END

    -- 2. Thêm vào bảng Screening.TIME
    INSERT INTO Screening.TIME (TimeID, BranchID, RoomID, [Day], StartTime, EndTime, FName, MovieID)
    VALUES (@TimeID, @BranchID, @RoomID, @Day, @StartTime, @EndTime, @FName, @MovieID);

END
GO
-- Procedure 20: Xóa suất chiếu (Dùng cho API DELETE /showtimes/:id)
CREATE OR ALTER PROCEDURE Screening.sp_DeleteShowtime
    @TimeID AS INT,
    @BranchID AS INT -- Bắt buộc cho bảo mật và khóa chính
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra đã bán vé chưa
    IF EXISTS (SELECT 1 FROM Screening.TICKETS WHERE TimeID = @TimeID AND BranchID = @BranchID)
    BEGIN
        RAISERROR('Cannot delete showtime; tickets have already been sold.', 16, 1);
        RETURN;
    END
    
    -- Xóa suất chiếu
    DELETE FROM Screening.TIME WHERE TimeID = @TimeID AND BranchID = @BranchID;

END
GO
-- Procedure 21: Cập nhật suất chiếu (Dùng cho API PUT /showtimes/:id)
CREATE OR ALTER PROCEDURE Screening.sp_UpdateShowtime
    @TimeID INT,
    @BranchID INT,
    @RoomID INT,
    @Day DATE,
    @StartTime TIME,
    @EndTime TIME,
    @FName NVARCHAR(30),
    @MovieID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra trùng lịch (Loại trừ chính suất chiếu đang được sửa)
    IF EXISTS (
        SELECT 1 FROM Screening.TIME
        WHERE BranchID = @BranchID AND RoomID = @RoomID AND [Day] = @Day
        AND TimeID <> @TimeID -- <--- NGOẠI TRỪ suất chiếu hiện tại
        AND (
           @StartTime < EndTime AND StartTime < @EndTime
        )
    )
    BEGIN
        RAISERROR('Update failed: Room is already booked for this time slot on this day.', 16, 1);
        RETURN;
    END
    
    -- 2. Kiểm tra đã bán vé chưa (Không cho phép thay đổi Movie/Room/Time nếu đã bán vé)
    IF EXISTS (SELECT 1 FROM Screening.TICKETS WHERE TimeID = @TimeID AND BranchID = @BranchID)
    BEGIN
        RAISERROR('Cannot update fundamental details; tickets have already been sold.', 16, 1);
        RETURN;
    END

    -- 3. Thực hiện Update
    UPDATE Screening.TIME
    SET
        RoomID = @RoomID,
        [Day] = @Day,
        StartTime = @StartTime,
        EndTime = @EndTime,
        FName = @FName,
        MovieID = @MovieID
    WHERE TimeID = @TimeID AND BranchID = @BranchID;

END
GO

--Procedure 22: Cập nhật poster cho phim
CREATE OR ALTER PROCEDURE Movie.sp_AddPoster
    @MovieID INT,
    @posterURL VARCHAR(MAX)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Movie.MOVIE WHERE MovieID = @MovieID)
    BEGIN
        THROW 50001, 'Movie does not exist.', 1;
    END

    UPDATE Movie.MOVIE
    SET posterURL = @posterURL
    WHERE MovieID = @MovieID;

    PRINT'Poster uploaded successfull!';

END;
GO
-- Procedure 23: Lấy toàn bộ danh sách Nhân viên (Bổ sung)
GO
CREATE OR ALTER PROCEDURE Staff.sp_GetAllEmployees
    @BranchID AS INT,
    @SearchTerm AS NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        E.EUserID AS EmployeeID,
        E.EName AS FullName,
        E.Email,
        E.PhoneNumber,
        E.Salary,
        E.UserType AS Role,
        E.BranchID,
        B.BName AS BranchName,
        E.Sex
    FROM
        Staff.EMPLOYEE E
    JOIN
        Cinema.BRANCH B ON E.BranchID = B.BranchID
    WHERE
        E.BranchID = @BranchID
        AND (@SearchTerm IS NULL OR E.EName LIKE '%' + @SearchTerm + '%' OR E.Email LIKE '%' + @SearchTerm + '%')
    ORDER BY
        E.EName;
END
GO
-----------------------------------------------------------
-- PHẦN 5: BẢO MẬT - TẠO USER (PART 3) - PHIÊN BẢN CLEAN INSTALL
-----------------------------------------------------------
USE CGV;
GO

-- 1. Tạo Login ở cấp Server (Nếu chưa có)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'sManager')
BEGIN
    CREATE LOGIN sManager WITH PASSWORD = 'StrongPassword123!', CHECK_POLICY = OFF;
    PRINT 'Login sManager created successfully.';
END
GO

-- 2. Xử lý User trong Database (Quan trọng: Xóa cũ tạo mới)
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'sManager')
BEGIN
    -- Nếu user đã tồn tại, xóa nó đi để tạo lại cho sạch
    DROP USER sManager;
    PRINT 'Old User sManager dropped.';
END
GO

-- 3. Tạo User mới và cấp quyền
CREATE USER sManager FOR LOGIN sManager;
PRINT 'User sManager created successfully.';

ALTER ROLE db_owner ADD MEMBER sManager;
GO
-- 4. Bổ sung các định dạng phim cần thiết (Cho Frontend)
IF NOT EXISTS (SELECT 1 FROM Movie.FORMATS WHERE FName = '2D')
    INSERT INTO Movie.FORMATS (FName) VALUES ('2D');

IF NOT EXISTS (SELECT 1 FROM Movie.FORMATS WHERE FName = '3D')
    INSERT INTO Movie.FORMATS (FName) VALUES ('3D');

IF NOT EXISTS (SELECT 1 FROM Movie.FORMATS WHERE FName = 'IMAX')
    INSERT INTO Movie.FORMATS (FName) VALUES ('IMAX');

IF NOT EXISTS (SELECT 1 FROM Movie.FORMATS WHERE FName = '4DX')
    INSERT INTO Movie.FORMATS (FName) VALUES ('4DX');
GO
PRINT '=== DATABASE SETUP COMPLETED SUCCESSFULLY! ===';
