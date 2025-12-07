USE CGV
GO

CREATE SCHEMA Staff;
GO

CREATE SCHEMA Cinema;
GO

CREATE SCHEMA Movie;
GO

CREATE SCHEMA Screening;
GO

CREATE SCHEMA Booking;
GO

CREATE SCHEMA Products;
GO

CREATE SCHEMA Customer;
GO


CREATE TABLE Customer.CUSTOMER (
	CUserID			INT				PRIMARY KEY,
	CName			VARCHAR(30)		NOT NULL,
	Sex				CHAR CHECK (Sex in ('M', 'F')),
	PhoneNumber		VARCHAR(15),
	Email			VARCHAR(30),
	EPassword		VARCHAR(20)		NOT NULL,
	UserType		NVARCHAR(15)	NOT NULL
);


CREATE TABLE Customer.MEMBERSHIP (
	MemberID	INT			PRIMARY KEY,
	Point		INT			NOT NULL,
	MemberRank	TINYINT		CHECK (MemberRank BETWEEN 1 AND 4),		--1=normal, 2=silver, 3=gold, 4=diamond
	CUserID		INT			NOT NULL UNIQUE,
	CONSTRAINT fk_member_cus_cuserid FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER(CUserID)
);

CREATE TABLE Cinema.BRANCH (
	BranchID	INT		PRIMARY KEY,
	BName		VARCHAR(32),
	BAddress	VARCHAR(30)
);

CREATE TABLE Cinema.BRANCHPHONENUMBER (
	BranchID	 INT,
	BPhoneNumber VARCHAR(15),
	PRIMARY KEY (BranchID, BPhoneNumber),
	CONSTRAINT fk_pnum_branch_branchid FOREIGN KEY (BranchID) REFERENCES Cinema.BRANCH (BranchID)
);

CREATE TABLE Staff.EMPLOYEE (
	EUserID			INT				PRIMARY KEY,
	EName			VARCHAR(30)		NOT NULL,
	Sex				CHAR CHECK (Sex in ('M', 'F')),
	PhoneNumber		VARCHAR(15),
	Email			VARCHAR(30),
	EPassword		VARCHAR(20)		NOT NULL,
	Salary			DECIMAL(10, 2)	NOT NULL,
	UserType		NVARCHAR(15)	NOT NULL,
	ManageID		INT				NULL,
	BranchID		INT				NOT NULL,
	CONSTRAINT fk_emp_manage_manageid FOREIGN KEY (ManageID) REFERENCES Staff.EMPLOYEE (EUserID) ON DELETE NO ACTION,
	CONSTRAINT fk_emp_branch_branchid FOREIGN KEY (BranchID) REFERENCES Cinema.BRANCH (BranchID) ON DELETE CASCADE
);

CREATE TABLE Staff.WORKSHIFT (
	StartTime	TIME			NOT NULL,
	EndTime		TIME			NOT NULL,
	WDate		TINYINT			NOT NULL	CHECK (WDate BETWEEN 1 AND 7),	--1=Mon...7=Sun
	Work		NVARCHAR(255)	NOT NULL,
	PRIMARY KEY (StartTime, EndTime, WDate)
);

CREATE TABLE Staff.WORK (
	EUserID		INT,
	StartTime	TIME			NOT NULL,
	EndTime		TIME			NOT NULL,
	WDate		TINYINT			NOT NULL	CHECK (WDate BETWEEN 1 AND 7),	--1=Mon...7=Sun
	PRIMARY KEY (EUserID, StartTime, EndTime, WDate),
	CONSTRAINT fk_work_emp_euserid FOREIGN KEY (EUserID) REFERENCES Staff.EMPLOYEE (EUserID),
	CONSTRAINT fk_work_shift FOREIGN KEY (StartTime, EndTime, WDate) REFERENCES Staff.WORKSHIFT (StartTime, EndTime, WDate)
);

CREATE TABLE Cinema.SCREENROOM (
	BranchID	INT,
	RoomID		INT,
	RType		VARCHAR(20),
	RCapacity	SMALLINT,
	PRIMARY KEY (BranchID, RoomID),
	CONSTRAINT fk_sroom_branch_branchid FOREIGN KEY (BranchID) REFERENCES Cinema.BRANCH (BranchID)
);

CREATE TABLE Cinema.SEAT (
	BranchID	INT,
	RoomID		INT,
	SRow		TINYINT	NOT NULL,
	SColumn		TINYINT	NOT NULL,
	SType		BIT		NOT NULL,	--0 = normal, 1 = VIP
	SStatus		BIT		NOT NULL,	--0 = unavail, 1 = avail
	PRIMARY KEY (BranchID, RoomID, SRow, SColumn),
	CONSTRAINT fk_seat_room FOREIGN KEY (BranchID, RoomID) REFERENCES Cinema.SCREENROOM (BranchID, RoomID)
);


