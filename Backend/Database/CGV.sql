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
(2, 'Inception', 'Mind-bending thriller', 150, 0, 1, '2025-02-01', '2025-04-01', '16+'),
(3, 'Titanic', 'Romantic drama', 195, 1, 1, '2025-03-01', '2025-06-01', '13+'),
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
(3, '2025-01-11', '15:00', '17:30', 'IMAX', 2, 1, 2), (4, '2025-01-12', '18:00', '20:00', '2D', 3, 1, 3),
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

-- Procedure 1: Thêm phim mới (Có Validate)
CREATE OR ALTER PROCEDURE Movie.sp_AddNewMovie
    @MovieID INT,
    @MName VARCHAR(255),
    @RunTime TINYINT,
    @ReleaseDate DATE,
    @ClosingDate DATE,
    @AgeRating VARCHAR(30)
AS
BEGIN
    IF @ClosingDate <= @ReleaseDate
    BEGIN
        PRINT 'Error: Closing Date must be after Release Date';
        RETURN;
    END
    INSERT INTO Movie.MOVIE (MovieID, MName, Descript, RunTime, isDub, isSub, releaseDate, closingDate, AgeRating)
    VALUES (@MovieID, @MName, N'No description', @RunTime, 1, 1, @ReleaseDate, @ClosingDate, @AgeRating);
    PRINT 'Movie added successfully!';
END
GO

-- Procedure 2: Báo cáo doanh thu tháng
CREATE OR ALTER PROCEDURE Booking.sp_GetMonthlyRevenue
    @BranchID INT,
    @Month INT,
    @Year INT
AS
BEGIN
    SELECT b.BName, @Month AS [Month], @Year AS [Year], SUM(o.Total) AS TotalRevenue
    FROM Booking.ORDERS o
    JOIN Screening.TICKETS t ON o.OrderID = t.OrderID
    JOIN Cinema.BRANCH b ON t.BranchID = b.BranchID
    WHERE b.BranchID = @BranchID AND MONTH(o.OrderTime) = @Month AND YEAR(t.DaySold) = @Year
    GROUP BY b.BName;
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