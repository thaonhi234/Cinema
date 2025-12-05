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

--1. INSERT(Thêm phim mới)
CREATE OR ALTER PROCEDURE newMovie(
	@id	AS INT,
	@name AS VARCHAR(30),
	@descript AS NVARCHAR(MAX),
	@runtime AS TINYINT,
	@dub AS BIT,
	@sub AS BIT,
	@release AS DATE,
	@closing AS DATE,
	@agerating VARCHAR(30)
)
AS
BEGIN
	IF (@release >= @closing)
	BEGIN
		THROW 50001, 'Release date must be earlier than closing date.', 1;
	END

	IF (@release < CAST(GETDATE() AS DATE))
	BEGIN
		THROW 50002, 'Release date cannot be in the past.', 1;
	END

	INSERT INTO Movie.MOVIE (MovieID, MName, Descript, RunTime, isDub, isSub, releaseDate, closingDate, AgeRating)
						VALUES (  @id,  @name, @descript, @runtime, @dub, @sub, @release, @closing, @agerating);
END;

EXEC newMovie 16, 'Superman', 'DC Superhero', 130, 1, 1, '2026-07-11', '2026-08-01', '16+';
EXEC newMovie 17, 'Doraemon', 'Animation', 100, 0, 0, '2025-08-01', '2025-07-11', '15+';
EXEC newMovie 17, 'Doraemon', 'Animation', 100, 0, 0, '2025-07-11', '2025-08-01', '15+';

--2. UPDATE (Kéo dài thời gian công chiếu)
CREATE OR ALTER PROCEDURE extendMovie(
	@id	AS INT,
	@extendtime AS TINYINT
)
AS
BEGIN
	UPDATE Movie.MOVIE
	SET
		closingDate = DATEADD(DAY, @extendtime, closingDate)
	WHERE MovieID = @id;
END;

EXEC extendMovie 16, 7;

--3. DELETE
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

	DELETE FROM Movie.MOVIE
	WHERE MovieID = @id;
END;

--3.1. Cố định ngày hiện tại để làm ví dụ minh hoạ
CREATE OR ALTER PROCEDURE deleteMovie(
	@id AS INT
)
AS
BEGIN
	SET NOCOUNT ON;

	IF NOT EXISTS (SELECT 1 FROM Movie.MOVIE WHERE MovieID = @id)
	BEGIN
		THROW 50001, 'Movie does not exist.', 1;
	END

	IF EXISTS (
		SELECT 1
		FROM Movie.MOVIE
		WHERE MovieID = @id AND closingDate >= CAST('2026-08-30' AS DATE)
	)
	BEGIN
		THROW 50002, 'Movie that are currently showing cannot be deleted.', 1;
	END

	DELETE FROM Movie.MOVIE
	WHERE MovieID = @id;
END;

EXEC deleteMovie 16;

--4. Danh sách và số lượng nhân viên trong 1 chi nhánh
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

EXEC empList 1;
--5. Danh sách phim lọc theo rating và lượng review
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

EXEC movieList 1, 8;
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
