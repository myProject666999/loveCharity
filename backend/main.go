package main

import (
	"log"
	"loveCharity/backend/config"
	"loveCharity/backend/database"
	"loveCharity/backend/models"
	"loveCharity/backend/routes"
	"loveCharity/backend/utils"

	"github.com/jinzhu/gorm"
)

func main() {
	config.InitConfig()

	database.InitDB()
	defer database.CloseDB()

	runMigrations()

	createDefaultAdmin()

	r := routes.SetupRoutes()

	port := config.AppConfig.ServerPort
	log.Printf("Server starting on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func runMigrations() {
	db := database.DB

	db.AutoMigrate(
		&models.User{},
		&models.Admin{},
		&models.Category{},
		&models.News{},
		&models.Notice{},
		&models.Banner{},
		&models.Activity{},
		&models.ActivityApply{},
		&models.Forum{},
		&models.ForumComment{},
		&models.Favorite{},
		&models.Message{},
	)

	log.Println("Database migrations completed")
}

func createDefaultAdmin() {
	db := database.DB

	var admin models.Admin
	if err := db.Where("username = ?", "admin").First(&admin).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			hashedPassword, err := utils.HashPassword("admin123")
			if err != nil {
				log.Printf("Failed to hash default admin password: %v", err)
				return
			}

			defaultAdmin := &models.Admin{
				Username: "admin",
				Password: hashedPassword,
				Nickname: "超级管理员",
				Role:     "admin",
				Status:   1,
			}

			if err := db.Create(defaultAdmin).Error; err != nil {
				log.Printf("Failed to create default admin: %v", err)
				return
			}

			log.Println("Default admin created: username=admin, password=admin123")
		}
	}
}
