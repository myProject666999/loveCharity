package routes

import (
	"loveCharity/backend/controllers"
	"loveCharity/backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		userGroup := api.Group("/user")
		{
			userGroup.POST("/register", controllers.Register)
			userGroup.POST("/login", controllers.Login)

			userAuth := userGroup.Group("")
			userAuth.Use(middleware.JWTAuth())
			{
				userAuth.GET("/info", controllers.GetUserInfo)
				userAuth.PUT("/info", controllers.UpdateUserInfo)
				userAuth.PUT("/password", controllers.ChangePassword)
			}
		}

		adminGroup := api.Group("/admin")
		{
			adminGroup.POST("/login", controllers.AdminLogin)

			adminAuth := adminGroup.Group("")
			adminAuth.Use(middleware.JWTAuth(), middleware.AdminAuth())
			{
				adminAuth.GET("/info", controllers.GetAdminInfo)
				adminAuth.POST("/create", controllers.CreateAdmin)
				adminAuth.GET("/list", controllers.GetAdminList)
				adminAuth.PUT("/status/:id", controllers.UpdateAdminStatus)
				adminAuth.PUT("/password", controllers.UpdateAdminPassword)

				adminAuth.GET("/users", controllers.GetUserList)
				adminAuth.PUT("/user/status/:id", controllers.UpdateUserStatus)

				adminAuth.POST("/category", controllers.CreateCategory)
				adminAuth.GET("/categories", controllers.GetCategoryList)
				adminAuth.PUT("/category/:id", controllers.UpdateCategory)
				adminAuth.DELETE("/category/:id", controllers.DeleteCategory)

				adminAuth.POST("/news", controllers.CreateNews)
				adminAuth.GET("/news", controllers.GetNewsList)
				adminAuth.PUT("/news/:id", controllers.UpdateNews)
				adminAuth.PUT("/news/status/:id", controllers.UpdateNewsStatus)

				adminAuth.POST("/notice", controllers.CreateNotice)
				adminAuth.GET("/notices", controllers.GetNoticeList)
				adminAuth.PUT("/notice/:id", controllers.UpdateNotice)
				adminAuth.PUT("/notice/status/:id", controllers.UpdateNoticeStatus)

				adminAuth.POST("/banner", controllers.CreateBanner)
				adminAuth.GET("/banners", controllers.GetBannerList)
				adminAuth.PUT("/banner/:id", controllers.UpdateBanner)
				adminAuth.PUT("/banner/status/:id", controllers.UpdateBannerStatus)

				adminAuth.POST("/activity", controllers.CreateActivity)
				adminAuth.GET("/activities", controllers.GetActivityList)
				adminAuth.PUT("/activity/:id", controllers.UpdateActivity)
				adminAuth.PUT("/activity/status/:id", controllers.UpdateActivityStatus)
				adminAuth.GET("/applies", controllers.GetAdminApplyList)
				adminAuth.PUT("/apply/audit/:id", controllers.AuditActivityApply)

				adminAuth.GET("/forums", controllers.GetForumList)
				adminAuth.PUT("/forum/status/:id", controllers.UpdateForumStatus)

				adminAuth.GET("/messages", controllers.GetAdminMessageList)
				adminAuth.POST("/message/reply/:id", controllers.ReplyMessage)
			}
		}

		publicGroup := api.Group("/public")
		{
			publicGroup.GET("/banners", controllers.GetBannerList)
			publicGroup.GET("/categories", controllers.GetCategoryList)

			publicGroup.GET("/news", controllers.GetNewsList)
			publicGroup.GET("/news/:id", controllers.GetNewsDetail)

			publicGroup.GET("/notices", controllers.GetNoticeList)
			publicGroup.GET("/notice/:id", controllers.GetNoticeDetail)

			publicGroup.GET("/activities", controllers.GetActivityList)
			publicGroup.GET("/activity/:id", controllers.GetActivityDetail)

			publicGroup.GET("/forums", controllers.GetForumList)
			publicGroup.GET("/forum/:id", controllers.GetForumDetail)
			publicGroup.GET("/comments", controllers.GetCommentList)
		}

		authGroup := api.Group("")
		authGroup.Use(middleware.JWTAuth())
		{
			authGroup.POST("/activity/apply", controllers.ApplyActivity)
			authGroup.GET("/my/applies", controllers.GetApplyList)

			authGroup.POST("/forum", controllers.CreateForum)
			authGroup.PUT("/forum/:id", controllers.UpdateForum)
			authGroup.POST("/comment", controllers.CreateComment)

			authGroup.POST("/message", controllers.CreateMessage)
			authGroup.GET("/my/messages", controllers.GetMessageList)

			authGroup.POST("/favorite", controllers.ToggleFavorite)
			authGroup.GET("/favorites", controllers.GetFavoriteList)
			authGroup.GET("/favorite/check", controllers.CheckFavorite)
		}
	}

	return r
}