CREATE TABLE Movie.MOVIE (
	MovieID		INT				PRIMARY KEY,
	MName		VARCHAR(255)	NOT NULL,
	Descript	NVARCHAR(MAX),	
	RunTime		TINYINT			NOT NULL,
	isDub		BIT				NOT NULL,
	isSub		BIT				NOT NULL,
	releaseDate	DATE			NOT NULL,
	closingDate	DATE			NOT NULL,
	AgeRating	VARCHAR(30)		NOT NULL
);

CREATE TABLE Movie.GENRE (
	Genre	NVARCHAR(30) PRIMARY KEY
);

CREATE TABLE Movie.MOVIEGENRE (	
	MovieID	INT,
	Genre	NVARCHAR(30),
	PRIMARY KEY (MovieID, Genre),
	CONSTRAINT fk_moviegenre_genre_genre FOREIGN KEY (Genre) REFERENCES Movie.GENRE (Genre),
	CONSTRAINT fk_moviegenre_movie_movieid FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID)
);

CREATE TABLE Movie.FORMATS (
	FName	NVARCHAR(30)	PRIMARY KEY
);

CREATE TABLE Movie.MOVIEFORMAT (
	MovieID	INT,
	FName	NVARCHAR(30),
	PRIMARY KEY (MovieID, FName),
	CONSTRAINT fk_movieformat_format_fname FOREIGN KEY (FName) REFERENCES Movie.FORMATS (FName),
	CONSTRAINT fk_movieformat_movie_movieid FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID)
);

CREATE TABLE Movie.ACTOR (
	FullName	VARCHAR(30)	PRIMARY KEY
);

CREATE TABLE Movie.FEATURES (
	MovieID		INT,
	FullName	VARCHAR(30),
	PRIMARY KEY (MovieID, FullName),
	CONSTRAINT fk_features_movie_movieid FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID),
	CONSTRAINT fk_features_actor_name FOREIGN KEY (FullName) REFERENCES Movie.ACTOR (FullName)
);

CREATE TABLE Movie.REVIEW (
	MovieID	INT,
	CUserID	INT,
	Rating	TINYINT	CHECK (Rating BETWEEN 1 AND 10) NOT NULL, 
	RDate	DATE	NOT NULL,
	Comment NVARCHAR(MAX),
	PRIMARY KEY (MovieID, CUserID),
	CONSTRAINT fk_review_movie_movieid FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID),
	CONSTRAINT fk_review_customer_cid FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER (CUserID)	ON DELETE CASCADE
);


CREATE TABLE Booking.ORDERS (
	OrderID			INT	PRIMARY KEY,
	OrderTime		TIME	NOT NULL,
	PaymentMethod	VARCHAR(30),
	Total			DECIMAL (10, 2)		NOT NULL,
	CUserID			INT		NOT NULL,
	EUserID			INT,
	CONSTRAINT fk_orders_emp_euserid FOREIGN KEY (EUserID) REFERENCES Staff.EMPLOYEE(EUserID),
	CONSTRAINT fk_orders_cus_cuserid FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER(CUserID)
);

CREATE TABLE Booking.COUPON (
	CouponID	INT		PRIMARY KEY,
	StartDate	DATE,
	EndDate		DATE,
	SaleOff		TINYINT	CHECK (SaleOff BETWEEN 1 AND 100) NOT NULL,
	ReleaseNum	INT,
	AvailNum	INT
);

CREATE TABLE Booking.OWN (
	CUserID		INT		NOT NULL,
	CouponID	INT		NOT NULL,
	isUsed		BIT		NOT NULL DEFAULT 0,	--1 = used
	PRIMARY KEY (CouponID, CUserID),
	CONSTRAINT fk_own_coupon_couponid FOREIGN KEY (CouponID) REFERENCES Booking.COUPON (CouponID),
	CONSTRAINT fk_own_cus_cuserid FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER(CUserID)
);

CREATE TABLE Booking.COUPONUSAGE (
	CouponID	INT		NOT NULL,
	OrderID		INT		NOT NULL,
	CUserID		INT		NOT NULL,
	UseDate		DATE	NOT NULL DEFAULT (CONVERT(DATE, GETDATE())),
	PRIMARY KEY (CouponID, OrderID),
	UNIQUE (CouponID, CUserID),
	CONSTRAINT fk_use_cus_cuserid FOREIGN KEY (CUserID) REFERENCES Customer.CUSTOMER(CUserID) ON DELETE CASCADE,
	CONSTRAINT fk_use_coupon_couponid FOREIGN KEY (CouponID) REFERENCES Booking.COUPON (CouponID) ON DELETE CASCADE,
	CONSTRAINT fk_use_orders_orderid FOREIGN KEY (OrderID) REFERENCES Booking.ORDERS(OrderID)
);

