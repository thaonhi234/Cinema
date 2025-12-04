/* ASSIGNMENT 2 - PART 2: PROGRAMMABILITY & SECURITY 
   VERSION: BULLETPROOF (DROP IF EXISTS -> CREATE)
*/

USE CGV;
GO

-----------------------------------------------------------
-- I. FUNCTIONS (2.0 Points)
-----------------------------------------------------------

-- 1. Tính tổng chi tiêu
IF OBJECT_ID('dbo.func_CalculateTotalSpent', 'FN') IS NOT NULL
    DROP FUNCTION dbo.func_CalculateTotalSpent;
GO

CREATE FUNCTION dbo.func_CalculateTotalSpent (@CUserID VARCHAR(20)) 
RETURNS DECIMAL(10, 2)
AS
BEGIN
    DECLARE @TotalSpent DECIMAL(10, 2);
    SELECT @TotalSpent = SUM(Total)
    FROM Booking.ORDERS
    WHERE CUserID = @CUserID;
    RETURN ISNULL(@TotalSpent, 0);
END
GO

-- 2. Lấy danh sách phim theo thể loại
IF OBJECT_ID('Movie.func_GetMoviesByGenre', 'IF') IS NOT NULL
    DROP FUNCTION Movie.func_GetMoviesByGenre;
GO

CREATE FUNCTION Movie.func_GetMoviesByGenre (@GenreInput NVARCHAR(30))
RETURNS TABLE
AS
RETURN (
    SELECT m.MName, m.RunTime, m.AgeRating, m.releaseDate
FROM Movie.MOVIE m
    JOIN Movie.MOVIEGENRE mg ON m.MovieID = mg.MovieID
WHERE mg.Genre = @GenreInput
)
GO

-----------------------------------------------------------
-- II. STORED PROCEDURES (2.0 Points)
-----------------------------------------------------------

-- 1. Thêm phim mới
IF OBJECT_ID('Movie.sp_AddNewMovie', 'P') IS NOT NULL
    DROP PROCEDURE Movie.sp_AddNewMovie;
GO

CREATE PROCEDURE Movie.sp_AddNewMovie
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

    INSERT INTO Movie.MOVIE
        (MovieID, MName, Descript, RunTime, isDub, isSub, releaseDate, closingDate, AgeRating)
    VALUES
        (@MovieID, @MName, N'No description', @RunTime, 1, 1, @ReleaseDate, @ClosingDate, @AgeRating);

    PRINT 'Movie added successfully!';
END
GO

-- 2. Báo cáo doanh thu
IF OBJECT_ID('Booking.sp_GetMonthlyRevenue', 'P') IS NOT NULL
    DROP PROCEDURE Booking.sp_GetMonthlyRevenue;
GO

CREATE PROCEDURE Booking.sp_GetMonthlyRevenue
    @BranchID INT,
    @Month INT,
    @Year INT
AS
BEGIN
    SELECT
        b.BName,
        @Month AS [Month],
        @Year AS [Year],
        SUM(o.Total) AS TotalRevenue
    FROM Booking.ORDERS o
        JOIN Screening.TICKETS t ON o.OrderID = t.OrderID
        JOIN Cinema.BRANCH b ON t.BranchID = b.BranchID
    WHERE b.BranchID = @BranchID
        AND MONTH(t.DaySold) = @Month
        AND YEAR(t.DaySold) = @Year
    GROUP BY b.BName;
END
GO

-----------------------------------------------------------
-- III. TRIGGERS (1.0 Point)
-----------------------------------------------------------

-- 1. Trigger Update Member Point
IF OBJECT_ID('trg_UpdateMemberPoint', 'TR') IS NOT NULL
    DROP TRIGGER trg_UpdateMemberPoint;
GO

CREATE TRIGGER trg_UpdateMemberPoint
ON Booking.ORDERS
AFTER INSERT
AS
BEGIN
    DECLARE @CUserID VARCHAR(20);
    DECLARE @NewPoints INT;
    DECLARE @TotalMoney DECIMAL(10,2);

    SELECT @CUserID = CUserID, @TotalMoney = Total
    FROM inserted;
    SET @NewPoints = CAST(@TotalMoney / 10 AS INT);

    UPDATE Customer.MEMBERSHIP 
    SET Point = Point + @NewPoints 
    WHERE CUserID = @CUserID;

    UPDATE Customer.MEMBERSHIP 
    SET MemberRank = CASE 
        WHEN Point >= 1000 THEN 4
        WHEN Point >= 500 THEN 3
        WHEN Point >= 200 THEN 2
        ELSE MemberRank END
    WHERE CUserID = @CUserID;
END
GO

-- 2. Trigger Prevent Delete Movie
IF OBJECT_ID('trg_PreventDeleteActiveMovie', 'TR') IS NOT NULL
    DROP TRIGGER trg_PreventDeleteActiveMovie;
GO

CREATE TRIGGER trg_PreventDeleteActiveMovie
ON Movie.MOVIE
FOR DELETE
AS
BEGIN
    IF EXISTS (SELECT 1
    FROM Screening.TIME t JOIN deleted d ON t.MovieID = d.MovieID)
    BEGIN
        PRINT 'Error: Cannot delete movie because it has scheduled screenings.';
        ROLLBACK TRANSACTION;
    END
END
GO

-----------------------------------------------------------
-- IV. SECURITY - CREATE USER (PART 3.I)
-----------------------------------------------------------

-- 1. Tạo Login (Nếu chưa có)
IF NOT EXISTS (SELECT *
FROM sys.server_principals
WHERE name = 'sManager')
BEGIN
    CREATE LOGIN sManager WITH PASSWORD = 'StrongPassword123!', CHECK_POLICY = OFF;
END
GO

-- 2. Tạo User (Xóa cũ tạo mới)
USE CGV;
GO

IF EXISTS (SELECT *
FROM sys.database_principals
WHERE name = 'sManager')
BEGIN
    DROP USER sManager;
END
GO

CREATE USER sManager FOR LOGIN sManager;
GO

-- 3. Cấp quyền DBA
ALTER ROLE db_owner ADD MEMBER sManager;
GO

PRINT '=== PART 2 & SECURITY COMPLETED SUCCESSFULLY! ===';