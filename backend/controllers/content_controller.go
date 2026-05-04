package controllers

import (
	"loveCharity/backend/database"
	"loveCharity/backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required"`
	Type string `json:"type" binding:"required"`
	Sort int    `json:"sort"`
}

type UpdateCategoryRequest struct {
	Name   string `json:"name"`
	Type   string `json:"type"`
	Sort   int    `json:"sort"`
	Status int    `json:"status"`
}

func CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	category := &models.Category{
		Name:   req.Name,
		Type:   req.Type,
		Sort:   req.Sort,
		Status: 1,
	}

	if err := models.CreateCategory(database.DB, category); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "创建失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "创建成功",
		"data": category,
	})
}

func GetCategoryList(c *gin.Context) {
	cType := c.Query("type")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "100"))

	if page < 1 {
		page = 1
	}

	categories, total, err := models.GetCategoryList(database.DB, cType, page, pageSize)
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
			"list":  categories,
			"total": total,
		},
	})
}

func UpdateCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	var req UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	category, err := models.GetCategoryByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "分类不存在",
		})
		return
	}

	if req.Name != "" {
		category.Name = req.Name
	}
	if req.Type != "" {
		category.Type = req.Type
	}
	if req.Sort >= 0 {
		category.Sort = req.Sort
	}
	category.Status = req.Status

	if err := models.UpdateCategory(database.DB, category); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "更新失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "更新成功",
		"data": category,
	})
}

func DeleteCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	category, err := models.GetCategoryByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "分类不存在",
		})
		return
	}

	database.DB.Delete(category)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "删除成功",
	})
}

type CreateNewsRequest struct {
	Title       string `json:"title" binding:"required"`
	CategoryID  uint   `json:"category_id"`
	Content     string `json:"content"`
	Cover       string `json:"cover"`
	Description string `json:"description"`
	Author      string `json:"author"`
}

func CreateNews(c *gin.Context) {
	var req CreateNewsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	news := &models.News{
		Title:       req.Title,
		CategoryID:  req.CategoryID,
		Content:     req.Content,
		Cover:       req.Cover,
		Description: req.Description,
		Author:      req.Author,
		Status:      1,
	}

	if err := models.CreateNews(database.DB, news); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "创建失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "创建成功",
		"data": news,
	})
}

func GetNewsList(c *gin.Context) {
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

	newsList, total, err := models.GetNewsList(database.DB, uint(categoryID), keyword, page, pageSize)
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
			"list":      newsList,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetNewsDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	news, err := models.GetNewsByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "新闻不存在",
		})
		return
	}

	models.IncreaseViews(database.DB, uint(id))

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "获取成功",
		"data": news,
	})
}

func UpdateNews(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的ID",
		})
		return
	}

	var req CreateNewsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	news, err := models.GetNewsByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "新闻不存在",
		})
		return
	}

	if req.Title != "" {
		news.Title = req.Title
	}
	news.CategoryID = req.CategoryID
	if req.Content != "" {
		news.Content = req.Content
	}
	if req.Cover != "" {
		news.Cover = req.Cover
	}
	if req.Description != "" {
		news.Description = req.Description
	}
	if req.Author != "" {
		news.Author = req.Author
	}

	if err := models.UpdateNews(database.DB, news); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "更新失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "更新成功",
		"data": news,
	})
}

func UpdateNewsStatus(c *gin.Context) {
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

	news, err := models.GetNewsByID(database.DB, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "新闻不存在",
		})
		return
	}

	news.Status = req.Status
	if err := models.UpdateNews(database.DB, news); err != nil {
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