CREATE TABLE Screening.TIME (
	TimeID		INT		PRIMARY KEY,
	Day			DATE,
	StartTime	TIME,
	EndTime		TIME,
	FName		NVARCHAR(30)	NOT NULL,
	MovieID		INT				NOT NULL,
	RoomID		INT				NOT NULL,
	BranchID	INT				NOT NULL,
	UNIQUE (BranchID, RoomID, Day, StartTime),
	CONSTRAINT fk_time_format_fname FOREIGN KEY (FName) REFERENCES Movie.FORMATS (FName),
	CONSTRAINT fk_time_movie_movieid FOREIGN KEY (MovieID) REFERENCES Movie.MOVIE (MovieID),
	CONSTRAINT fk_time_room FOREIGN KEY (BranchID, RoomID) REFERENCES Cinema.SCREENROOM (BranchID, RoomID)
);


CREATE TABLE Screening.TICKETS (
	TicketID	INT		PRIMARY KEY,
	DaySold		DATE,
	TimeID		INT		NOT NULL,
	OrderID		INT		NOT NULL,
	BranchID	INT		NOT NULL,
	RoomID		INT		NOT NULL,
	SRow		TINYINT	NOT NULL,	
	SColumn		TINYINT	NOT NULL,
	CONSTRAINT fk_ticket_seat FOREIGN KEY (BranchID, RoomID, SRow, SColumn) REFERENCES Cinema.SEAT(BranchID, RoomID, SRow, SColumn),
	CONSTRAINT fk_ticket_orders_orderid FOREIGN KEY (OrderID) REFERENCES Booking.ORDERS(OrderID),
	CONSTRAINT fk_ticket_time_timeid FOREIGN KEY (TimeID) REFERENCES Screening.TIME (TimeID)
);


CREATE TABLE Products.ADDONITEM (
	ProductID	INT		PRIMARY KEY,
	Price		DECIMAL(10, 2),	
	ItemType	VARCHAR(255),
	OrderID		INT,
	CONSTRAINT fk_addon_orders_orderid FOREIGN KEY (OrderID) REFERENCES Booking.ORDERS(OrderID)
);


CREATE TABLE Products.FOODDRINK (
	ProductID	INT			PRIMARY KEY,
	PType		VARCHAR(30)	NOT NULL, 
	PName		VARCHAR(255),
	Quantity	INT,
	CONSTRAINT fk_fooddrink_item_productid FOREIGN KEY (ProductID) REFERENCES Products.ADDONITEM (ProductID)
);


CREATE TABLE Products.MERCHANDISE (
	ProductID	INT		PRIMARY KEY,
	AvailNum	INT,
	MerchName	VARCHAR(255),
	StartDate	DATE,
	EndDate		DATE,
	CONSTRAINT fk_merch_item_productid FOREIGN KEY (ProductID) REFERENCES Products.ADDONITEM (ProductID)

);

CREATE VIEW Screening.AvailSeats
AS
	SELECT
		t.TimeID,
		sr.BranchID,
		sr.RoomID,
		sr.RCapacity - COUNT(tt.TicketID) AS AvailSeats
	FROM Screening.TIME t
	JOIN Cinema.SCREENROOM sr
		ON t.BranchID = sr.BranchID AND t.RoomID = sr.RoomID
	JOIN Cinema.SEAT seat
		ON seat.BranchID = sr.BranchID
		AND seat.RoomID = sr.RoomID
		AND seat.SStatus = 1
	LEFT JOIN Screening.TICKETS tt
		ON tt.TimeID = t.TimeID
		AND tt.BranchID = sr.BranchID
		AND tt.RoomID = sr.RoomID
		AND tt.SRow = seat.SRow
		AND tt.SColumn = seat.SColumn
	GROUP BY t.TimeID, sr.BranchID, sr.RoomID, sr.RCapacity;

GO

SET DATEFORMAT DMY;

-- 1. CUSTOMER
INSERT INTO Customer.CUSTOMER (CUserID, CName, Sex, PhoneNumber, Email, EPassword, UserType) VALUES
(1, 'Mai Anh', 'F', '0909123456', 'maianh@gmail.com', 'pass123', 'member'),
(2, 'Nguyen Van A', 'M', '0912345678', 'vana@gmail.com', 'pass456', 'member'),
(3, 'Tran Thi B', 'F', '0923456789', 'ttb@gmail.com', 'pass789', 'member'),
(4, 'Le Van C', 'M', '0934567890', 'lvc@gmail.com', 'pass321', 'member'),
(5, 'Pham Thi D', 'F', '0945678901', 'ptd@gmail.com', 'pass654', 'member'),
(6, 'Nguyen Thi E', 'F', '0956789012', 'nte@gmail.com', 'pass111', 'member'),
(7, 'Le Van F', 'M', '0967890123', 'lvf@gmail.com', 'pass222', 'member'),
(8, 'Tran Van G', 'M', '0978901234', 'tvg@gmail.com', 'pass333', 'member'),
(9, 'Pham Thi H', 'F', '0989012345', 'pth@gmail.com', 'pass444', 'member'),
(10, 'Hoang Van I', 'M', '0990123456', 'hvi@gmail.com', 'pass555', 'member'),
(11, 'Nguyen Van J', 'M', '0901234567', 'nvj@gmail.com', 'pass666', 'member'),
(12, 'Le Thi K', 'F', '0912345679', 'ltk@gmail.com', 'pass777', 'member'),
(13, 'Tran Thi L', 'F', '0923456790', 'ttl@gmail.com', 'pass888', 'member'),
(14, 'Pham Van M', 'M', '0934567901', 'pvm@gmail.com', 'pass999', 'member'),
(15, 'Hoang Thi N', 'F', '0945679012', 'htn@gmail.com', 'pass000', 'member');

