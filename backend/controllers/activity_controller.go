package controllers

import (
	"loveCharity/backend/database"
	"loveCharity/backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateActivityRequest struct {
	Title      string `json:"title" binding:"required"`
	CategoryID uint   `json:"category_id"`
	Content    string `json:"content"`
	Cover      string `json:"cover"`
	Location   string `json:"location"`
	StartTime  string `json:"start_time"`
	EndTime    string `json:"end_time"`
	MaxPeople  int    `json:"max_people"`
}

func CreateActivity(c *gin.Context) {
	var req CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	var startTime, endTime time.Time
	var err error
	if req.StartTime != "" {
		startTime, err = time.Parse("2006-01-02 15:04:05", req.StartTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"code": 400,
				"msg":  "开始时间格式错误，格式应为：2006-01-02 15:04:05",
			})
			return
		}
	}
	if req.EndTime != "" {
		endTime, err = time.Parse("2006-01-02 15:04:05", req.EndTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"code": 400,
				"msg":  "结束时间格式错误，格式应为：2006-01-02 15:04:05",
			})
			return
		}
	}

	activity := &models.Activity{
		Title:      req.Title,
		CategoryID: req.CategoryID,
		Content:    req.Content,
		Cover:      req.Cover,
		Location:   req.Location,
		StartTime:  startTime,
		EndTime:    endTime,
		MaxPeople:  req.MaxPeople,
		Status:     1,
	}

	if err := models.CreateActivity(database.DB, activity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "创建失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "创建成功",
		"data": activity,
	})
}

func GetActivityList(c *gin.Context) {
	categoryID, _ := strconv.Atoi(c.Query("category_id"))
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	activities, total, err := models.GetActivityList(database.DB, uint(categoryID), status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "获取列表失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "获取成功",
		"data": gin.H{
			"list":      activities,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetActivityDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	activity, err := models.GetActivityByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "活动不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "获取成功",
		"data": activity,
	})
}

func UpdateActivity(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	var req CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	activity, err := models.GetActivityByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "活动不存在",
		})
		return
	}

	if req.Title != "" {
		activity.Title = req.Title
	}
	activity.CategoryID = req.CategoryID
	if req.Content != "" {
		activity.Content = req.Content
	}
	if req.Cover != "" {
		activity.Cover = req.Cover
	}
	if req.Location != "" {
		activity.Location = req.Location
	}
	if req.StartTime != "" {
		startTime, _ := time.Parse("2006-01-02 15:04:05", req.StartTime)
		activity.StartTime = startTime
	}
	if req.EndTime != "" {
		endTime, _ := time.Parse("2006-01-02 15:04:05", req.EndTime)
		activity.EndTime = endTime
	}
	if req.MaxPeople >= 0 {
		activity.MaxPeople = req.MaxPeople
	}

	if err := models.UpdateActivity(database.DB, activity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "更新失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "更新成功",
		"data": activity,
	})
}

func UpdateActivityStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	var req struct {
		Status int `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误",
		})
		return
	}

	activity, err := models.GetActivityByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "活动不存在",
		})
		return
	}

	activity.Status = req.Status
	if err := models.UpdateActivity(database.DB, activity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "更新失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "更新成功",
	})
}

type ActivityApplyRequest struct {
	ActivityID uint   `json:"activity_id" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Phone      string `json:"phone" binding:"required"`
	Reason     string `json:"reason"`
}

func ApplyActivity(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req ActivityApplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	activity, err := models.GetActivityByID(database.DB, req.ActivityID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "活动不存在",
		})
		return
	}

	if activity.Status != 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "活动不可报名",
		})
		return
	}

	_, err = models.GetActivityApplyByUserAndActivity(database.DB, userID, req.ActivityID)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "已报名该活动",
		})
		return
	}

	if activity.MaxPeople > 0 && activity.JoinedCount >= activity.MaxPeople {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "活动报名人数已满",
		})
		return
	}

	apply := &models.ActivityApply{
		ActivityID: req.ActivityID,
		UserID:     userID,
		Name:       req.Name,
		Phone:      req.Phone,
		Reason:     req.Reason,
		Status:     0,
	}

	if err := models.CreateActivityApply(database.DB, apply); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "报名失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "报名成功，请等待审核",
		"data": apply,
	})
}

func GetApplyList(c *gin.Context) {
	userID := c.GetUint("user_id")
	activityID, _ := strconv.Atoi(c.Query("activity_id"))
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}

	applies, total, err := models.GetActivityApplyList(database.DB, uint(activityID), userID, status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "获取列表失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "获取成功",
		"data": gin.H{
			"list":      applies,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetAdminApplyList(c *gin.Context) {
	activityID, _ := strconv.Atoi(c.Query("activity_id"))
	userID, _ := strconv.Atoi(c.Query("user_id"))
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}

	applies, total, err := models.GetActivityApplyList(database.DB, uint(activityID), uint(userID), status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "获取列表失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "获取成功",
		"data": gin.H{
			"list":      applies,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func AuditActivityApply(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	var req struct {
		Status int    `json:"status" binding:"required"`
		Remark string `json:"remark"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	apply, err := models.GetActivityApplyByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "报名记录不存在",
		})
		return
	}

	if apply.Status != 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "该报名已审核",
		})
		return
	}

	apply.Status = req.Status
	apply.Remark = req.Remark

	if err := models.UpdateActivityApply(database.DB, apply); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "审核失败",
		})
		return
	}

	if req.Status == 1 {
		models.IncreaseJoinedCount(database.DB, apply.ActivityID)
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "审核成功",
	})
}
