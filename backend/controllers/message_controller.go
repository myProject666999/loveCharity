package controllers

import (
	"loveCharity/backend/database"
	"loveCharity/backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateMessageRequest struct {
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Content string `json:"content" binding:"required"`
}

func CreateMessage(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CreateMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	message := &models.Message{
		UserID:  userID,
		Name:    req.Name,
		Phone:   req.Phone,
		Email:   req.Email,
		Content: req.Content,
		Status:  0,
	}

	if err := models.CreateMessage(database.DB, message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "提交失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "提交成功",
		"data": message,
	})
}

func GetMessageList(c *gin.Context) {
	userID := c.GetUint("user_id")
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}

	messages, total, err := models.GetMessageList(database.DB, userID, status, page, pageSize)
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
			"list":      messages,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetAdminMessageList(c *gin.Context) {
	userID, _ := strconv.Atoi(c.Query("user_id"))
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}

	messages, total, err := models.GetMessageList(database.DB, uint(userID), status, page, pageSize)
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
			"list":      messages,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func ReplyMessage(c *gin.Context) {
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
		Reply string `json:"reply"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	message, err := models.GetMessageByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "留言不存在",
		})
		return
	}

	message.Reply = req.Reply
	message.Status = 1

	if err := models.UpdateMessage(database.DB, message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "回复失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "回复成功",
	})
}