-- 2. MEMBERSHIP
INSERT INTO Customer.MEMBERSHIP (MemberID, Point, MemberRank, CUserID) VALUES
(1, 100, 2, 1),
(2, 500, 3, 2),
(3, 50, 1, 3),
(4, 1000, 4, 4),
(5, 200, 2, 5),
(6, 150, 2, 6),
(7, 300, 3, 7),
(8, 50, 1, 8),
(9, 400, 3, 9),
(10, 600, 4, 10),
(11, 250, 2, 11),
(12, 120, 2, 12),
(13, 500, 3, 13),
(14, 700, 4, 14),
(15, 80, 1, 15);

-- 3. BRANCH
INSERT INTO Cinema.BRANCH (BranchID, BName, BAddress) VALUES 
(1, 'CGV Vincom', 'Hanoi'),
(2, 'CGV Aeon', 'Ho Chi Minh'),
(3, 'CGV Royal', 'Da Nang'),
(4, 'CGV Crescent', 'Can Tho'),
(5, 'CGV Bitexco', 'Ho Chi Minh'),
(6, 'CGV Landmark', 'Ho Chi Minh'),
(7, 'CGV Lotte', 'Hanoi'),
(8, 'CGV Vincom Center', 'Da Nang'),
(9, 'CGV Aeon Mall', 'Binh Duong'),
(10, 'CGV Bitexco Tower', 'Ho Chi Minh'),
(11, 'CGV Royal City', 'Hanoi'),
(12, 'CGV Times City', 'Hanoi'),
(13, 'CGV Crescent Mall', 'Can Tho'),
(14, 'CGV Sun Plaza', 'Ha Long'),
(15, 'CGV Vincom Plaza', 'Hai Phong');

-- 4. BRANCHPHONENUMBER
INSERT INTO Cinema.BRANCHPHONENUMBER (BranchID, BPhoneNumber) VALUES
(1, '0241234567'),
(2, '0282345678'),
(3, '0236345678'),
(4, '0291234567'),
(5, '0289876543'),
(6, '0281112233'),
(7, '0243334455'),
(8, '0236667788'),
(9, '0277778899'),
(10, '0289990011'),
(11, '0245556677'),
(12, '0248889900'),
(13, '0292223344'),
(14, '0201112233'),
(15, '0223334455');

-- 5. EMPLOYEE
INSERT INTO Staff.EMPLOYEE (EUserID, EName, Sex, PhoneNumber, Email, EPassword, Salary, UserType, ManageID, BranchID) VALUES
(1, 'Nguyen Van Q', 'M', '0911222333', 'nvq@gmail.com', 'emp123', 1200, 'manager', NULL, 1),
(2, 'Tran Thi R', 'F', '0922333444', 'ttr@gmail.com', 'emp234', 800, 'staff', 1, 1),
(3, 'Le Van S', 'M', '0933444555', 'lvs@gmail.com', 'emp345', 900, 'staff', 1, 2),
(4, 'Pham Thi T', 'F', '0944555666', 'ptt@gmail.com', 'emp456', 850, 'staff', 1, 3),
(5, 'Hoang Van U', 'M', '0955666777', 'hvu@gmail.com', 'emp567', 1000, 'manager', NULL, 2),
(6, 'Le Thi O', 'F', '0911122334', 'lto@gmail.com', 'emp678', 900, 'staff', 1, 3),
(7, 'Tran Van P', 'M', '0922233445', 'tvp@gmail.com', 'emp789', 950, 'staff', 5, 2),
(8, 'Pham Thi Q', 'F', '0933344556', 'ptq@gmail.com', 'emp890', 800, 'staff', 1, 1),
(9, 'Hoang Van R', 'M', '0944455667', 'hvr@gmail.com', 'emp901', 1000, 'manager', NULL, 3),
(10, 'Nguyen Thi S', 'F', '0955566778', 'nts@gmail.com', 'emp012', 850, 'staff', 9, 3),
(11, 'Le Van T', 'M', '0966677889', 'lvt@gmail.com', 'emp123', 900, 'staff', 9, 3),
(12, 'Tran Thi U', 'F', '0977788990', 'ttu@gmail.com', 'emp234', 950, 'staff', 5, 2),
(13, 'Pham Van V', 'M', '0988899001', 'pvk@gmail.com', 'emp345', 1100, 'manager', NULL, 1),
(14, 'Hoang Thi W', 'F', '0999900112', 'htw@gmail.com', 'emp456', 870, 'staff', 13, 2),
(15, 'Nguyen Van X', 'M', '0900011223', 'nvx@gmail.com', 'emp567', 920, 'staff', 13, 2);

