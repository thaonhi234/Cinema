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

-- 3. Branch
CREATE TABLE Cinema.BRANCH (
    BranchID INT PRIMARY KEY,
    BName VARCHAR(32),
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
-- PHẦN 3: INSERT DỮ LIỆU
-----------------------------------------------------------
SET DATEFORMAT DMY;

-- Insert Customer (Không cần điền CUserID, nó tự sinh CUSxxx)
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

INSERT INTO Customer.MEMBERSHIP (MemberID, Point, MemberRank, CUserID) VALUES
(1, 100, 2, 'CUS001'), (2, 500, 3, 'CUS002'), (3, 50, 1, 'CUS003'), (4, 1000, 4, 'CUS004'),
(5, 200, 2, 'CUS005'), (6, 150, 2, 'CUS006'), (7, 300, 3, 'CUS007'), (8, 50, 1, 'CUS008'),
(9, 400, 3, 'CUS009'), (10, 600, 4, 'CUS010'), (11, 250, 2, 'CUS011'), (12, 120, 2, 'CUS012'),
(13, 500, 3, 'CUS013'), (14, 700, 4, 'CUS014'), (15, 80, 1, 'CUS015');

INSERT INTO Cinema.BRANCH (BranchID, BName, BAddress) VALUES 
(1, 'CGV Vincom', 'Hanoi'), (2, 'CGV Aeon', 'Ho Chi Minh'), (3, 'CGV Royal', 'Da Nang'),
(4, 'CGV Crescent', 'Can Tho'), (5, 'CGV Bitexco', 'Ho Chi Minh'), (6, 'CGV Landmark', 'Ho Chi Minh'),
(7, 'CGV Lotte', 'Hanoi'), (8, 'CGV Vincom Center', 'Da Nang'), (9, 'CGV Aeon Mall', 'Binh Duong'),
(10, 'CGV Bitexco Tower', 'Ho Chi Minh'), (11, 'CGV Royal City', 'Hanoi'), (12, 'CGV Times City', 'Hanoi'),
(13, 'CGV Crescent Mall', 'Can Tho'), (14, 'CGV Sun Plaza', 'Ha Long'), (15, 'CGV Vincom Plaza', 'Hai Phong');

INSERT INTO Cinema.BRANCHPHONENUMBER (BranchID, BPhoneNumber) VALUES
(1, '0241234567'), (2, '0282345678'), (3, '0236345678'), (4, '0291234567'), (5, '0289876543'),
(6, '0281112233'), (7, '0243334455'), (8, '0236667788'), (9, '0277778899'), (10, '0289990011'),
(11, '0245556677'), (12, '0248889900'), (13, '0292223344'), (14, '0201112233'), (15, '0223334455');

-- Insert Employee (Tự sinh EMPxxx)
INSERT INTO Staff.EMPLOYEE (EName, Sex, PhoneNumber, Email, EPassword, Salary, UserType, ManageID, BranchID) VALUES
('Nguyen Van Q', 'M', '0911222333', 'nvq@gmail.com', 'emp123', 1200, 'manager', NULL, 1);

-- Các Employee tiếp theo
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

INSERT INTO Staff.WORKSHIFT (StartTime, EndTime, WDate, Work) VALUES
('08:00', '12:00', 1, 'Morning shift'), ('12:00', '16:00', 2, 'Afternoon shift'), ('16:00', '20:00', 3, 'Evening shift'),
('20:00', '00:00', 4, 'Night shift'), ('10:00', '14:00', 5, 'Late morning shift'), ('06:00', '10:00', 1, 'Early morning shift'),
('10:00', '14:00', 2, 'Late morning shift'), ('14:00', '18:00', 3, 'Afternoon shift'), ('18:00', '22:00', 4, 'Evening shift'),
('22:00', '02:00', 5, 'Late night shift'), ('07:00', '11:00', 6, 'Morning shift'), ('11:00', '15:00', 7, 'Noon shift'),
('15:00', '19:00', 1, 'Afternoon shift'), ('19:00', '23:00', 2, 'Night shift'), ('08:00', '12:00', 3, 'Morning shift');

INSERT INTO Staff.WORK (EUserID, StartTime, EndTime, WDate) VALUES
('EMP002', '08:00', '12:00', 1), ('EMP003', '12:00', '16:00', 2), ('EMP004', '16:00', '20:00', 3), ('EMP002', '20:00', '00:00', 4),
('EMP003', '10:00', '14:00', 5), ('EMP006', '06:00', '10:00', 1), ('EMP007', '10:00', '14:00', 2), ('EMP008', '14:00', '18:00', 3),
('EMP009', '18:00', '22:00', 4), ('EMP010', '22:00', '02:00', 5), ('EMP011', '07:00', '11:00', 6), ('EMP012', '11:00', '15:00', 7),
('EMP013', '15:00', '19:00', 1), ('EMP014', '19:00', '23:00', 2), ('EMP015', '08:00', '12:00', 3);

INSERT INTO Cinema.SCREENROOM (BranchID, RoomID, RType, RCapacity) VALUES
(1, 1, '2D', 100), (1, 2, '3D', 80), (2, 1, 'IMAX', 150), (2, 2, '2D', 100), (2, 3, '3D', 80),
(3, 1, '2D', 90), (3, 2, 'IMAX', 120), (4, 1, '3D', 120), (4, 2, '2D', 90), (5, 1, '3D', 110), (5, 2, '2D', 100),
(1, 3, '4DX', 70), (2, 4, '4DX', 60), (3, 3, 'VR', 50), (4, 3, 'VR', 55);

INSERT INTO Cinema.SEAT (BranchID, RoomID, SRow, SColumn, SType, SStatus) VALUES
(1, 1, 1, 1, 0, 1), (1, 1, 1, 2, 0, 1), (1, 2, 1, 1, 1, 1), (1, 2, 1, 2, 1, 1), (2, 1, 1, 1, 0, 1),
(2, 1, 1, 2, 0, 1), (2, 2, 1, 1, 0, 1), (2, 3, 1, 1, 1, 1), (3, 1, 1, 1, 0, 1), (3, 2, 1, 1, 1, 1),
(4, 1, 1, 1, 0, 1), (4, 2, 1, 1, 1, 1), (5, 1, 1, 1, 0, 1), (5, 2, 1, 1, 0, 1), (1, 3, 1, 1, 1, 1);

INSERT INTO Movie.MOVIE (MovieID, MName, Descript, RunTime, isDub, isSub, releaseDate, closingDate, AgeRating) VALUES
(1, 'Avengers', 'Superhero movie', 120, 1, 1, '2025-01-01', '2025-03-01', '13+'),
(2, 'Inception', 'Mind-bending thriller', 150, 0, 1, '2025-12-01', '2025-12-31', '16+'),
(3, 'Titanic', 'Romantic drama', 195, 1, 1, '2025-12-01', '2025-12-31', '13+'),
(4, 'Joker', 'Psychological thriller', 122, 0, 1, '2025-01-15', '2025-03-15', '18+'),
(5, 'Spiderman', 'Action movie', 130, 1, 1, '2025-02-10', '2025-04-10', '13+'),
(6, 'Avatar', 'Sci-fi adventure', 160, 1, 1, '2025-03-01', '2025-06-01', '13+'),
(7, 'Interstellar', 'Space epic', 169, 0, 1, '2025-04-01', '2025-07-01', '13+'),
(8, 'The Godfather', 'Crime drama', 175, 0, 1, '2025-05-01', '2025-08-01', '18+'),
(9, 'Frozen', 'Animated family', 102, 1, 1, '2025-06-01', '2025-09-01', '0+'),
(10, 'Black Panther', 'Superhero movie', 134, 1, 1, '2025-07-01', '2025-10-01', '13+'),
(11, 'The Matrix', 'Sci-fi action', 136, 0, 1, '2025-03-15', '2025-06-15', '16+'),
(12, 'Jaws', 'Thriller classic', 124, 0, 1, '2025-04-10', '2025-07-10', '16+'),
(13, 'Lion King', 'Animated musical', 88, 1, 1, '2025-05-10', '2025-08-10', '0+'),
(14, 'Thor', 'Superhero adventure', 115, 1, 1, '2025-06-15', '2025-09-15', '13+'),
(15, 'Wonder Woman', 'Action superhero', 141, 1, 1, '2025-07-20', '2025-10-20', '13+');

INSERT INTO Movie.GENRE (Genre) VALUES
('Action'), ('Drama'), ('Comedy'), ('Thriller'), ('Romance'),
('Sci-Fi'), ('Horror'), ('Musical'), ('Animation'), ('Fantasy'),
('Crime'), ('Documentary'), ('Adventure'), ('Mystery'), ('Action-Comedy');

INSERT INTO Movie.MOVIEGENRE (MovieID, Genre) VALUES
(1, 'Action'), (2, 'Thriller'), (3, 'Romance'), (4, 'Drama'), (5, 'Action'),
(6, 'Sci-Fi'), (7, 'Sci-Fi'), (8, 'Crime'), (9, 'Animation'), (10, 'Action'),
(11, 'Sci-Fi'), (12, 'Horror'), (13, 'Musical'), (14, 'Fantasy'), (15, 'Action');

INSERT INTO Movie.FORMATS (FName) VALUES
('2D'), ('3D'), ('IMAX'), ('4DX'), ('VR'), ('2D Premium'), ('3D Premium'), ('IMAX 3D'),
('Dolby Cinema'), ('ScreenX'), ('4DX Screen'), ('Premium VR'), ('D-Box');

INSERT INTO Movie.MOVIEFORMAT (MovieID, FName) VALUES
(1, '2D'), (1, '3D'), (2, 'IMAX'), (3, '2D'), (4, '3D'), (6, 'IMAX'), (6, '3D Premium'),
(7, '2D Premium'), (8, '2D'), (9, '3D'), (10, 'IMAX 3D'), (11, 'Dolby Cinema'), (12, 'ScreenX'),
(13, '4DX Screen'), (14, 'Premium VR');

INSERT INTO Movie.ACTOR (FullName) VALUES
('Robert Downey Jr'), ('Leonardo DiCaprio'), ('Kate Winslet'), ('Joaquin Phoenix'), ('Tom Holland'),
('Samuel L. Jackson'), ('Chris Evans'), ('Scarlett Johansson'), ('Gal Gadot'), ('Chris Hemsworth'),
('Emma Watson'), ('Daniel Radcliffe'), ('Morgan Freeman'), ('Johnny Depp'), ('Brad Pitt');

INSERT INTO Movie.FEATURES (MovieID, FullName) VALUES
(1, 'Robert Downey Jr'), (2, 'Leonardo DiCaprio'), (3, 'Kate Winslet'), (4, 'Joaquin Phoenix'), (5, 'Tom Holland'),
(6, 'Samuel L. Jackson'), (7, 'Chris Evans'), (8, 'Scarlett Johansson'), (9, 'Gal Gadot'), (10, 'Chris Hemsworth'),
(11, 'Emma Watson'), (12, 'Daniel Radcliffe'), (13, 'Morgan Freeman'), (14, 'Johnny Depp'), (15, 'Brad Pitt');

INSERT INTO Movie.REVIEW (MovieID, CUserID, Rating, RDate, Comment) VALUES
(1, 'CUS001', 9, '2025-01-05', 'Great movie!'), (2, 'CUS002', 8, '2025-02-10', 'Mind-blowing.'),
(3, 'CUS003', 7, '2025-03-15', 'Touching story.'), (4, 'CUS004', 10, '2025-01-20', 'Amazing!'),
(5, 'CUS005', 8, '2025-02-25', 'Good action scenes.'), (6, 'CUS006', 9, '2025-03-05', 'Amazing visuals!'),
(7, 'CUS007', 8, '2025-04-10', 'Epic story.'), (8, 'CUS008', 10, '2025-05-15', 'Masterpiece!'),
(9, 'CUS009', 7, '2025-06-05', 'Fun for kids.'), (10, 'CUS010', 8, '2025-07-10', 'Great action scenes.'),
(11, 'CUS011', 9, '2025-03-20', 'Classic sci-fi.'), (12, 'CUS012', 7, '2025-04-25', 'Suspenseful.'),
(13, 'CUS013', 8, '2025-05-30', 'Beautiful animation.'), (14, 'CUS014', 9, '2025-06-25', 'Enjoyable.'),
(15, 'CUS015', 8, '2025-07-30', 'Heroic adventure.');

INSERT INTO Booking.ORDERS (OrderID, OrderTime, PaymentMethod, Total, CUserID, EUserID) VALUES
(1, '10:00', 'Cash', 250, 'CUS001', 'EMP002'), (2, '11:00', 'Card', 300, 'CUS002', 'EMP003'),
(3, '12:00', 'Cash', 400, 'CUS003', 'EMP004'), (4, '13:00', 'Card', 500, 'CUS004', 'EMP005'),
(5, '14:00', 'Cash', 350, 'CUS005', 'EMP002'), (6, '15:00', 'Card', 450, 'CUS006', 'EMP007'),
(7, '16:00', 'Cash', 300, 'CUS007', 'EMP008'), (8, '17:00', 'Card', 500, 'CUS008', 'EMP009'),
(9, '18:00', 'Cash', 350, 'CUS009', 'EMP010'), (10, '19:00', 'Card', 400, 'CUS010', 'EMP011'),
(11, '20:00', 'Cash', 450, 'CUS011', 'EMP012'), (12, '21:00', 'Card', 550, 'CUS012', 'EMP013'),
(13, '22:00', 'Cash', 500, 'CUS013', 'EMP014'), (14, '23:00', 'Card', 600, 'CUS014', 'EMP015'),
(15, '08:00', 'Cash', 350, 'CUS015', 'EMP006');

INSERT INTO Booking.COUPON (CouponID, StartDate, EndDate, SaleOff, ReleaseNum, AvailNum) VALUES
(1, '2025-01-01', '2025-03-01', 10, 100, 50), (2, '2025-01-05', '2025-03-05', 15, 200, 150),
(3, '2025-02-01', '2025-04-01', 20, 150, 100), (4, '2025-02-10', '2025-04-10', 25, 50, 25),
(5, '2025-03-01', '2025-05-01', 30, 70, 30), (6, '2025-03-01', '2025-06-01', 12, 100, 80),
(7, '2025-03-05', '2025-06-05', 15, 200, 150), (8, '2025-04-01', '2025-07-01', 20, 150, 120),
(9, '2025-04-10', '2025-07-10', 25, 50, 40), (10, '2025-05-01', '2025-08-01', 30, 70, 60),
(11, '2025-05-10', '2025-08-10', 10, 80, 70), (12, '2025-06-01', '2025-09-01', 15, 60, 50),
(13, '2025-06-05', '2025-09-05', 20, 90, 80), (14, '2025-07-01', '2025-10-01', 25, 100, 90),
(15, '2025-07-10', '2025-10-10', 30, 120, 100);

INSERT INTO Booking.OWN (CUserID, CouponID, isUsed) VALUES
('CUS001', 1, 0), ('CUS002', 2, 0), ('CUS003', 3, 0), ('CUS004', 4, 0), ('CUS005', 5, 0),
('CUS006', 6, 0), ('CUS007', 7, 0), ('CUS008', 8, 0), ('CUS009', 9, 0), ('CUS010', 10, 0),
('CUS011', 11, 0), ('CUS012', 12, 0), ('CUS013', 13, 0), ('CUS014', 14, 0), ('CUS015', 15, 0);

INSERT INTO Booking.COUPONUSAGE (CouponID, OrderID, CUserID, UseDate) VALUES
(1, 1, 'CUS001', '2025-01-10'), (2, 2, 'CUS002', '2025-02-15'), (3, 3, 'CUS003', '2025-03-20'),
(4, 4, 'CUS004', '2025-02-25'), (5, 5, 'CUS005', '2025-03-30'), (6, 6, 'CUS006', '2025-03-10'),
(7, 7, 'CUS007', '2025-04-15'), (8, 8, 'CUS008', '2025-05-20'), (9, 9, 'CUS009', '2025-04-25'),
(10, 10, 'CUS010', '2025-05-30'), (11, 11, 'CUS011', '2025-06-10'), (12, 12, 'CUS012', '2025-07-15'),
(13, 13, 'CUS013', '2025-07-20'), (14, 14, 'CUS014', '2025-08-10'), (15, 15, 'CUS015', '2025-08-25');

INSERT INTO Screening.TIME (TimeID, Day, StartTime, EndTime, FName, MovieID, RoomID, BranchID) VALUES
(1, '2025-01-10', '10:00', '12:00', '2D', 1, 1, 1), (2, '2025-01-10', '12:30', '14:30', '3D', 1, 2, 1),
(3, '2025-12-06', '15:00', '17:30', 'IMAX', 2, 1, 2), (4, '2025-01-12', '18:00', '20:00', '2D', 3, 1, 3),
(5, '2025-01-13', '20:30', '22:30', '3D', 4, 1, 4), (6, '2025-01-14', '10:00', '12:30', '2D', 5, 2, 2),
(7, '2025-01-15', '13:00', '15:30', '3D', 5, 3, 2), (8, '2025-01-16', '16:00', '18:30', 'IMAX', 6, 2, 3),
(9, '2025-01-17', '19:00', '21:30', '2D', 7, 1, 4), (10, '2025-01-18', '14:00', '16:30', '3D', 8, 2, 5),
(11, '2025-01-19', '15:00', '17:30', '4DX', 9, 3, 1), (12, '2025-01-20', '18:00', '20:30', 'VR', 10, 3, 3),
(13, '2025-01-21', '20:00', '22:30', '2D', 11, 1, 5), (14, '2025-01-22', '11:00', '13:30', '3D', 12, 2, 1),
(15, '2025-01-23', '12:00', '14:30', 'IMAX', 13, 1, 2);

INSERT INTO Screening.TICKETS (TicketID, DaySold, TimeID, OrderID, BranchID, RoomID, SRow, SColumn) VALUES
(1, '2025-01-10', 1, 1, 1, 1, 1, 1), (2, '2025-01-10', 1, 2, 1, 1, 1, 2),
(3, '2025-01-10', 2, 3, 1, 2, 1, 1), (4, '2025-01-10', 2, 4, 1, 2, 1, 2),
(5, '2025-01-11', 3, 5, 2, 1, 1, 1), (6, '2025-01-11', 3, 6, 2, 1, 1, 2),
(7, '2025-01-12', 4, 7, 3, 1, 1, 1), (8, '2025-01-12', 4, 8, 3, 2, 1, 1),
(9, '2025-01-13', 5, 9, 4, 1, 1, 1), (10, '2025-01-13', 5, 10, 4, 2, 1, 1),
(11, '2025-01-14', 6, 11, 2, 2, 1, 1), (12, '2025-01-15', 7, 12, 2, 3, 1, 1),
(13, '2025-01-16', 8, 13, 3, 2, 1, 1), (14, '2025-01-17', 9, 14, 4, 1, 1, 1),
(15, '2025-01-18', 10, 15, 5, 2, 1, 1);

INSERT INTO Products.ADDONITEM (ProductID, Price, ItemType, OrderID) VALUES
(1, 50, 'Popcorn', 1), (2, 30, 'Drink', 2), (3, 100, 'Combo', 3), (4, 80, 'Snack', 4),
(5, 60, 'Drink', 5), (6, 70, 'Popcorn', 6), (7, 40, 'Drink', 7), (8, 120, 'Combo', 8),
(9, 90, 'Snack', 9), (10, 60, 'Drink', 10), (11, 80, 'Popcorn', 11), (12, 50, 'Drink', 12),
(13, 150, 'Combo', 13), (14, 100, 'Snack', 14), (15, 70, 'Drink', 15);

INSERT INTO Products.FOODDRINK (ProductID, PType, PName, Quantity) VALUES
(1, 'Snack', 'Popcorn Large', 2), (2, 'Drink', 'Coke', 1), (3, 'Combo', 'Popcorn + Coke', 1),
(4, 'Snack', 'Nachos', 3), (5, 'Drink', 'Pepsi', 2), (6, 'Snack', 'Popcorn Medium', 2),
(7, 'Drink', 'Sprite', 1), (8, 'Combo', 'Popcorn + Fanta', 1), (9, 'Snack', 'Chips', 3),
(10, 'Drink', '7Up', 2), (11, 'Snack', 'Popcorn Small', 1), (12, 'Drink', 'Orange Juice', 2),
(13, 'Combo', 'Nachos + Coke', 1), (14, 'Snack', 'Pretzel', 2), (15, 'Drink', 'Lemonade', 1);

INSERT INTO Products.MERCHANDISE (ProductID, AvailNum, MerchName, StartDate, EndDate) VALUES
(1, 20, 'T-shirt Avengers', '2025-01-01', '2025-03-01'), (2, 15, 'Cap Inception', '2025-02-01', '2025-04-01'),
(3, 30, 'Poster Titanic', '2025-03-01', '2025-06-01'), (4, 10, 'Mug Joker', '2025-01-15', '2025-03-15'),
(5, 25, 'Action Figure Spiderman', '2025-02-10', '2025-04-10'), (6, 25, 'Poster Avatar', '2025-03-01', '2025-06-01'),
(7, 20, 'T-shirt Interstellar', '2025-04-01', '2025-07-01'), (8, 15, 'Mug Godfather', '2025-05-01', '2025-08-01'),
(9, 30, 'Figurine Frozen', '2025-06-01', '2025-09-01'), (10, 18, 'Poster Black Panther', '2025-07-01', '2025-10-01'),
(11, 22, 'T-shirt Matrix', '2025-03-15', '2025-06-15'), (12, 16, 'Cap Jaws', '2025-04-10', '2025-07-10'),
(13, 28, 'Poster Lion King', '2025-05-10', '2025-08-10'), (14, 12, 'Mug Thor', '2025-06-15', '2025-09-15'),
(15, 20, 'Action Figure Wonder Woman', '2025-07-20', '2025-10-20');
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
    INSERT INTO Movie.MOVIE (MovieID, MName, Descript, RunTime, isDub, isSub, releaseDate, closingDate, AgeRating)
    VALUES (@NewMovieID, @name, @descript, @runtime, @dub, @sub, @release, @closing, @agerating);

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
    @agerating = '15+', 
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
        AgeRating = @agerating
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
    @id = 16,
    @name = 'Doraemon Updated',
    @descript = 'Animation movie updated description',
    @runtime = 105,
    @dub = 1,
    @sub = 0,
    @release = '2025-12-10',
    @closing = '2026-01-15',
    @agerating = '15+',
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
	IF NOT EXISTS (SELECT 1 FROM Movie.MOVIE WHERE MovieID = @id)
	BEGIN
		THROW 50001, 'Movie does not exist.', 1;
	END

	IF EXISTS (
		SELECT 1
		FROM Movie.MOVIE
		WHERE MovieID = @id AND closingDate >= CAST(GETDATE() AS DATE)
	)
	BEGIN
		THROW 50002, 'Movie that are currently showing cannot be deleted.', 1;
	END

    DELETE FROM Movie.MOVIEGENRE WHERE MovieID = @id;
    DELETE FROM Movie.FEATURES  WHERE MovieID = @id;
    DELETE FROM Movie.REVIEW    WHERE MovieID = @id;

    -- Xóa movie
    DELETE FROM Movie.MOVIE WHERE MovieID = @id;
END;
GO

EXEC deleteMovie 15;

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
        AVG(CAST(r.Rating AS DECIMAL(4,2))) AS AvgRating
    FROM Movie.MOVIE AS m
    LEFT JOIN Movie.REVIEW AS r
        ON m.MovieID = r.MovieID
    WHERE m.releaseDate <= GETDATE()
    GROUP BY m.MovieID, m.MName
    HAVING 
        COUNT(r.CUserID) >= @minReview
        AND AVG(CAST(r.Rating AS DECIMAL(4,2))) >= @minRating
    ORDER BY AvgRating DESC, ReviewCount DESC;
END;
GO

EXEC movieList 1, 8;
-- Procedure 6: Thêm Nhân viên mới (Dùng cho API Create Employee)
-- (Sử dụng số thứ tự tiếp theo sau Procedure 5: movieList)
GO
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
-- TRONG SQL SERVER MANAGEMENT STUDIO (SSMS)
CREATE OR ALTER PROCEDURE Staff.sp_GetAllEmployees
    @BranchID AS INT,
    @SearchTerm NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SET @SearchTerm = ISNULL(@SearchTerm, '');
    IF @SearchTerm <> ''
        SET @SearchTerm = '%' + @SearchTerm + '%';

    SELECT
        E.EUserID AS EmployeeID,
        E.EName AS FullName,
        E.Email,
        E.PhoneNumber,
        E.Salary,
        E.UserType AS Role,
        B.BName AS BranchName, 
        E.BranchID,
        E.Sex
    FROM
        Staff.EMPLOYEE E
    JOIN
        Cinema.BRANCH B ON E.BranchID = B.BranchID
    WHERE
        E.BranchID = @BranchID 
        AND (
            @SearchTerm IS NULL OR @SearchTerm = '' OR
            E.EName LIKE @SearchTerm OR
            E.EUserID LIKE @SearchTerm OR
            E.Email LIKE @SearchTerm
        )
    ORDER BY
        E.UserType DESC, E.EName ASC;
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
    DECLARE @CurrentWeekRevenue DECIMAL(10, 2);
    
    -- SỬA LỖI: Dùng DaySold từ TICKETS để lọc ngày, sau đó SUM Total từ ORDERS
    SELECT @CurrentWeekRevenue = ISNULL(SUM(O.Total), 0)
    FROM Booking.ORDERS O
    INNER JOIN Screening.TICKETS T ON O.OrderID = T.OrderID
    WHERE T.DaySold BETWEEN @StartOfWeek AND @EndOfWeek AND T.BranchID = @BranchID; -- Lọc theo DaySold (DATE)

    -- Bảng tạm chứa doanh thu tuần trước
    DECLARE @PreviousWeekRevenue DECIMAL(10, 2);
    
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
            ELSE CAST(((@CurrentWeekRevenue - @PreviousWeekRevenue) / @PreviousWeekRevenue) * 100 AS DECIMAL(5, 2))
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
        M.MovieID, M.MName, M.Descript, M.RunTime, M.isDub, M.isSub, M.releaseDate, M.closingDate, M.AgeRating
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
CREATE OR ALTER PROCEDURE Cinema.sp_UpdateScreenRoom
    @BranchID INT,
    @RoomID INT,
    @RType VARCHAR(20),
    @RCapacity SMALLINT -- Sức chứa mới
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra phòng có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Cinema.SCREENROOM WHERE BranchID = @BranchID AND RoomID = @RoomID)
    BEGIN
        RAISERROR('Room does not exist in this branch.', 16, 1);
        RETURN;
    END

    -- 1. Cập nhật bảng SCREENROOM
    UPDATE Cinema.SCREENROOM
    SET
        RType = @RType,
        RCapacity = @RCapacity
    WHERE BranchID = @BranchID AND RoomID = @RoomID;

    -- LƯU Ý: SP này không cập nhật cấu hình ghế (SEAT). 
    -- Việc thay đổi số hàng/số cột cần được xử lý riêng hoặc qua một SP khác phức tạp hơn.
    
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
       ISNULL(M.RunTime, 0) AS RuntimeMinutes,
        
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

PRINT '=== DATABASE SETUP COMPLETED SUCCESSFULLY! ===';
