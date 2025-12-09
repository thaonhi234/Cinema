USE CGV;
GO

-- Bổ sung định dạng 2D
IF NOT EXISTS (SELECT 1 FROM Movie.FORMATS WHERE FName = '2D')
    INSERT INTO Movie.FORMATS (FName) VALUES ('2D');

-- Bổ sung định dạng 3D
IF NOT EXISTS (SELECT 1 FROM Movie.FORMATS WHERE FName = '3D')
    INSERT INTO Movie.FORMATS (FName) VALUES ('3D');

-- Kiểm tra lại xem đã có chưa
SELECT * FROM Movie.FORMATS;