-- 6. WORKSHIFT
INSERT INTO Staff.WORKSHIFT (StartTime, EndTime, WDate, Work) VALUES
('08:00', '12:00', 1, 'Morning shift'),
('12:00', '16:00', 2, 'Afternoon shift'),
('16:00', '20:00', 3, 'Evening shift'),
('20:00', '00:00', 4, 'Night shift'),
('10:00', '14:00', 5, 'Late morning shift'),
('06:00', '10:00', 1, 'Early morning shift'),
('10:00', '14:00', 2, 'Late morning shift'),
('14:00', '18:00', 3, 'Afternoon shift'),
('18:00', '22:00', 4, 'Evening shift'),
('22:00', '02:00', 5, 'Late night shift'),
('07:00', '11:00', 6, 'Morning shift'),
('11:00', '15:00', 7, 'Noon shift'),
('15:00', '19:00', 1, 'Afternoon shift'),
('19:00', '23:00', 2, 'Night shift'),
('08:00', '12:00', 3, 'Morning shift');

-- 7. WORK
INSERT INTO Staff.WORK (EUserID, StartTime, EndTime, WDate) VALUES
(2, '08:00', '12:00', 1),
(3, '12:00', '16:00', 2),
(4, '16:00', '20:00', 3),
(2, '20:00', '00:00', 4),
(3, '10:00', '14:00', 5),
(6, '06:00', '10:00', 1),
(7, '10:00', '14:00', 2),
(8, '14:00', '18:00', 3),
(9, '18:00', '22:00', 4),
(10, '22:00', '02:00', 5),
(11, '07:00', '11:00', 6),
(12, '11:00', '15:00', 7),
(13, '15:00', '19:00', 1),
(14, '19:00', '23:00', 2),
(15, '08:00', '12:00', 3);


-- 8. SCREENROOM
INSERT INTO Cinema.SCREENROOM (BranchID, RoomID, RType, RCapacity) VALUES
(1, 1, '2D', 100),
(1, 2, '3D', 80),
(2, 1, 'IMAX', 150),
(2, 2, '2D', 100),
(2, 3, '3D', 80),
(3, 1, '2D', 90),
(3, 2, 'IMAX', 120),
(4, 1, '3D', 120),
(4, 2, '2D', 90),
(5, 1, '3D', 110),
(5, 2, '2D', 100),
(1, 3, '4DX', 70),
(2, 4, '4DX', 60),
(3, 3, 'VR', 50),
(4, 3, 'VR', 55);

-- 9. SEAT
INSERT INTO Cinema.SEAT (BranchID, RoomID, SRow, SColumn, SType, SStatus) VALUES
(1, 1, 1, 1, 0, 1),
(1, 1, 1, 2, 0, 1),
(1, 2, 1, 1, 1, 1),
(1, 2, 1, 2, 1, 1),
(2, 1, 1, 1, 0, 1),
(2, 1, 1, 2, 0, 1),
(2, 2, 1, 1, 0, 1),
(2, 3, 1, 1, 1, 1),
(3, 1, 1, 1, 0, 1),
(3, 2, 1, 1, 1, 1),
(4, 1, 1, 1, 0, 1),
(4, 2, 1, 1, 1, 1),
(5, 1, 1, 1, 0, 1),
(5, 2, 1, 1, 0, 1),
(1, 3, 1, 1, 1, 1);

-- 10. MOVIE
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

-- 11. GENRE
INSERT INTO Movie.GENRE (Genre) VALUES
('Action'), ('Drama'), ('Comedy'), ('Thriller'), ('Romance'),
('Sci-Fi'), ('Horror'), ('Musical'), ('Animation'), ('Fantasy'),
('Crime'), ('Documentary'), ('Adventure'), ('Mystery'), ('Action-Comedy');

-- 12. MOVIEGENRE
INSERT INTO Movie.MOVIEGENRE (MovieID, Genre) VALUES
(1, 'Action'),
(2, 'Thriller'),
(3, 'Romance'),
(4, 'Drama'),
(5, 'Action'),
(6, 'Sci-Fi'),
(7, 'Sci-Fi'),
(8, 'Crime'),
(9, 'Animation'),
(10, 'Action'),
(11, 'Sci-Fi'),
(12, 'Horror'),
(13, 'Musical'),
(14, 'Fantasy'),
(15, 'Action');

