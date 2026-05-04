package controllers

import (
	"loveCharity/backend/database"
	"loveCharity/backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ToggleFavoriteRequest struct {
	Type     string `json:"type" binding:"required"`
	TargetID uint   `json:"target_id" binding:"required"`
}

func ToggleFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req ToggleFavoriteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	isFavorited, err := models.IsFavorited(database.DB, userID, req.Type, req.TargetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "查询失败: " + err.Error(),
		})
		return
	}

	if isFavorited {
		if err := models.DeleteFavorite(database.DB, userID, req.Type, req.TargetID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code": 500,
				"msg":  "取消收藏失败: " + err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"code": 200,
			"msg":  "取消收藏成功",
			"data": gin.H{
				"is_favorited": false,
			},
		})
	} else {
		favorite := &models.Favorite{
			UserID:   userID,
			Type:     req.Type,
			TargetID: req.TargetID,
		}
		if err := models.CreateFavorite(database.DB, favorite); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code": 500,
				"msg":  "收藏失败: " + err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"code": 200,
			"msg":  "收藏成功",
			"data": gin.H{
				"is_favorited": true,
			},
		})
	}
}

func GetFavoriteList(c *gin.Context) {
	userID := c.GetUint("user_id")
	fType := c.Query("type")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}

	favorites, total, err := models.GetFavoriteList(database.DB, userID, fType, page, pageSize)
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
			"list":      favorites,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func CheckFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	fType := c.Query("type")
	targetIDStr := c.Query("target_id")

	if fType == "" || targetIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误",
		})
		return
	}

	targetID, _ := strconv.ParseUint(targetIDStr, 10, 64)

	isFavorited, err := models.IsFavorited(database.DB, userID, fType, uint(targetID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "查询失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "获取成功",
		"data": gin.H{
			"is_favorited": isFavorited,
		},
	})
}
