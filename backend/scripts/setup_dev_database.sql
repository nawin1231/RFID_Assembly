-- Task 1, Step 3: create db_rfid_assembly_dev and restore schema + SPs.
-- Generated from backend/backup_DB_SP/*.sql. Review before running (per project convention:
-- schema changes are approved, not auto-run). Safe to re-run from a clean DB; not idempotent
-- against an existing db_rfid_assembly_dev with data.

-- =====================================================================
-- 0. Create database
-- =====================================================================
IF DB_ID('db_rfid_assembly_dev') IS NULL
BEGIN
    CREATE DATABASE db_rfid_assembly_dev;
END
GO

USE [db_rfid_assembly_dev]
GO

-- =====================================================================
-- 1. Tables, in FK-safe order
-- =====================================================================

CREATE TABLE [dbo].[tb_master_process](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[process_code] [varchar](10) NOT NULL,
	[process_name] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[tb_master_assy_status](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[status] [varchar](50) NULL,
	[label_status] [varchar](50) NULL,
	[process_id] [int] NULL,
 CONSTRAINT [PK_tb_master_assy_status] PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tb_master_assy_status]  WITH CHECK ADD  CONSTRAINT [FK_status_process] FOREIGN KEY([process_id])
REFERENCES [dbo].[tb_master_process] ([id])
GO
ALTER TABLE [dbo].[tb_master_assy_status] CHECK CONSTRAINT [FK_status_process]
GO

CREATE TABLE [dbo].[tb_assy_lot](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[lot_no] [varchar](15) NOT NULL,
	[wos] [varchar](10) NULL,
	[qty] [int] NULL,
	[tag_id] [varchar](50) NULL,
	[status_id] [int] NULL,
	[location_name] [varchar](100) NULL,
	[machine_no] [varchar](30) NULL,
	[emp_id] [varchar](10) NULL,
	[remark] [varchar](255) NULL,
	[cleared_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[created_at] [datetime] NULL,
 CONSTRAINT [PK_tb_assy_lot] PRIMARY KEY CLUSTERED ([id] ASC),
 CONSTRAINT [UQ_tb_assy_lot_lot_no] UNIQUE NONCLUSTERED ([lot_no] ASC)
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tb_assy_lot] ADD DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[tb_assy_lot] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[tb_assy_lot]  WITH CHECK ADD  CONSTRAINT [FK_assy_lot_status] FOREIGN KEY([status_id])
REFERENCES [dbo].[tb_master_assy_status] ([id])
GO
ALTER TABLE [dbo].[tb_assy_lot] CHECK CONSTRAINT [FK_assy_lot_status]
GO

CREATE TABLE [dbo].[tb_assy_tag](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[tag_id] [varchar](50) NOT NULL,
	[lot_no] [varchar](15) NULL,
	[status] [varchar](20) NULL,
	[registered_at] [datetime] NULL,
	[cleared_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tb_assy_tag] ADD DEFAULT ('active') FOR [status]
GO
ALTER TABLE [dbo].[tb_assy_tag] ADD DEFAULT (getdate()) FOR [registered_at]
GO

CREATE TABLE [dbo].[tb_assy_wos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[wos] [varchar](10) NOT NULL,
	[brg_type] [varchar](30) NULL,
	[spec] [varchar](15) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([id] ASC),
UNIQUE NONCLUSTERED ([wos] ASC)
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tb_assy_wos] ADD DEFAULT (getdate()) FOR [created_at]
GO

CREATE TABLE [dbo].[tb_assy_login](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[emp_id] [varchar](10) NULL,
	[eng_name] [varchar](100) NULL,
	[eng_surname] [varchar](100) NULL,
	[password] [varchar](50) NULL,
	[position] [varchar](50) NULL,
 CONSTRAINT [PK_tb_assy_login] PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[tb_assy_log](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[lot_no] [varchar](15) NULL,
	[tag_id] [varchar](50) NULL,
	[event_type] [varchar](50) NULL,
	[location_name] [varchar](100) NULL,
	[machine_no] [varchar](30) NULL,
	[emp_id] [varchar](10) NULL,
	[remark] [varchar](255) NULL,
	[created_at] [datetime] NULL,
 CONSTRAINT [PK_tb_assy_log] PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tb_assy_log] ADD DEFAULT (getdate()) FOR [created_at]
GO

CREATE TABLE [dbo].[tb_assy_api_log](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[api_type] [varchar](50) NULL,
	[method] [varchar](10) NULL,
	[url] [varchar](255) NULL,
	[request_params] [varchar](255) NULL,
	[request_body] [varchar](255) NULL,
	[http_status] [int] NULL,
	[status] [varchar](20) NULL,
	[response] [varchar](255) NULL,
	[error_msg] [varchar](255) NULL,
	[response_time_ms] [int] NULL,
	[created_at] [datetime] NULL,
 CONSTRAINT [PK_tb_assy_api_log] PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tb_assy_api_log] ADD DEFAULT (getdate()) FOR [created_at]
GO

CREATE TABLE [dbo].[tb_assy_mock_as400](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[lot_no] [varchar](15) NULL,
	[wos] [varchar](10) NULL,
	[brg_type] [varchar](30) NULL,
	[spec] [varchar](15) NULL,
	[qty] [int] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tb_assy_mock_as400] ADD DEFAULT (getdate()) FOR [created_at]
GO

CREATE TABLE [dbo].[tb_assy_mock_done](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[lot_no] [varchar](15) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tb_assy_mock_done] ADD DEFAULT (getdate()) FOR [created_at]
GO

-- =====================================================================
-- 2. Stored procedures (27 live SPs; the 3 dead ones are not ported —
--    Stored_tb_assy_in_assy, Stored_tb_assy_wip_gauging,
--    Stored_tb_assy_mock_as400_select. See plan Decisions Log.)
-- =====================================================================

CREATE PROCEDURE [dbo].[Stored_tb_assy_api_log_insert]
    @api_type VARCHAR(50), @method VARCHAR(10), @url VARCHAR(500),
    @request_params VARCHAR(500), @request_body VARCHAR(MAX),
    @http_status INT, @status VARCHAR(50),
    @response VARCHAR(MAX), @error_msg VARCHAR(500), @response_time_ms INT
AS BEGIN
    SET NOCOUNT ON;
    INSERT INTO tb_assy_api_log
    (api_type, method, url, request_params, request_body, http_status, status, response, error_msg, response_time_ms)
    VALUES
    (@api_type, @method, @url, @request_params, @request_body, @http_status, @status, @response, @error_msg, @response_time_ms)
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_change_process]
    @tag_id        VARCHAR(50),
    @status_id     INT,
    @location_name VARCHAR(100) = NULL,
    @remark        VARCHAR(500) = NULL,
    @emp_id        VARCHAR(50)  = NULL
AS BEGIN
    SET NOCOUNT ON;

    DECLARE @lot_no VARCHAR(15)

    SELECT @lot_no = lot_no FROM tb_assy_lot WHERE tag_id = @tag_id

    IF @lot_no IS NULL
    BEGIN SELECT 'TAG_NOT_FOUND' AS result RETURN END

    IF NOT EXISTS (SELECT 1 FROM tb_master_assy_status WHERE id = @status_id)
    BEGIN SELECT 'INVALID_STATUS' AS result RETURN END

    IF (SELECT status_id FROM tb_assy_lot WHERE tag_id = @tag_id) = 4
    BEGIN SELECT 'ALREADY_COMPLETED' AS result RETURN END

    IF (SELECT status_id FROM tb_assy_lot WHERE tag_id = @tag_id) = @status_id
    BEGIN SELECT 'SAME_STATUS' AS result RETURN END

    UPDATE tb_assy_lot SET
        status_id     = @status_id,
        location_name = @location_name,
        remark        = @remark,
        emp_id        = @emp_id,
        updated_at    = GETDATE()
    WHERE tag_id = @tag_id

    INSERT INTO tb_assy_log (lot_no, tag_id, event_type, location_name, remark, emp_id)
    VALUES (@lot_no, @tag_id, 'CHANGE_PROCESS', @location_name, @remark, @emp_id)

    SELECT 'OK' AS result
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_clear_tag_history]
    @date_from DATE = NULL,
    @date_to   DATE = NULL,
    @search    VARCHAR(50) = NULL
AS BEGIN
    SET NOCOUNT ON;
    -- Escape LIKE wildcards so user input matches literally
    DECLARE @pattern VARCHAR(160) = CASE WHEN NULLIF(LTRIM(RTRIM(@search)), '') IS NULL THEN NULL
        ELSE '%' + REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(@search)),
            '\', '\\'), '%', '\%'), '_', '\_'), '[', '\[') + '%' END;

    SELECT TOP 200
        l.lot_no, l.tag_id, l.emp_id, l.remark,
        l.cleared_at, l.updated_at,
        w.brg_type, w.spec
    FROM tb_assy_lot l
    LEFT JOIN tb_assy_wos w ON w.wos = l.wos
    WHERE l.status_id = 4
        AND (@date_from IS NULL OR CAST(l.cleared_at AS DATE) >= @date_from)
        AND (@date_to   IS NULL OR CAST(l.cleared_at AS DATE) <= @date_to)
        AND (@pattern IS NULL
            OR l.lot_no   LIKE @pattern ESCAPE '\'
            OR l.tag_id   LIKE @pattern ESCAPE '\'
            OR l.emp_id   LIKE @pattern ESCAPE '\'
            OR w.brg_type LIKE @pattern ESCAPE '\')
    ORDER BY l.cleared_at DESC
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_completed]
    @lot_no    VARCHAR(15),
    @remark    VARCHAR(500) = NULL,
    @emp_id    VARCHAR(50)  = NULL,
    @machine_no VARCHAR(30) = NULL
AS BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM tb_master_assy_status WHERE id = 4)
    BEGIN SELECT 'INVALID_STATUS' AS result RETURN END

    DECLARE @tag_id VARCHAR(50)
    SELECT @tag_id = tag_id FROM tb_assy_lot WHERE lot_no = @lot_no

    IF @tag_id IS NULL
    BEGIN SELECT 'LOT_NOT_FOUND' AS result RETURN END

	IF (SELECT status_id FROM tb_assy_lot WHERE lot_no = @lot_no) != 3
	BEGIN SELECT 'INVALID_PROCESS' AS result RETURN END

    UPDATE tb_assy_lot SET
        status_id  = 4,
        cleared_at = GETDATE(),
        updated_at = GETDATE(),
        remark     = @remark,
        emp_id     = @emp_id,
        machine_no = @machine_no
    WHERE lot_no = @lot_no

    UPDATE tb_assy_tag SET
        status     = 'cleared',
        cleared_at = GETDATE()
    WHERE lot_no = @lot_no AND status = 'active'

    INSERT INTO tb_assy_log (lot_no, tag_id, event_type, remark, emp_id, machine_no)
    VALUES (@lot_no, @tag_id, 'COMPLETED', @remark, @emp_id, @machine_no)

    SELECT 'OK' AS result
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_dashboard]
    @date_from  DATE        = NULL,
    @date_to    DATE        = NULL,
    @brg_type   VARCHAR(30) = NULL,
    @wos        VARCHAR(10) = NULL,
    @lot_no     VARCHAR(15) = NULL,
    @status_id  INT         = NULL
AS BEGIN
    SET NOCOUNT ON;

    SELECT
        SUM(CASE WHEN l.status_id != 4 THEN l.qty ELSE 0 END)        AS total_qty,
        SUM(CASE WHEN l.status_id = 1 THEN l.qty ELSE 0 END)         AS bf_issue,
        SUM(CASE WHEN l.status_id = 2 THEN l.qty ELSE 0 END)         AS gr_f1,
        SUM(CASE WHEN l.status_id = 3 THEN l.qty ELSE 0 END)         AS mc_f1
    FROM tb_assy_lot l
    LEFT JOIN tb_assy_wos w ON w.wos = l.wos
    WHERE
        (@date_from IS NULL OR CAST(l.created_at AS DATE) >= @date_from)
        AND (@date_to   IS NULL OR CAST(l.created_at AS DATE) <= @date_to)
        AND (@brg_type  IS NULL OR w.brg_type LIKE '%' + @brg_type + '%')
        AND (@wos       IS NULL OR l.wos      LIKE '%' + @wos      + '%')
        AND (@lot_no    IS NULL OR l.lot_no   LIKE '%' + @lot_no   + '%')
        AND (@status_id IS NULL OR l.status_id = @status_id);

    SELECT TOP 5
        w.brg_type,
        COUNT(*) AS total_qty
    FROM tb_assy_lot l
    LEFT JOIN tb_assy_wos w ON w.wos = l.wos
    WHERE l.status_id != 4
        AND (@date_from IS NULL OR CAST(l.created_at AS DATE) >= @date_from)
        AND (@date_to   IS NULL OR CAST(l.created_at AS DATE) <= @date_to)
        AND (@status_id IS NULL OR l.status_id = @status_id)
    GROUP BY w.brg_type
    ORDER BY total_qty DESC;

    SELECT TOP 200
        l.tag_id, l.lot_no, l.wos, l.qty,
        l.status_id, m.label_status,
        w.brg_type, w.spec,
        l.location_name, l.machine_no,
        l.created_at, l.updated_at
    FROM tb_assy_lot l
    LEFT JOIN tb_assy_wos w ON w.wos = l.wos
    LEFT JOIN tb_master_assy_status m ON m.id = l.status_id
    WHERE l.status_id != 4
        AND (@date_from IS NULL OR CAST(l.created_at AS DATE) >= @date_from)
        AND (@date_to   IS NULL OR CAST(l.created_at AS DATE) <= @date_to)
        AND (@brg_type  IS NULL OR w.brg_type LIKE '%' + @brg_type + '%')
        AND (@wos       IS NULL OR l.wos      LIKE '%' + @wos      + '%')
        AND (@lot_no    IS NULL OR l.lot_no   LIKE '%' + @lot_no   + '%')
        AND (@status_id IS NULL OR l.status_id = @status_id)
    ORDER BY l.updated_at DESC;
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_dashboard_history]
    @date_from     DATE        = NULL,
    @date_to       DATE        = NULL,
    @brg_type      VARCHAR(30) = NULL,
    @wos           VARCHAR(10) = NULL,
    @lot_no        VARCHAR(15) = NULL,
    @status_id     INT         = NULL,
    @location_name VARCHAR(100) = NULL
AS BEGIN
    SET NOCOUNT ON;
    SELECT TOP 200
        l.tag_id, l.lot_no, l.wos, l.qty,
        l.status_id, m.label_status,
        w.brg_type, w.spec,
        l.location_name, l.machine_no,
        l.emp_id, l.remark,
        l.created_at, l.updated_at
    FROM tb_assy_lot l
    LEFT JOIN tb_assy_wos w ON w.wos = l.wos
    LEFT JOIN tb_master_assy_status m ON m.id = l.status_id
    WHERE l.status_id != 4
        AND (@date_from     IS NULL OR CAST(l.created_at AS DATE) >= @date_from)
        AND (@date_to       IS NULL OR CAST(l.created_at AS DATE) <= @date_to)
        AND (@brg_type      IS NULL OR w.brg_type      LIKE '%' + @brg_type      + '%')
        AND (@wos           IS NULL OR l.wos            LIKE '%' + @wos           + '%')
        AND (@lot_no        IS NULL OR l.lot_no         LIKE '%' + @lot_no        + '%')
        AND (@status_id     IS NULL OR l.status_id       = @status_id)
        AND (@location_name IS NULL OR l.location_name  LIKE '%' + @location_name + '%')
    ORDER BY l.updated_at DESC
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_dashboard_process_summary]
AS BEGIN
    SET NOCOUNT ON;

    SELECT
        p.process_code,
        p.process_name,
        ISNULL(SUM(l.qty), 0) AS inventory_qty
    FROM tb_master_process p
    LEFT JOIN tb_master_assy_status s ON s.process_id = p.id
    LEFT JOIN tb_assy_lot l ON l.status_id = s.id AND l.status_id != 4
    GROUP BY p.id, p.process_code, p.process_name
    ORDER BY p.process_code ASC
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_gauging_room_f1]
    @tag_id        VARCHAR(50),
    @location_name VARCHAR(100) = NULL
AS BEGIN
    SET NOCOUNT ON;

    DECLARE @lot_no    VARCHAR(15)
    DECLARE @status_id INT

    SELECT @lot_no = lot_no, @status_id = status_id
    FROM tb_assy_lot WHERE tag_id = @tag_id

    IF @lot_no IS NULL
    BEGIN SELECT 'TAG_NOT_FOUND' AS result RETURN END

    IF @status_id != 1
    BEGIN SELECT 'INVALID_PROCESS' AS result RETURN END

    IF NOT EXISTS (SELECT 1 FROM tb_master_assy_status WHERE id = 2)
    BEGIN SELECT 'INVALID_STATUS' AS result RETURN END

    UPDATE tb_assy_lot SET
        status_id     = 2,
        location_name = @location_name,
        updated_at    = GETDATE()
    WHERE tag_id = @tag_id

    INSERT INTO tb_assy_log (lot_no, tag_id, event_type, location_name)
    VALUES (@lot_no, @tag_id, 'GAUGING_ROOM_F1', @location_name)

    SELECT 'OK' AS result
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_login_delete]
	@id INT
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
	   DELETE FROM tb_assy_login WHERE id = @id
	   SELECT 'OK' AS result
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS result
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_login_insert]
	@emp_id varchar(10),
    @eng_name NVARCHAR(100),
    @eng_surname NVARCHAR(100),
    @password NVARCHAR(50),
    @position NVARCHAR(50)
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
	   INSERT INTO tb_assy_login (
	   emp_id, eng_name, eng_surname,
	   password, position )
	   VALUES (@emp_id, @eng_name, @eng_surname,
	   @password,@position)
	SELECT 'OK' AS result
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS result
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_login_select]
AS
BEGIN
	SET NOCOUNT ON;
	SELECT  id,
			emp_id,
			eng_name,
			eng_surname,
			position
			From tb_assy_login
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_login_update]
	@id INT,
    @eng_name NVARCHAR(50),
    @eng_surname NVARCHAR(50),
    @position NVARCHAR(100)
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
	   UPDATE tb_assy_login SET
	   eng_name = @eng_name, eng_surname = @eng_surname,
		position = @position
	   WHERE id = @id
	SELECT 'OK' AS result
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS result
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_login_verify]
	@emp_id varchar(10),
	@password varchar(50)
AS
BEGIN
	SET NOCOUNT ON;
	SELECT
		id, emp_id, eng_name, eng_surname, position
	FROM tb_assy_login
		WHERE emp_id = @emp_id AND password = @password
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_lot_by_tag]
    @tag_id VARCHAR(50) = NULL,
    @lot_no VARCHAR(15) = NULL
AS BEGIN
    SET NOCOUNT ON;
    SELECT l.lot_no, l.wos, l.qty, l.tag_id, l.status_id,
           w.brg_type, w.spec
    FROM tb_assy_lot l
    LEFT JOIN tb_assy_wos w ON w.wos = l.wos
    WHERE l.status_id != 4
        AND (
            (@tag_id IS NOT NULL AND l.tag_id = @tag_id)
            OR
            (@lot_no IS NOT NULL AND l.lot_no = @lot_no)
        )
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_mc_gauging_f1]
    @tag_id        VARCHAR(50),
    @location_name VARCHAR(100) = NULL
AS BEGIN
    SET NOCOUNT ON;

    DECLARE @lot_no    VARCHAR(15)
    DECLARE @status_id INT

    SELECT @lot_no = lot_no, @status_id = status_id
    FROM tb_assy_lot WHERE tag_id = @tag_id

    IF @lot_no IS NULL
    BEGIN SELECT 'TAG_NOT_FOUND' AS result RETURN END

    IF @status_id != 2
    BEGIN SELECT 'INVALID_PROCESS' AS result RETURN END

    IF NOT EXISTS (SELECT 1 FROM tb_master_assy_status WHERE id = 3)
    BEGIN SELECT 'INVALID_STATUS' AS result RETURN END

    UPDATE tb_assy_lot SET
        status_id     = 3,
        location_name = @location_name,
        updated_at    = GETDATE()
    WHERE tag_id = @tag_id

    INSERT INTO tb_assy_log (lot_no, tag_id, event_type, location_name)
    VALUES (@lot_no, @tag_id, 'MC_GAUGING_F1', @location_name)

    SELECT 'OK' AS result
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_mock_done_delete]
    @lot_no VARCHAR(15)
AS BEGIN
    SET NOCOUNT ON;
    DELETE FROM tb_assy_mock_done WHERE lot_no = @lot_no
    SELECT 'OK' AS result
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_mock_done_insert]
    @lot_no VARCHAR(15)
AS BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM tb_assy_mock_done WHERE lot_no = @lot_no)
    BEGIN
        SELECT 'ALREADY_EXISTS' AS result
        RETURN
    END
    INSERT INTO tb_assy_mock_done (lot_no) VALUES (@lot_no)
    SELECT 'OK' AS result
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_mock_done_select]
AS BEGIN
    SET NOCOUNT ON;
    SELECT * FROM tb_assy_mock_done ORDER BY created_at DESC
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_assy_register]
    @lot_no        VARCHAR(15),
    @wos           VARCHAR(10),
    @brg_type      VARCHAR(30),
    @spec          VARCHAR(15),
    @qty           INT,
    @tag_id        VARCHAR(50),
    @location_name VARCHAR(100) = NULL
AS BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM tb_master_assy_status WHERE id = 1)
    BEGIN SELECT 'INVALID_STATUS' AS result RETURN END

    IF EXISTS (SELECT 1 FROM tb_assy_lot WHERE lot_no = @lot_no)
    BEGIN SELECT 'LOT_ALREADY_EXISTS' AS result RETURN END

    IF EXISTS (SELECT 1 FROM tb_assy_lot WHERE tag_id = @tag_id AND status_id != 4)
    BEGIN SELECT 'TAG_IN_USE' AS result RETURN END

    IF NOT EXISTS (SELECT 1 FROM tb_assy_wos WHERE wos = @wos)
        INSERT INTO tb_assy_wos (wos, brg_type, spec)
        VALUES (@wos, @brg_type, @spec)

    INSERT INTO tb_assy_lot (lot_no, wos, qty, tag_id, status_id, location_name)
    VALUES (@lot_no, @wos, @qty, @tag_id, 1, @location_name)

    INSERT INTO tb_assy_tag (tag_id, lot_no, status)
    VALUES (@tag_id, @lot_no, 'active')

    INSERT INTO tb_assy_log (lot_no, tag_id, event_type, location_name, remark)
    VALUES (@lot_no, @tag_id, 'REGISTER', @location_name, 'Tag registered')

    SELECT 'OK' AS result
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_master_assy_status_delete]
	@id int
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
	DELETE FROM tb_master_assy_status WHERE id = @id
	SELECT 'OK' AS result
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS result
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_master_assy_status_insert]
    @status       VARCHAR(50),
    @label_status VARCHAR(50),
    @process_id   INT = NULL
AS BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO tb_master_assy_status (status, label_status, process_id)
        VALUES (@status, @label_status, @process_id)
        SELECT 'OK' AS result
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS result
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_master_assy_status_select]
AS BEGIN
    SET NOCOUNT ON;
    SELECT s.id, s.status, s.label_status, s.process_id, p.process_code, p.process_name
    FROM tb_master_assy_status s
    LEFT JOIN tb_master_process p ON p.id = s.process_id
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_master_assy_status_update]
    @id           INT,
    @status       VARCHAR(50),
    @label_status VARCHAR(50),
    @process_id   INT = NULL
AS BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE tb_master_assy_status SET
            status       = @status,
            label_status = @label_status,
            process_id   = @process_id
        WHERE id = @id
        SELECT 'OK' AS result
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS result
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_master_process_delete]
    @id INT
AS BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DELETE FROM tb_master_process WHERE id = @id
        SELECT 'OK' AS result
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS result
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_master_process_insert]
    @process_code VARCHAR(10),
    @process_name VARCHAR(50)
AS BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO tb_master_process (process_code, process_name)
        VALUES (@process_code, @process_name)
        SELECT 'OK' AS result
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS result
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_master_process_select]
AS BEGIN
    SET NOCOUNT ON;
    SELECT id, process_code, process_name FROM tb_master_process
END
GO

CREATE PROCEDURE [dbo].[Stored_tb_master_process_update]
    @id           INT,
    @process_code VARCHAR(50),
    @process_name VARCHAR(100)
AS BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE tb_master_process SET
            process_code = @process_code,
            process_name = @process_name
        WHERE id = @id
        SELECT 'OK' AS result
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS result
    END CATCH
END
GO

-- =====================================================================
-- 3. Seed master tables — PLACEHOLDER VALUES.
--    Run this against your PROD db_rfid_assembly first to get the real
--    rows, then replace the INSERTs below before running against dev:
--
--        SELECT id, process_code, process_name FROM tb_master_process ORDER BY id;
--        SELECT id, status, label_status, process_id FROM tb_master_assy_status ORDER BY id;
--
--    The status IDs (1-4) themselves must stay exactly as-is — processService
--    (Phase 5) and the frozen Python client hard-code this order:
--    1=bf_issue, 2=gr_f1, 3=mc_f1, 4=completed.
-- =====================================================================

SET IDENTITY_INSERT tb_master_process ON;
INSERT INTO tb_master_process (id, process_code, process_name) VALUES
    (1, 'REPLACE_ME', 'REPLACE_ME'),
    (2, 'REPLACE_ME', 'REPLACE_ME');
SET IDENTITY_INSERT tb_master_process OFF;

SET IDENTITY_INSERT tb_master_assy_status ON;
INSERT INTO tb_master_assy_status (id, status, label_status, process_id) VALUES
    (1, 'bf_issue',  'REPLACE_ME', 1),
    (2, 'gr_f1',     'REPLACE_ME', 1),
    (3, 'mc_f1',     'REPLACE_ME', 2),
    (4, 'completed', 'REPLACE_ME', 2);
SET IDENTITY_INSERT tb_master_assy_status OFF;
GO

-- =====================================================================
-- 4. Confirm
-- =====================================================================
SELECT COUNT(*) AS process_count FROM tb_master_process;  -- expect 2
SELECT COUNT(*) AS status_count FROM tb_master_assy_status; -- expect 4
GO
