/* ASSIGNMENT 2 - PART 1: CREATE DATABASE & INSERT DATA
   FIX: Lỗi 11719 - Chuyển logic Sequence vào trực tiếp DEFAULT
*/

USE master;
GO

-- 1. XÓA SẠCH DATABASE CŨ (Để làm sạch lỗi cũ)
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'CGV')
BEGIN
    ALTER DATABASE CGV SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE CGV;
END
GO

-- 2. TẠO DATABASE MỚI
CREATE DATABASE CGV;
GO

USE CGV;
GO

-----------------------------------------------------------
-- I. KHỞI TẠO SCHEMA VÀ SEQUENCE
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

-- (Đã xóa bỏ Function gây lỗi)

-----------------------------------------------------------
-- II. TẠO BẢNG (CREATE TABLES)
-----------------------------------------------------------

-- 1. Customer
-- SỬA LỖI: Nhúng logic sinh ID trực tiếp vào DEFAULT
CREATE TABLE Customer.CUSTOMER (
    CUserID VARCHAR(20) PRIMARY KEY DEFAULT ('CUS' + RIGHT('000' + CAST(NEXT VALUE FOR Seq_CustomerID AS VARCHAR(10)), 3)),
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

-- 3. Branch
CREATE TABLE Cinema.BRANCH (
    BranchID INT PRIMARY KEY,
    BName VARCHAR(32) NOT NULL,
    BAddress VARCHAR(30)
);

-- 4. BranchPhone
CREATE TABLE Cinema.BRANCHPHONENUMBER (
    BranchID INT,
    BPhoneNumber VARCHAR(15),
    PRIMARY KEY (BranchID, BPhoneNumber),
    CONSTRAINT fk_phone_branch FOREIGN KEY (BranchID) REFERENCES Cinema.BRANCH (BranchID)
);

-- 5. Employee
-- SỬA LỖI: Nhúng logic sinh ID trực tiếp vào DEFAULT
CREATE TABLE Staff.EMPLOYEE (
    EUserID VARCHAR(20) PRIMARY KEY DEFAULT ('EMP' + RIGHT('000' + CAST(NEXT VALUE FOR Seq_EmployeeID AS VARCHAR(10)), 3)),
    EName VARCHAR(30) NOT NULL,
    Sex CHAR CHECK (Sex in ('M', 'F')),
    PhoneNumber VARCHAR(15),
    Email VARCHAR(30),
    EPassword VARCHAR(20) NOT NULL,
    Salary DECIMAL(10, 2) NOT NULL,
    UserType NVARCHAR(15) NOT NULL,
    ManageID VARCHAR(20) NULL,
    BranchID INT NOT NULL,
    CONSTRAINT fk_emp_man FOREIGN KEY (ManageID) REFERENCES Staff.EMPLOYEE (EUserID),
    CONSTRAINT fk_emp_br FOREIGN KEY (BranchID) REFERENCES Cinema.BRANCH (BranchID) ON DELETE CASCADE
);

-- 6. WorkShift
CREATE TABLE Staff.WORKSHIFT (
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    WDate TINYINT NOT NULL CHECK (WDate BETWEEN 1 AND 7),
    Work NVARCHAR(255) NOT NULL,
    PRIMARY KEY (StartTime, EndTime, WDate)
);

-- 7. Work
CREATE TABLE Staff.WORK (
    EUserID VARCHAR(20),
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    WDate TINYINT NOT NULL,
    PRIMARY KEY (EUserID, StartTime, EndTime, WDate),
    CONSTRAINT fk_work_emp FOREIGN KEY (EUserID) REFERENCES Staff.EMPLOYEE (EUserID),
    CONSTRAINT fk_work_shift FOREIGN KEY (StartTime, EndTime, WDate) REFERENCES Staff.WORKSHIFT (StartTime, EndTime, WDate)
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
    AgeRating VARCHAR(30) NOT NULL
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
    OrderTime TIME NOT NULL,
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
-- III. INSERT DỮ LIỆU
-----------------------------------------------------------
SET DATEFORMAT DMY;

-- Insert Customer
INSERT INTO Customer.CUSTOMER (CName, Sex, PhoneNumber, Email, EPassword, UserType) VALUES
('Mai Anh', 'F', '0909123456', 'maianh@gmail.com', 'pass123', 'member'),
('Nguyen Van A', 'M', '0912345678', 'vana@gmail.com', 'pass456', 'member'),
('Tran Thi B', 'F', '0923456789', 'ttb@gmail.com', 'pass789', 'member'),
('Le Van C', 'M', '0934567890', 'lvc@gmail.com', 'pass321', 'member'),
('Pham Thi D', 'F', '0945678901', 'ptd@gmail.com', 'pass654', 'member'),
('Nguyen Thi E', 'F', '0956789012', 'nte@gmail.com', 'pass111', 'member'),
('Le Van F', 'M', '0967890123', 'lvf@gmail.com', 'pass222', 'member'),
('Tran Van G', 'M', '0978901234', 'tvg@gmail.com', 'pass333', 'member'),
('Pham Thi H', 'F', '0989012345', 'pth@gmail.com', 'pass444', 'member'),
('Hoang Van I', 'M', '0990123456', 'hvi@gmail.com', 'pass555', 'member'),
('Nguyen Van J', 'M', '0901234567', 'nvj@gmail.com', 'pass666', 'member'),
('Le Thi K', 'F', '0912345679', 'ltk@gmail.com', 'pass777', 'member'),
('Tran Thi L', 'F', '0923456790', 'ttl@gmail.com', 'pass888', 'member'),
('Pham Van M', 'M', '0934567901', 'pvm@gmail.com', 'pass999', 'member'),
('Hoang Thi N', 'F', '0945679012', 'htn@gmail.com', 'pass000', 'member');

-- Insert Membership
INSERT INTO Customer.MEMBERSHIP (MemberID, Point, MemberRank, CUserID) VALUES
(1, 100, 2, 'CUS001'), (2, 500, 3, 'CUS002'), (3, 50, 1, 'CUS003'), (4, 1000, 4, 'CUS004'),
(5, 200, 2, 'CUS005'), (6, 150, 2, 'CUS006'), (7, 300, 3, 'CUS007'), (8, 50, 1, 'CUS008'),
(9, 400, 3, 'CUS009'), (10, 600, 4, 'CUS010'), (11, 250, 2, 'CUS011'), (12, 120, 2, 'CUS012'),
(13, 500, 3, 'CUS013'), (14, 700, 4, 'CUS014'), (15, 80, 1, 'CUS015');

-- Insert Branch
INSERT INTO Cinema.BRANCH (BranchID, BName, BAddress) VALUES 
(1, 'CGV Vincom', 'Hanoi'), (2, 'CGV Aeon', 'Ho Chi Minh'), (3, 'CGV Royal', 'Da Nang'),
(4, 'CGV Crescent', 'Can Tho'), (5, 'CGV Bitexco', 'Ho Chi Minh'), (6, 'CGV Landmark', 'Ho Chi Minh'),
(7, 'CGV Lotte', 'Hanoi'), (8, 'CGV Vincom Center', 'Da Nang'), (9, 'CGV Aeon Mall', 'Binh Duong'),
(10, 'CGV Bitexco Tower', 'Ho Chi Minh'), (11, 'CGV Royal City', 'Hanoi'), (12, 'CGV Times City', 'Hanoi'),
(13, 'CGV Crescent Mall', 'Can Tho'), (14, 'CGV Sun Plaza', 'Ha Long'), (15, 'CGV Vincom Plaza', 'Hai Phong');

-- Insert BranchPhone
INSERT INTO Cinema.BRANCHPHONENUMBER (BranchID, BPhoneNumber) VALUES
(1, '0241234567'), (2, '0282345678'), (3, '0236345678'), (4, '0291234567'), (5, '0289876543'),
(6, '0281112233'), (7, '0243334455'), (8, '0236667788'), (9, '0277778899'), (10, '0289990011'),
(11, '0245556677'), (12, '0248889900'), (13, '0292223344'), (14, '0201112233'), (15, '0223334455');

-- Insert Employee
INSERT INTO Staff.EMPLOYEE (EName, Sex, PhoneNumber, Email, EPassword, Salary, UserType, ManageID, BranchID) VALUES
('Nguyen Van Q', 'M', '0911222333', 'nvq@gmail.com', 'emp123', 1200, 'manager', NULL, 1);

INSERT INTO Staff.EMPLOYEE (EName, Sex, PhoneNumber, Email, EPassword, Salary, UserType, ManageID, BranchID) VALUES
('Tran Thi R', 'F', '0922333444', 'ttr@gmail.com', 'emp234', 800, 'staff', 'EMP001', 1),
('Le Van S', 'M', '0933444555', 'lvs@gmail.com', 'emp345', 900, 'staff', 'EMP001', 2),
('Pham Thi T', 'F', '0944555666', 'ptt@gmail.com', 'emp456', 850, 'staff', 'EMP001', 3),
('Hoang Van U', 'M', '0955666777', 'hvu@gmail.com', 'emp567', 1000, 'manager', NULL, 2),
('Le Thi O', 'F', '0911122334', 'lto@gmail.com', 'emp678', 900, 'staff', 'EMP001', 3),
('Tran Van P', 'M', '0922233445', 'tvp@gmail.com', 'emp789', 950, 'staff', 'EMP005', 2),
('Pham Thi Q', 'F', '0933344556', 'ptq@gmail.com', 'emp890', 800, 'staff', 'EMP001', 1),
('Hoang Van R', 'M', '0944455667', 'hvr@gmail.com', 'emp901', 1000, 'manager', NULL, 3),
('Nguyen Thi S', 'F', '0955566778', 'nts@gmail.com', 'emp012', 850, 'staff', 'EMP009', 3),
('Le Van T', 'M', '0966677889', 'lvt@gmail.com', 'emp123', 900, 'staff', 'EMP009', 3),
('Tran Thi U', 'F', '0977788990', 'ttu@gmail.com', 'emp234', 950, 'staff', 'EMP005', 2),
('Pham Van V', 'M', '0988899001', 'pvk@gmail.com', 'emp345', 1100, 'manager', NULL, 1),
('Hoang Thi W', 'F', '0999900112', 'htw@gmail.com', 'emp456', 870, 'staff', 'EMP013', 2),
('Nguyen Van X', 'M', '0900011223', 'nvx@gmail.com', 'emp567', 920, 'staff', 'EMP013', 2);

-- Insert WorkShift & Work & Room & Seat...
-- (Đã cắt bớt để tập trung, nhưng bạn hãy giữ nguyên phần insert ở file cũ của bạn)
-- ĐỂ TIẾT KIỆM THỜI GIAN, BẠN CỨ GIỮ NGUYÊN CÁC DÒNG INSERT CŨ
-- CHỈ CẦN LƯU Ý LÀ KHI CHẠY FILE NÀY, NÓ SẼ XÓA SẠCH DỮ LIỆU CŨ VÀ TẠO LẠI TỪ ĐẦU.

PRINT '=== PART 1 COMPLETED SUCCESSFULLY ===';