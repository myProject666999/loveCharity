package controllers

import (
	"loveCharity/backend/database"
	"loveCharity/backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateForumRequest struct {
	Title      string `json:"title" binding:"required"`
	CategoryID uint   `json:"category_id"`
	Content    string `json:"content"`
	Cover      string `json:"cover"`
}

func CreateForum(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CreateForumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	forum := &models.Forum{
		UserID:     userID,
		Title:      req.Title,
		CategoryID: req.CategoryID,
		Content:    req.Content,
		Cover:      req.Cover,
		Status:     1,
	}

	if err := models.CreateForum(database.DB, forum); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "发布失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "发布成功",
		"data": forum,
	})
}

func GetForumList(c *gin.Context) {
	userID, _ := strconv.Atoi(c.Query("user_id"))
	categoryID, _ := strconv.Atoi(c.Query("category_id"))
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	forums, total, err := models.GetForumList(database.DB, uint(userID), uint(categoryID), keyword, page, pageSize)
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
			"list":      forums,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetForumDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	forum, err := models.GetForumByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "帖子不存在",
		})
		return
	}

	models.IncreaseForumViews(database.DB, uint(id))

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "获取成功",
		"data": forum,
	})
}

func UpdateForum(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	var req CreateForumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	forum, err := models.GetForumByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "帖子不存在",
		})
		return
	}

	if forum.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"code": 403,
			"msg":  "无权限修改",
		})
		return
	}

	if req.Title != "" {
		forum.Title = req.Title
	}
	forum.CategoryID = req.CategoryID
	if req.Content != "" {
		forum.Content = req.Content
	}
	if req.Cover != "" {
		forum.Cover = req.Cover
	}

	if err := models.UpdateForum(database.DB, forum); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "更新失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "更新成功",
		"data": forum,
	})
}

func UpdateForumStatus(c *gin.Context) {
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

	forum, err := models.GetForumByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "帖子不存在",
		})
		return
	}

	forum.Status = req.Status
	if err := models.UpdateForum(database.DB, forum); err != nil {
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

type CreateCommentRequest struct {
	ForumID  uint   `json:"forum_id" binding:"required"`
	Content  string `json:"content" binding:"required"`
	ParentID uint   `json:"parent_id"`
}

func CreateComment(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	forum, err := models.GetForumByID(database.DB, req.ForumID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "帖子不存在",
		})
		return
	}

	if forum.Status != 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "该帖子已被关闭",
		})
		return
	}

	comment := &models.ForumComment{
		ForumID:  req.ForumID,
		UserID:   userID,
		Content:  req.Content,
		ParentID: req.ParentID,
	}

	if err := models.CreateForumComment(database.DB, comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "评论失败: " + err.Error(),
		})
		return
	}

	models.IncreaseForumComments(database.DB, req.ForumID)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "评论成功",
		"data": comment,
	})
}

func GetCommentList(c *gin.Context) {
	forumID, _ := strconv.Atoi(c.Query("forum_id"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}

	if forumID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "缺少帖子ID",
		})
		return
	}

	comments, total, err := models.GetForumCommentList(database.DB, uint(forumID), page, pageSize)
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
			"list":      comments,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}