-- 13. FORMATS
INSERT INTO Movie.FORMATS (FName) VALUES
('2D'), ('3D'), ('IMAX'), ('4DX'), ('VR'), ('2D Premium'), ('3D Premium'), ('IMAX 3D'),
('Dolby Cinema'), ('ScreenX'), ('4DX Screen'), ('Premium VR'), ('D-Box');


-- 14. MOVIEFORMAT
INSERT INTO Movie.MOVIEFORMAT (MovieID, FName) VALUES
(1, '2D'),
(1, '3D'),
(2, 'IMAX'),
(3, '2D'),
(4, '3D'),
(6, 'IMAX'),
(6, '3D Premium'),
(7, '2D Premium'),
(8, '2D'),
(9, '3D'),
(10, 'IMAX 3D'),
(11, 'Dolby Cinema'),
(12, 'ScreenX'),
(13, '4DX Screen'),
(14, 'Premium VR');

-- 15. ACTOR
INSERT INTO Movie.ACTOR (FullName) VALUES
('Robert Downey Jr'), ('Leonardo DiCaprio'), ('Kate Winslet'), ('Joaquin Phoenix'), ('Tom Holland'),
('Samuel L. Jackson'), ('Chris Evans'), ('Scarlett Johansson'), ('Gal Gadot'), ('Chris Hemsworth'),
('Emma Watson'), ('Daniel Radcliffe'), ('Morgan Freeman'), ('Johnny Depp'), ('Brad Pitt');

-- 16. FEATURES
INSERT INTO Movie.FEATURES (MovieID, FullName) VALUES
(1, 'Robert Downey Jr'),
(2, 'Leonardo DiCaprio'),
(3, 'Kate Winslet'),
(4, 'Joaquin Phoenix'),
(5, 'Tom Holland'),
(6, 'Samuel L. Jackson'),
(7, 'Chris Evans'),
(8, 'Scarlett Johansson'),
(9, 'Gal Gadot'),
(10, 'Chris Hemsworth'),
(11, 'Emma Watson'),
(12, 'Daniel Radcliffe'),
(13, 'Morgan Freeman'),
(14, 'Johnny Depp'),
(15, 'Brad Pitt');

-- 17. REVIEW
INSERT INTO Movie.REVIEW (MovieID, CUserID, Rating, RDate, Comment) VALUES
(1, 1, 9, '2025-01-05', 'Great movie!'),
(2, 2, 8, '2025-02-10', 'Mind-blowing.'),
(3, 3, 7, '2025-03-15', 'Touching story.'),
(4, 4, 10, '2025-01-20', 'Amazing!'),
(5, 5, 8, '2025-02-25', 'Good action scenes.'),
(6, 6, 9, '2025-03-05', 'Amazing visuals!'),
(7, 7, 8, '2025-04-10', 'Epic story.'),
(8, 8, 10, '2025-05-15', 'Masterpiece!'),
(9, 9, 7, '2025-06-05', 'Fun for kids.'),
(10, 10, 8, '2025-07-10', 'Great action scenes.'),
(11, 11, 9, '2025-03-20', 'Classic sci-fi.'),
(12, 12, 7, '2025-04-25', 'Suspenseful.'),
(13, 13, 8, '2025-05-30', 'Beautiful animation.'),
(14, 14, 9, '2025-06-25', 'Enjoyable.'),
(15, 15, 8, '2025-07-30', 'Heroic adventure.');

-- 18. ORDERS
INSERT INTO Booking.ORDERS (OrderID, OrderTime, PaymentMethod, Total, CUserID, EUserID) VALUES
(1, '10:00', 'Cash', 250, 1, 2),
(2, '11:00', 'Card', 300, 2, 3),
(3, '12:00', 'Cash', 400, 3, 4),
(4, '13:00', 'Card', 500, 4, 5),
(5, '14:00', 'Cash', 350, 5, 2),
(6, '15:00', 'Card', 450, 6, 7),
(7, '16:00', 'Cash', 300, 7, 8),
(8, '17:00', 'Card', 500, 8, 9),
(9, '18:00', 'Cash', 350, 9, 10),
(10, '19:00', 'Card', 400, 10, 11),
(11, '20:00', 'Cash', 450, 11, 12),
(12, '21:00', 'Card', 550, 12, 13),
(13, '22:00', 'Cash', 500, 13, 14),
(14, '23:00', 'Card', 600, 14, 15),
(15, '08:00', 'Cash', 350, 15, 6);

-- 19. COUPON
INSERT INTO Booking.COUPON (CouponID, StartDate, EndDate, SaleOff, ReleaseNum, AvailNum) VALUES
(1, '2025-01-01', '2025-03-01', 10, 100, 50),
(2, '2025-01-05', '2025-03-05', 15, 200, 150),
(3, '2025-02-01', '2025-04-01', 20, 150, 100),
(4, '2025-02-10', '2025-04-10', 25, 50, 25),
(5, '2025-03-01', '2025-05-01', 30, 70, 30),
(6, '2025-03-01', '2025-06-01', 12, 100, 80),
(7, '2025-03-05', '2025-06-05', 15, 200, 150),
(8, '2025-04-01', '2025-07-01', 20, 150, 120),
(9, '2025-04-10', '2025-07-10', 25, 50, 40),
(10, '2025-05-01', '2025-08-01', 30, 70, 60),
(11, '2025-05-10', '2025-08-10', 10, 80, 70),
(12, '2025-06-01', '2025-09-01', 15, 60, 50),
(13, '2025-06-05', '2025-09-05', 20, 90, 80),
(14, '2025-07-01', '2025-10-01', 25, 100, 90),
(15, '2025-07-10', '2025-10-10', 30, 120, 100);

-- 20. OWN
INSERT INTO Booking.OWN (CUserID, CouponID, isUsed) VALUES
(1, 1, 0),
(2, 2, 0),
(3, 3, 0),
(4, 4, 0),
(5, 5, 0),
(6, 6, 0),
(7, 7, 0),
(8, 8, 0),
(9, 9, 0),
(10, 10, 0),
(11, 11, 0),
(12, 12, 0),
(13, 13, 0),
(14, 14, 0),
(15, 15, 0);

-- 21. COUPONUSAGE
INSERT INTO Booking.COUPONUSAGE (CouponID, OrderID, CUserID, UseDate) VALUES
(1, 1, 1, '2025-01-10'),
(2, 2, 2, '2025-02-15'),
(3, 3, 3, '2025-03-20'),
(4, 4, 4, '2025-02-25'),
(5, 5, 5, '2025-03-30'),
(6, 6, 6, '2025-03-10'),
(7, 7, 7, '2025-04-15'),
(8, 8, 8, '2025-05-20'),
(9, 9, 9, '2025-04-25'),
(10, 10, 10, '2025-05-30'),
(11, 11, 11, '2025-06-10'),
(12, 12, 12, '2025-07-15'),
(13, 13, 13, '2025-07-20'),
(14, 14, 14, '2025-08-10'),
(15, 15, 15, '2025-08-25');

-- 22. TIME
INSERT INTO Screening.TIME (TimeID, Day, StartTime, EndTime, FName, MovieID, RoomID, BranchID) VALUES
(1, '2025-01-10', '10:00', '12:00', '2D', 1, 1, 1),
(2, '2025-01-10', '12:30', '14:30', '3D', 1, 2, 1),
(3, '2025-01-11', '15:00', '17:30', 'IMAX', 2, 1, 2),
(4, '2025-01-12', '18:00', '20:00', '2D', 3, 1, 3),
(5, '2025-01-13', '20:30', '22:30', '3D', 4, 1, 4),
(6, '2025-01-14', '10:00', '12:30', '2D', 5, 2, 2),
(7, '2025-01-15', '13:00', '15:30', '3D', 5, 3, 2),
(8, '2025-01-16', '16:00', '18:30', 'IMAX', 6, 2, 3),
(9, '2025-01-17', '19:00', '21:30', '2D', 7, 1, 4),
(10, '2025-01-18', '14:00', '16:30', '3D', 8, 2, 5),
(11, '2025-01-19', '15:00', '17:30', '4DX', 9, 3, 1),
(12, '2025-01-20', '18:00', '20:30', 'VR', 10, 3, 3),
(13, '2025-01-21', '20:00', '22:30', '2D', 11, 1, 5),
(14, '2025-01-22', '11:00', '13:30', '3D', 12, 2, 1),
(15, '2025-01-23', '12:00', '14:30', 'IMAX', 13, 1, 2);

-- 23. TICKETS
INSERT INTO Screening.TICKETS (TicketID, DaySold, TimeID, OrderID, BranchID, RoomID, SRow, SColumn) VALUES
(1, '2025-01-10', 1, 1, 1, 1, 1, 1),
(2, '2025-01-10', 1, 2, 1, 1, 1, 2),
(3, '2025-01-10', 2, 3, 1, 2, 1, 1),
(4, '2025-01-10', 2, 4, 1, 2, 1, 2),
(5, '2025-01-11', 3, 5, 2, 1, 1, 1),
(6, '2025-01-11', 3, 6, 2, 1, 1, 2),
(7, '2025-01-12', 4, 7, 3, 1, 1, 1),
(8, '2025-01-12', 4, 8, 3, 2, 1, 1),
(9, '2025-01-13', 5, 9, 4, 1, 1, 1),
(10, '2025-01-13', 5, 10, 4, 2, 1, 1),
(11, '2025-01-14', 6, 11, 2, 2, 1, 1),
(12, '2025-01-15', 7, 12, 2, 3, 1, 1),
(13, '2025-01-16', 8, 13, 3, 2, 1, 1),
(14, '2025-01-17', 9, 14, 4, 1, 1, 1),
(15, '2025-01-18', 10, 15, 5, 2, 1, 1);

-- 24. ADDONITEM
INSERT INTO Products.ADDONITEM (ProductID, Price, ItemType, OrderID) VALUES
(1, 50, 'Popcorn', 1),
(2, 30, 'Drink', 2),
(3, 100, 'Combo', 3),
(4, 80, 'Snack', 4),
(5, 60, 'Drink', 5),
(6, 70, 'Popcorn', 6),
(7, 40, 'Drink', 7),
(8, 120, 'Combo', 8),
(9, 90, 'Snack', 9),
(10, 60, 'Drink', 10),
(11, 80, 'Popcorn', 11),
(12, 50, 'Drink', 12),
(13, 150, 'Combo', 13),
(14, 100, 'Snack', 14),
(15, 70, 'Drink', 15);

-- 25. FOODDRINK
INSERT INTO Products.FOODDRINK (ProductID, PType, PName, Quantity) VALUES
(1, 'Snack', 'Popcorn Large', 2),
(2, 'Drink', 'Coke', 1),
(3, 'Combo', 'Popcorn + Coke', 1),
(4, 'Snack', 'Nachos', 3),
(5, 'Drink', 'Pepsi', 2),
(6, 'Snack', 'Popcorn Medium', 2),
(7, 'Drink', 'Sprite', 1),
(8, 'Combo', 'Popcorn + Fanta', 1),
(9, 'Snack', 'Chips', 3),
(10, 'Drink', '7Up', 2),
(11, 'Snack', 'Popcorn Small', 1),
(12, 'Drink', 'Orange Juice', 2),
(13, 'Combo', 'Nachos + Coke', 1),
(14, 'Snack', 'Pretzel', 2),
(15, 'Drink', 'Lemonade', 1);


-- 26. MERCHANDISE
INSERT INTO Products.MERCHANDISE (ProductID, AvailNum, MerchName, StartDate, EndDate) VALUES
(1, 20, 'T-shirt Avengers', '2025-01-01', '2025-03-01'),
(2, 15, 'Cap Inception', '2025-02-01', '2025-04-01'),
(3, 30, 'Poster Titanic', '2025-03-01', '2025-06-01'),
(4, 10, 'Mug Joker', '2025-01-15', '2025-03-15'),
(5, 25, 'Action Figure Spiderman', '2025-02-10', '2025-04-10'),
(6, 25, 'Poster Avatar', '2025-03-01', '2025-06-01'),
(7, 20, 'T-shirt Interstellar', '2025-04-01', '2025-07-01'),
(8, 15, 'Mug Godfather', '2025-05-01', '2025-08-01'),
(9, 30, 'Figurine Frozen', '2025-06-01', '2025-09-01'),
(10, 18, 'Poster Black Panther', '2025-07-01', '2025-10-01'),
(11, 22, 'T-shirt Matrix', '2025-03-15', '2025-06-15'),
(12, 16, 'Cap Jaws', '2025-04-10', '2025-07-10'),
(13, 28, 'Poster Lion King', '2025-05-10', '2025-08-10'),
(14, 12, 'Mug Thor', '2025-06-15', '2025-09-15'),
(15, 20, 'Action Figure Wonder Woman', '2025-07-20', '2025-10-20');


SELECT * FROM Customer.CUSTOMER;
SELECT * FROM Customer.MEMBERSHIP;
SELECT * FROM Cinema.BRANCH;
SELECT * FROM Cinema.BRANCHPHONENUMBER;
SELECT * FROM Staff.EMPLOYEE;
SELECT * FROM Staff.WORKSHIFT;
SELECT * FROM Staff.WORK;
SELECT * FROM Cinema.SCREENROOM;
SELECT * FROM Cinema.SEAT;
SELECT * FROM Movie.MOVIE;
SELECT * FROM Movie.GENRE;
SELECT * FROM Movie.MOVIEGENRE;
SELECT * FROM Movie.FORMATS;
SELECT * FROM Movie.MOVIEFORMAT;
SELECT * FROM Movie.ACTOR;
SELECT * FROM Movie.FEATURES;
SELECT * FROM Movie.REVIEW;
SELECT * FROM Booking.ORDERS;
SELECT * FROM Booking.COUPON;
SELECT * FROM Booking.OWN;
SELECT * FROM Booking.COUPONUSAGE;
SELECT * FROM Screening.TIME;
SELECT * FROM Screening.TICKETS;
SELECT * FROM Products.ADDONITEM;
SELECT * FROM Products.FOODDRINK;
SELECT * FROM Products.MERCHANDISE;

--Stored Produced: INSERT/UPDATE/DELETE